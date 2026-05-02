// Shape of a single configurable web frame. Persisted as part of a JSON-encoded
// list inside the plugin's `Items` setting (custom string field). Kept
// deliberately flat so the JSON round-trip stays predictable.

export type WebframeItem = {
    id: string;                 // stable opaque id, used in URLs and CSS class names
    displayName: string;        // shown in the product switcher and command response
    slashTrigger: string;       // without leading slash, e.g. "wiki"
    url: string;                // absolute URL
    openMode: 'iframe' | 'newWindow';
    iconPreset: string;         // compass-icons name, e.g. 'globe'. Wins over iconDataUrl.
    iconDataUrl: string;        // custom uploaded icon (data URL). Used only if iconPreset is empty.
    ephemeralTtlSec: number;    // 0 = never auto-delete the slash response
    enabled: boolean;
};

export const DEFAULT_TTL_SEC = 60;
export const MAX_ICON_BYTES = 64 * 1024; // pre-encoding limit, see settings UI
export const SLASH_TRIGGER_RE = /^[a-z0-9_-]+$/;
export const ID_RE = /^[a-z0-9-]+$/;

export type ValidationError = {field: keyof WebframeItem | 'general'; message: string};

export function validateItem(item: WebframeItem, others: WebframeItem[], allowHTTP: boolean): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!item.displayName.trim()) {
        errors.push({field: 'displayName', message: 'Name is required'});
    }

    if (!SLASH_TRIGGER_RE.test(item.slashTrigger)) {
        errors.push({field: 'slashTrigger', message: 'Lowercase letters, digits, _ and - only; no spaces'});
    }
    if (others.some((o) => o.id !== item.id && o.slashTrigger === item.slashTrigger)) {
        errors.push({field: 'slashTrigger', message: 'Already used by another item'});
    }

    let parsed: URL | null = null;
    try {
        parsed = new URL(item.url);
    } catch {
        errors.push({field: 'url', message: 'Not a valid URL'});
    }
    if (parsed) {
        if (parsed.protocol !== 'https:' && !(allowHTTP && parsed.protocol === 'http:')) {
            errors.push({field: 'url', message: 'Only https:// (enable "Allow HTTP" in settings for http://)'});
        }
    }

    if (!Number.isFinite(item.ephemeralTtlSec) || item.ephemeralTtlSec < 0) {
        errors.push({field: 'ephemeralTtlSec', message: 'TTL must be >= 0 seconds'});
    }

    return errors;
}

export function makeEmptyItem(): WebframeItem {
    return {
        id: cryptoRandomId(),
        displayName: '',
        slashTrigger: '',
        url: 'https://',
        openMode: 'iframe',
        iconPreset: '',
        iconDataUrl: '',
        ephemeralTtlSec: DEFAULT_TTL_SEC,
        enabled: true,
    };
}

export function parseItems(stored: unknown): WebframeItem[] {
    if (!stored) {
        return [];
    }
    let raw: unknown = stored;
    if (typeof stored === 'string') {
        if (!stored.trim()) {
            return [];
        }
        try {
            raw = JSON.parse(stored);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw.filter(isItemLike).map(coerceItem);
}

function isItemLike(v: unknown): v is Partial<WebframeItem> {
    return Boolean(v) && typeof v === 'object';
}

function coerceItem(v: Partial<WebframeItem>): WebframeItem {
    return {
        id: typeof v.id === 'string' && ID_RE.test(v.id) ? v.id : cryptoRandomId(),
        displayName: typeof v.displayName === 'string' ? v.displayName : '',
        slashTrigger: typeof v.slashTrigger === 'string' ? v.slashTrigger.toLowerCase() : '',
        url: typeof v.url === 'string' ? v.url : '',
        openMode: v.openMode === 'newWindow' ? 'newWindow' : 'iframe',
        iconPreset: typeof v.iconPreset === 'string' ? v.iconPreset : '',
        iconDataUrl: typeof v.iconDataUrl === 'string' ? v.iconDataUrl : '',
        ephemeralTtlSec: typeof v.ephemeralTtlSec === 'number' && v.ephemeralTtlSec >= 0 ? v.ephemeralTtlSec : DEFAULT_TTL_SEC,
        enabled: v.enabled !== false,
    };
}

function cryptoRandomId(): string {
    // Short URL-safe id; collision-resistant enough for a list bounded by what
    // an admin types into a table.
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
