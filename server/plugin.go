package main

import (
	"sync"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/pkg/errors"
)

// Plugin is the entry point that the Mattermost server uses to talk to this
// plugin process. Two responsibilities live on this side:
//
//   - serve /api/v1/items so the webapp can read the configured items at any
//     time (Redux state does not surface PluginSettings to non-admins);
//   - register one slash command per item and dispatch them in ExecuteCommand.
type Plugin struct {
	plugin.MattermostPlugin

	client *pluginapi.Client
	router *mux.Router

	// botUserID is the system bot under whose name we send ephemeral messages
	// from slash commands. Resolved once in OnActivate.
	botUserID string

	// registeredCommands tracks which slash command triggers we own, keyed by
	// trigger (without the leading slash). Used by reconcileCommands to diff
	// against the new config and by ExecuteCommand to look up an item.
	commandsLock       sync.RWMutex
	registeredCommands map[string]Item

	configurationLock sync.RWMutex
	configuration     *configuration
}

func (p *Plugin) OnActivate() error {
	p.client = pluginapi.NewClient(p.API, p.Driver)
	p.router = p.initRouter()

	p.commandsLock.Lock()
	p.registeredCommands = map[string]Item{}
	p.commandsLock.Unlock()

	botID, err := p.client.Bot.EnsureBot(&model.Bot{
		Username:    "webframes",
		DisplayName: "Web Frames",
		Description: "Posts links to admin-configured web frames in response to slash commands.",
	})
	if err != nil {
		return errors.Wrap(err, "failed to ensure Web Frames bot")
	}
	p.botUserID = botID

	// Initial reconcile from whatever config is already loaded. Subsequent
	// changes flow through OnConfigurationChange.
	p.reconcileCommands(ParseItems(p.getConfiguration().Items))

	return nil
}

func (p *Plugin) OnDeactivate() error {
	p.unregisterAllCommands()
	return nil
}
