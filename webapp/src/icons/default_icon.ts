// Default icon shown next to a Web Frames product menu item when the admin has
// not uploaded a custom one. Kept as an inline SVG string so the bundle does
// not depend on a webpack file/asset loader rule. Exported as a `data:` URL
// because `registry.registerProduct(switcherIcon)` accepts a string and the
// host renders it as an icon source.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2.5" y="2.5" width="14" height="14" rx="1.4" stroke-width="1.7"/>
  <line x1="14.6" y1="14.6" x2="18.8" y2="18.8" stroke-width="1.5"/>
  <line x1="19.4" y1="19.4" x2="22" y2="22" stroke-width="3.4"/>
</svg>`;

export const defaultIconSvg = SVG;
export const defaultIconDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(SVG);
