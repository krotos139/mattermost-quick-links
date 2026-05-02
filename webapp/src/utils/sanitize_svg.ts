// Whitelist-based SVG sanitizer. The admin uploads an icon file; if it is an
// SVG (text), we cannot trust it as-is (it might contain <script>, JS event
// handlers, or external references). PNG/WEBP/etc are byte blobs, so we trust
// the browser's image decoder.
//
// We deliberately do NOT pull in DOMPurify just for this — the surface area of
// what we need to allow is tiny (graphical SVG only, no scripts, no animation
// hooks, no foreignObject), and a 30-line allowlist is easier to audit than
// configuring a 50KB dep.

const ALLOWED_TAGS = new Set([
    'svg', 'g', 'defs', 'symbol', 'use', 'title', 'desc',
    'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
    'text', 'tspan', 'textPath',
    'linearGradient', 'radialGradient', 'stop',
    'mask', 'clipPath', 'pattern',
    'filter', 'feGaussianBlur', 'feOffset', 'feMerge', 'feMergeNode',
    'feColorMatrix', 'feFlood', 'feComposite', 'feBlend',
]);

// Anything starting with "on" is dropped automatically, plus the explicit list
// below. xlink:href is dangerous if it points outside the SVG (can pull in
// external resources or javascript:); we keep only refs that begin with "#".
const FORBIDDEN_ATTRS = new Set(['xmlns:xlink']);

function isSafeURI(value: string): boolean {
    const v = value.trim();
    if (v.startsWith('#')) {
        return true;
    }
    // Reject everything else for icons: no http(s)://, no data:, no javascript:.
    return false;
}

function cleanElement(el: Element): boolean {
    const name = el.localName;
    if (!ALLOWED_TAGS.has(name)) {
        return false;
    }

    // Drop attributes we do not allow.
    for (const attr of Array.from(el.attributes)) {
        const an = attr.name.toLowerCase();
        if (an.startsWith('on') || FORBIDDEN_ATTRS.has(an)) {
            el.removeAttribute(attr.name);
            continue;
        }
        if (an === 'href' || an === 'xlink:href') {
            if (!isSafeURI(attr.value)) {
                el.removeAttribute(attr.name);
            }
            continue;
        }
        if (an === 'style') {
            // Style can carry url(javascript:...) and similar. For an icon we
            // do not need style at all — fill / stroke are dedicated attrs.
            el.removeAttribute(attr.name);
            continue;
        }
    }

    // Recurse, removing disallowed children.
    for (const child of Array.from(el.children)) {
        if (!cleanElement(child)) {
            child.remove();
        }
    }
    return true;
}

export function sanitizeSvg(input: string): string | null {
    const doc = new DOMParser().parseFromString(input, 'image/svg+xml');
    const err = doc.querySelector('parsererror');
    if (err) {
        return null;
    }
    const root = doc.documentElement;
    if (!root || root.localName !== 'svg') {
        return null;
    }
    if (!cleanElement(root)) {
        return null;
    }
    return new XMLSerializer().serializeToString(root);
}

export function svgToDataUrl(svg: string): string {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
