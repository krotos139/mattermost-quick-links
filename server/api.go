package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost/server/public/plugin"
)

// initRouter sets up HTTP handlers exposed under
//
//	<siteUrl>/plugins/com.frame.webframes/api/v1/...
//
// The webapp fetches /api/v1/items at initialize() time to learn which
// products to register. We can't read that list from Redux state because
// PluginSettings.Plugins is only present in admin-loaded state and only after
// the System Console has been opened — so an HTTP round-trip is the only path
// available to a normal user's webapp on first paint.
func (p *Plugin) initRouter() *mux.Router {
	router := mux.NewRouter()
	router.Use(p.MattermostAuthorizationRequired)
	api := router.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/items", p.handleListItems).Methods(http.MethodGet)
	return router
}

func (p *Plugin) ServeHTTP(_ *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.router.ServeHTTP(w, r)
}

func (p *Plugin) MattermostAuthorizationRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Mattermost-User-ID") == "" {
			http.Error(w, "Not authorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// handleListItems returns the JSON array stored under the Items config field.
// We pass the string through as-is rather than re-marshaling — the webapp
// already has the validation/coercion layer (parseItems), and round-tripping
// through a Go struct here would just be a second place to keep the schema in
// sync.
//
// Items are not secret (they are just labels + URLs that show in the menu),
// so any logged-in user is allowed to read them.
func (p *Plugin) handleListItems(w http.ResponseWriter, _ *http.Request) {
	cfg := p.getConfiguration()
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	body := cfg.Items
	if body == "" {
		body = "[]"
	}
	if _, err := w.Write([]byte(body)); err != nil {
		p.API.LogError("failed to write items response", "err", err)
	}
}
