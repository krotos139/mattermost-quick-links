package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
)

// reconcileCommands diffs the previously-registered slash commands against
// the current item list and registers/unregisters as needed. Safe to call
// from OnActivate (no previous state) and from OnConfigurationChange (real
// diff). Run under p.commandsLock.
func (p *Plugin) reconcileCommands(items []Item) {
	wanted := make(map[string]Item, len(items))
	for _, it := range items {
		if !it.Enabled {
			continue
		}
		wanted[it.SlashTrigger] = it
	}

	p.commandsLock.Lock()
	previous := p.registeredCommands
	p.registeredCommands = wanted
	p.commandsLock.Unlock()

	// Unregister any trigger that was registered before but is no longer
	// present (or is now disabled).
	for trigger := range previous {
		if _, kept := wanted[trigger]; kept {
			continue
		}
		if err := p.API.UnregisterCommand("", trigger); err != nil {
			p.API.LogWarn("UnregisterCommand failed", "trigger", trigger, "err", err.Error())
		}
	}

	// (Re-)register everything in the wanted set. RegisterCommand replaces
	// any existing command with the same trigger, so re-registering on each
	// reconcile is harmless and means edits to e.g. autocomplete text take
	// effect without an extra unregister hop.
	for trigger, it := range wanted {
		cmd := &model.Command{
			Trigger:          trigger,
			AutoComplete:     true,
			AutoCompleteDesc: fmt.Sprintf("Show a link to open %s", it.DisplayName),
			DisplayName:      it.DisplayName,
		}
		if err := p.API.RegisterCommand(cmd); err != nil {
			p.API.LogError("RegisterCommand failed", "trigger", trigger, "err", err.Error())
		}
	}
}

// unregisterAllCommands tears down every slash command we own. Called from
// OnDeactivate so the host doesn't end up advertising autocomplete entries
// pointing at a plugin that no longer handles them.
func (p *Plugin) unregisterAllCommands() {
	p.commandsLock.Lock()
	previous := p.registeredCommands
	p.registeredCommands = map[string]Item{}
	p.commandsLock.Unlock()

	for trigger := range previous {
		if err := p.API.UnregisterCommand("", trigger); err != nil {
			p.API.LogWarn("UnregisterCommand failed during deactivate", "trigger", trigger, "err", err.Error())
		}
	}
}

// ExecuteCommand handles every slash command we registered. The user gets an
// ephemeral message with a markdown link to the configured URL — visible only
// to them, attributed to our bot (so it doesn't look like the user posted a
// link to themselves), and auto-deleted after EphemeralTTLSec seconds if set.
func (p *Plugin) ExecuteCommand(_ *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	fields := strings.Fields(args.Command)
	if len(fields) == 0 {
		return &model.CommandResponse{}, nil
	}
	trigger := strings.TrimPrefix(fields[0], "/")

	p.commandsLock.RLock()
	item, ok := p.registeredCommands[trigger]
	p.commandsLock.RUnlock()
	if !ok {
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         fmt.Sprintf("Unknown Web Frames command: /%s", trigger),
		}, nil
	}

	post := &model.Post{
		UserId:    p.botUserID,
		ChannelId: args.ChannelId,
		Message:   fmt.Sprintf("[Open %s](%s) ↗", item.DisplayName, item.URL),
	}
	// Fall back to attributing the post to the user if the bot is not yet
	// available (shouldn't happen post-OnActivate, but defensive).
	if post.UserId == "" {
		post.UserId = args.UserId
	}

	sent := p.API.SendEphemeralPost(args.UserId, post)
	if sent != nil && item.EphemeralTTLSec > 0 {
		ttl := time.Duration(item.EphemeralTTLSec) * time.Second
		userID := args.UserId
		postID := sent.Id
		go func() {
			time.Sleep(ttl)
			p.API.DeleteEphemeralPost(userID, postID)
		}()
	}

	// Empty response — the visible reply is the SendEphemeralPost above. If
	// we returned a CommandResponse with text, it would render twice.
	return &model.CommandResponse{}, nil
}
