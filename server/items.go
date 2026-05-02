package main

import (
	"encoding/json"
	"strings"
)

// Item mirrors the WebframeItem TypeScript type. The webapp serialises a list
// of these as a single JSON string into the plugin's `Items` config field, and
// the server parses them back here when registering slash commands.
type Item struct {
	ID              string `json:"id"`
	DisplayName     string `json:"displayName"`
	SlashTrigger    string `json:"slashTrigger"`
	URL             string `json:"url"`
	OpenMode        string `json:"openMode"`
	IconDataURL     string `json:"iconDataUrl"`
	EphemeralTTLSec int    `json:"ephemeralTtlSec"`
	Enabled         bool   `json:"enabled"`
}

// ParseItems is permissive: any malformed entries are silently dropped so a
// fat-fingered admin save never breaks slash command dispatch entirely.
func ParseItems(raw string) []Item {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	var items []Item
	if err := json.Unmarshal([]byte(raw), &items); err != nil {
		return nil
	}
	out := items[:0]
	for _, it := range items {
		if it.SlashTrigger == "" || it.URL == "" {
			continue
		}
		out = append(out, it)
	}
	return out
}
