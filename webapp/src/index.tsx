// Web Frames — Mattermost plugin
// See https://developers.mattermost.com/extend/plugins/webapp/reference/

import React from 'react';

import manifest from 'manifest';
import type {Store} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import type {PluginRegistry} from 'types/mattermost-webapp';

import ExternalRedirect from './components/external_redirect';
import IframeView from './components/iframe_view';
import ProductHeaderTitle from './components/product_header_title';
import ItemsEditor from './components/settings/items_editor';
import {parseItems, type WebframeItem} from './types/item';
import {iconClassName, setIconStyles} from './utils/icon_css';

const PLUGIN_ID = manifest.id;
const DEFAULT_ICON = 'globe';
const ITEMS_URL = `/plugins/${PLUGIN_ID}/api/v1/items`;

function registerOne(registry: PluginRegistry, item: WebframeItem) {
    if (!item.enabled) {
        return;
    }

    // baseURL must be a single path segment — Boards and Playbooks both
    // register with single-segment routes (`/boards`, `/playbooks`) and the
    // host's product router does not appear to handle multi-segment matches
    // cleanly. The `wf-` prefix avoids collisions with channel names, team
    // names, and built-in routes.
    const baseURL = `/wf-${item.id}`;

    // Icon resolution priority:
    //   1. iconPreset (a compass-icons name) → passed verbatim, no CSS work
    //   2. iconDataUrl (custom upload) → synthetic class wired by setIconStyles
    //   3. fall back to the default 'globe' compass icon
    let switcherIcon: string;
    if (item.iconPreset) {
        switcherIcon = item.iconPreset;
    } else if (item.iconDataUrl) {
        switcherIcon = iconClassName(item.id);
    } else {
        switcherIcon = DEFAULT_ICON;
    }

    // For "open in new window" mode we keep switcherLinkURL pointing at our
    // baseURL (so the host's router stays happy and does not reload the UI),
    // and have mainComponent open the external URL on mount and pop history.
    // Setting switcherLinkURL to the external URL directly does NOT work —
    // the host treats it as an internal route and just reloads.
    const Main: React.FC = item.openMode === 'newWindow' ?
        () => <ExternalRedirect url={item.url} title={item.displayName}/> :
        () => <IframeView url={item.url} title={item.displayName}/>;
    const Header: React.FC = () => <ProductHeaderTitle title={item.displayName}/>;
    Main.displayName = `WebframeMain[${item.id}]`;
    Header.displayName = `WebframeHeader[${item.id}]`;

    registry.registerProduct(
        baseURL,
        switcherIcon,
        item.displayName,
        baseURL,
        Main,
        Header,
        () => null,
        true,
    );
}

async function fetchItems(): Promise<WebframeItem[]> {
    // PluginSettings.Plugins is not in a regular user's Redux state — we have
    // to ask the server. The endpoint is auth-required (any logged-in user)
    // and returns the raw config string, which parseItems coerces into
    // well-formed WebframeItem objects.
    const res = await fetch(ITEMS_URL, {
        credentials: 'include',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    });
    if (!res.ok) {
        throw new Error(`GET ${ITEMS_URL} failed: ${res.status}`);
    }
    const text = await res.text();
    return parseItems(text);
}

export default class Plugin {
    public async initialize(registry: PluginRegistry, _store: Store<GlobalState>) {
        // 1. Admin console editor.
        registry.registerAdminConsoleCustomSetting(
            'Items',
            ItemsEditor as unknown as React.ComponentType,
            {showTitle: true},
        );

        // 2. Register a product per configured item.
        // Live updates: registerProduct has no clean un-register hook in this
        // SDK version, so changing items in System Console needs a page
        // refresh to take effect. The setting helpText says so.
        try {
            const items = await fetchItems();
            setIconStyles(items);
            for (const item of items) {
                registerOne(registry, item);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[Webframes] failed to load items:', err);
        }
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: Plugin): void;
    }
}

window.registerPlugin(manifest.id, new Plugin());
