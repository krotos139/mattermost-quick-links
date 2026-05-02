// Curated subset of Mattermost's compass-icons font, grouped by intent. The
// full font has thousands of glyphs (Material Design Icons + Mattermost's own
// product icons), which would be overwhelming to scroll through. ~80 icons
// covers the common admin use cases; users who need something else can fall
// back to the Upload tab.
//
// Names here are passed verbatim to `<i className={'icon icon-' + name}/>`
// and to `registerProduct(switcherIcon)`. If a name does not exist in the
// shipped font, the cell renders empty — admins can verify in the picker
// before saving.

export type PresetIconCategory = {
    title: string;
    icons: string[];
};

export const PRESET_ICONS: PresetIconCategory[] = [
    {
        title: 'Web & cloud',
        icons: [
            'globe',
            'web',
            'earth',
            'link-variant',
            'bookmark-outline',
            'cloud-outline',
            'cloud-download-outline',
            'cloud-upload-outline',
        ],
    },
    {
        title: 'Documents',
        icons: [
            'file-document-outline',
            'folder-outline',
            'book-open-outline',
            'notebook-outline',
            'file-pdf-box',
            'clipboard-text-outline',
            'file-multiple-outline',
            'archive-outline',
        ],
    },
    {
        title: 'Communication',
        icons: [
            'chat-outline',
            'email-outline',
            'message-text-outline',
            'forum-outline',
            'phone-outline',
            'video-outline',
            'bell-outline',
            'megaphone-outline',
        ],
    },
    {
        title: 'People',
        icons: [
            'account-outline',
            'account-group-outline',
            'account-multiple-outline',
            'account-tie-outline',
            'account-plus-outline',
            'account-key-outline',
        ],
    },
    {
        title: 'Tools & dev',
        icons: [
            'tools',
            'hammer-wrench',
            'cog-outline',
            'code-tags',
            'code-braces',
            'console-line',
            'bug-outline',
            'source-branch',
        ],
    },
    {
        title: 'Charts & data',
        icons: [
            'chart-bar',
            'chart-line',
            'chart-pie',
            'view-dashboard-outline',
            'monitor-dashboard',
            'database-outline',
            'table-large',
        ],
    },
    {
        title: 'Status & info',
        icons: [
            'information-outline',
            'help-circle-outline',
            'check-circle-outline',
            'alert-outline',
            'shield-check-outline',
            'lightbulb-outline',
            'flag-variant-outline',
        ],
    },
    {
        title: 'Time & calendar',
        icons: [
            'calendar-outline',
            'calendar-clock-outline',
            'clock-outline',
            'timer-outline',
        ],
    },
    {
        title: 'Security & access',
        icons: [
            'lock-outline',
            'lock-open-outline',
            'key-variant',
            'shield-outline',
            'shield-key-outline',
            'eye-outline',
        ],
    },
    {
        title: 'Misc',
        icons: [
            'home-outline',
            'star-outline',
            'heart-outline',
            'fire',
            'rocket-launch-outline',
            'lightning-bolt-outline',
            'magnify',
            'map-marker-outline',
            'puzzle-outline',
            'application-outline',
            'apps',
        ],
    },
    {
        title: 'Mattermost products',
        icons: [
            'product-channels',
            'product-boards',
            'product-playbooks',
        ],
    },
];

export const ALL_PRESET_ICONS: string[] = PRESET_ICONS.flatMap((c) => c.icons);

export function isPresetIcon(name: string): boolean {
    return ALL_PRESET_ICONS.includes(name);
}
