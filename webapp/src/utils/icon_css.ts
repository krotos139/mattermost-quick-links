// Compass-icons (the icon font Mattermost uses) is name-based: registerProduct
// expects a string like 'globe', 'product-boards' that resolves to a CSS class
// `icon-{name}` whose ::before content is a glyph from the icon font.
//
// To support per-item admin-uploaded icons, we register each item with a
// synthetic name (`webframes-{itemId}`) and inject a `<style>` tag that turns
// `i.icon-webframes-{itemId}::before` into a background-image of the uploaded
// data-URL. The icon font's :before is empty (the unknown name has no glyph),
// so our background takes over without fighting the font.

const STYLE_ID = 'webframes-icon-styles';

export function iconClassName(itemId: string): string {
    // Returned value is what we pass to registerProduct as switcherIcon. The
    // host wraps it as `icon-${name}`.
    return `webframes-${itemId}`;
}

function getStyleElement(): HTMLStyleElement {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ID;
        document.head.appendChild(el);
    }
    return el;
}

// Replace the entire stylesheet on every config change. Cheaper to regenerate
// the whole thing than to diff per-item — the list is bounded by what an admin
// types into a table.
export function setIconStyles(items: Array<{id: string; iconDataUrl: string}>): void {
    const rules: string[] = [];
    for (const item of items) {
        if (!item.iconDataUrl) {
            continue;
        }
        const cls = `icon-${iconClassName(item.id)}`;
        // The compass-icon span sets font-family + line-height. Our ::before
        // overrides the empty content with a sized background-image. We use
        // !important on background because compass-icons base CSS sets
        // `content` only — but mode/styles in user themes can override.
        rules.push(`
i.${cls}::before, span.${cls}::before {
    content: '';
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
    background-image: url("${escapeForCss(item.iconDataUrl)}");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
`);
    }
    getStyleElement().textContent = rules.join('\n');
}

// Defensive escape: data URLs from sanitised SVG should not contain " or \,
// but PNG data URLs likewise should be safe. Belt-and-braces in case some
// future code path lets unescaped strings through.
function escapeForCss(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
