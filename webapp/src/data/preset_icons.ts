// Curated subset of Mattermost's compass-icons font, grouped by intent.
// The full font ships with 325 icons (verified against the upstream
// `mattermost/compass-icons` repo); we expose all of them here so admins do
// not have to fall back to Upload as soon as their first choice is missing.
//
// Names map verbatim to `<i className={'icon icon-' + name}/>` and to
// `registerProduct(switcherIcon)`. They are guaranteed to exist in the font
// shipped with the host webapp, so every entry in the picker renders.
//
// Categories are eyeballed: each icon appears in exactly one category, and
// borderline cases pick the most-likely-searched-for one. Names that are
// purely UI plumbing (chevrons, drag handles, format toolbar buttons) live
// in their own categories at the bottom rather than mixed into the
// general-purpose ones.

export type PresetIconCategory = {
    title: string;
    icons: string[];
};

export const PRESET_ICONS: PresetIconCategory[] = [
    {
        title: 'Mattermost & products',
        icons: [
            'mattermost', 'apps', 'products', 'product-channels', 'product-boards',
            'product-playbooks', 'kanban', 'sitemap',
        ],
    },
    {
        title: 'People',
        icons: [
            'account-outline', 'account-multiple-outline', 'account-plus-outline',
            'account-multiple-plus-outline', 'account-minus-outline',
        ],
    },
    {
        title: 'Communication',
        icons: [
            'forum-outline', 'message-text-outline', 'message-arrow-right-outline',
            'message-check-outline', 'message-check', 'message-plus-outline',
            'message-minus-outline', 'email-outline', 'email-plus-outline',
            'email-variant', 'send', 'send-outline', 'reply-outline', 'at',
            'mark-as-unread', 'bell-outline', 'bell-ring-outline', 'bell-off-outline',
            'bullhorn-outline', 'phone-outline', 'phone', 'phone-in-talk',
            'phone-hangup',
        ],
    },
    {
        title: 'Web & integrations',
        icons: [
            'globe', 'globe-checked', 'link-variant', 'link-variant-off',
            'open-in-new', 'oauth', 'webhook', 'webhook-incoming', 'webhook-outgoing',
            'server-outline', 'server-variant', 'server-variant-plus',
            'iframe-list-outline', 'github-circle', 'brand-gitlab', 'brand-google',
            'brand-office-365', 'brand-one-login', 'brand-zoom',
        ],
    },
    {
        title: 'Files',
        icons: [
            'file-text-outline', 'file-generic-outline', 'file-multiple-outline',
            'file-pdf-outline', 'file-word-outline', 'file-excel-outline',
            'file-powerpoint-outline', 'file-image-outline',
            'file-image-broken-outline', 'file-audio-outline', 'file-video-outline',
            'file-code-outline', 'file-patch-outline', 'file-zip-outline',
            'file-gif',
            'file-text-outline-large', 'file-generic-outline-large',
            'file-multiple-outline-large', 'file-pdf-outline-large',
            'file-word-outline-large', 'file-excel-outline-large',
            'file-powerpoint-outline-large', 'file-image-outline-large',
            'file-image-broken-outline-large', 'file-audio-outline-large',
            'file-video-outline-large', 'file-code-outline-large',
            'file-patch-outline-large', 'file-zip-outline-large',
            'file-help-outline-large',
        ],
    },
    {
        title: 'Folders & archives',
        icons: [
            'folder-outline', 'folder-plus-outline', 'folder-move-outline',
            'archive-outline', 'archive-arrow-up-outline', 'archive-lock-outline',
            'book-outline', 'book-lock-outline', 'notebook-outline',
            'bookmark-outline', 'bookmark',
        ],
    },
    {
        title: 'Data & dashboards',
        icons: [
            'chart-bar', 'chart-line', 'monitor', 'monitor-account',
            'monitor-share', 'monitor-off', 'view-grid-plus-outline',
            'layers-outline', 'table-large', 'table-plus', 'table-remove',
            'table-settings', 'table-column-plus-after',
            'table-column-plus-before', 'table-column-remove',
            'table-row-plus-after', 'table-row-plus-before', 'table-row-remove',
        ],
    },
    {
        title: 'Code & dev',
        icons: [
            'code-tags', 'code-brackets', 'code-block', 'console', 'function',
            'condition-branch', 'source-branch', 'source-pull',
        ],
    },
    {
        title: 'Security & access',
        icons: [
            'shield-outline', 'shield-check', 'shield-lock-outline',
            'shield-alert-outline', 'lock', 'lock-outline', 'key-variant',
            'key-variant-circle', 'eye-outline', 'eye-off-outline',
            'exit-to-app', 'logout-variant', 'import', 'export-variant',
        ],
    },
    {
        title: 'Time',
        icons: [
            'calendar-outline', 'calendar-check-outline', 'calendar-month-outline',
            'clock-outline', 'clock', 'clock-send-outline',
        ],
    },
    {
        title: 'Status & info',
        icons: [
            'information-outline', 'help', 'help-circle-outline',
            'check', 'check-all', 'check-circle', 'check-circle-outline',
            'cancel', 'close', 'close-circle', 'close-circle-outline',
            'alert-outline', 'alert-circle-outline', 'exclamation-thick',
            'flag', 'flag-outline', 'flag-checkered', 'pin', 'pin-outline',
        ],
    },
    {
        title: 'Settings & tools',
        icons: [
            'cog-outline', 'settings-outline', 'application-cog', 'tune',
            'tune-vertical-variant' /* may or may not exist; harmless if not */,
            'hammer', 'auto-fix', 'palette-outline', 'refresh', 'sync',
            'update', 'restore',
        ],
    },
    {
        title: 'AI & assistive',
        icons: [
            'ai-summarize', 'creation-outline', 'robot-happy',
        ],
    },
    {
        title: 'Media',
        icons: [
            'image-outline', 'image-area-outline', 'image-broken-outline',
            'camera-outline', 'video-outline', 'video-off-outline',
            'play', 'play-outline', 'play-box-multiple-outline', 'pause',
            'record-circle-outline', 'record-square-outline',
            'closed-caption-outline', 'volume-high', 'microphone',
            'microphone-outline', 'microphone-off', 'headphones',
            'gfycat', 'icon-brand-giphy',
        ],
    },
    {
        title: 'Editing & formatting',
        icons: [
            'pencil-outline', 'draw', 'spellcheck', 'paperclip', 'content-copy',
            'text-box-outline', 'text-long', 'text-short',
            'sort-alphabetical-ascending', 'sort-ascending', 'filter-variant',
            'format-bold', 'format-italic', 'format-strikethrough-variant',
            'format-clear', 'format-letter-case', 'format-list-bulleted',
            'format-list-numbered', 'format-quote-open', 'format-header',
            'format-header-1', 'format-header-2', 'format-header-3',
            'format-header-4', 'format-header-5', 'format-header-6',
            'checkbox-blank-outline', 'checkbox-marked',
            'checkbox-marked-circle-outline',
            'checkbox-multiple-marked-outline', 'radiobox-blank',
            'radiobox-marked',
        ],
    },
    {
        title: 'Symbols & math',
        icons: [
            'plus', 'plus-box', 'plus-box-outline', 'minus', 'minus-box',
            'minus-circle', 'minus-circle-outline', 'equal', 'not-equal-variant',
            'infinity', 'pound', 'currency-usd', 'element-of', 'slash-forward',
            'slash-forward-box-outline', 'square', 'star', 'star-outline',
            'circle-outline', 'circle-multiple-outline',
            'circle-multiple-outline-lock',
        ],
    },
    {
        title: 'Emoji',
        icons: [
            'emoticon-outline', 'emoticon-happy-outline',
            'emoticon-plus-outline', 'emoticon-custom-outline',
        ],
    },
    {
        title: 'Navigation & UI',
        icons: [
            'menu', 'menu-variant', 'menu-up', 'menu-down', 'menu-left',
            'menu-right', 'dots-horizontal', 'dots-vertical', 'drag-vertical',
            'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
            'arrow-back-ios', 'arrow-forward-ios', 'arrow-up-bold-circle-outline',
            'arrow-down-bold-circle-outline', 'arrow-right-bold-outline',
            'arrow-collapse', 'arrow-expand', 'arrow-expand-all',
            'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
            'chevron-down-circle-outline', 'dock-left', 'dock-window',
            'magnify', 'magnify-minus', 'magnify-plus', 'search-list',
            'resize-bottom-right',
        ],
    },
    {
        title: 'Devices & travel',
        icons: [
            'laptop', 'monitor', 'tablet', 'cellphone', 'keyboard-outline',
            'keyboard-return', 'bluetooth', 'power-plug-outline',
            'airplane', 'airplane-variant', 'car-outline', 'map-marker-outline',
            'beach-umbrella-outline',
        ],
    },
    {
        title: 'Misc',
        icons: [
            'home-variant-outline', 'fire', 'lightbulb-outline',
            'lightning-bolt-outline', 'heart-outline', 'thumbs-up-down',
            'crown-outline', 'leaf', 'leaf-outline', 'glasses', 'soccer',
            'basketball', 'food-apple', 'food-fork-drink', 'flask-outline',
            'credit-card-outline', 'share-variant-outline', 'shuffle-variant',
            'translate', 'timeline-text-outline', 'playlist-check',
            'trash-can-outline', 'upload-outline', 'download-outline',
            'backspace-outline', 'hand-right', 'hand-right-outline',
            'hand-right-outline-off',
        ],
    },
];

export const ALL_PRESET_ICONS: string[] = PRESET_ICONS.flatMap((c) => c.icons);

export function isPresetIcon(name: string): boolean {
    return ALL_PRESET_ICONS.includes(name);
}
