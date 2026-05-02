import {useLayoutEffect} from 'react';

// Mattermost strips `app__body channel-view` from <body> when the user leaves
// /channels/*, and a bunch of theme rules — most visibly the dark global
// header background — are gated on those classes.
//
// Just adding the classes back in useLayoutEffect was not enough on its own:
// the host's own router code seems to write to body.className AFTER our
// effect runs, stripping us back out. We therefore:
//
//   1. Add the classes once on mount.
//   2. Install a MutationObserver that re-adds them every time something
//      else touches body.className.
//   3. Inject a dedicated CSS rule keyed off our own `webframes-active`
//      class so the dark header colour is applied directly, regardless of
//      whether `channel-view` survives a given moment of the race.
//
// On unmount we remove the classes — but only those we ourselves added (the
// `had*` snapshot guards against pulling a class out from under the host on
// a Channels → product → Channels round trip).

const STYLE_ID = 'webframes-channel-view-style';
const ACTIVE_CLASS = 'webframes-active';

function ensureHeaderStyle(): void {
    if (document.getElementById(STYLE_ID)) {
        return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    // The `var(...)` chain falls back through every Mattermost theme variable
    // we have seen used for the dark header: the modern --global-header-*
    // tokens first, the older --sidebar-header-* tokens next, and a hex
    // fallback last. !important is needed because the host's own header CSS
    // is high-specificity.
    style.textContent = `
body.${ACTIVE_CLASS} #global-header,
body.${ACTIVE_CLASS} header#global-header {
    background-color: var(--global-header-background, var(--sidebar-header-bg, #166de0)) !important;
    color: var(--global-header-text-primary, var(--sidebar-header-text-color, #ffffff)) !important;
}
`;
    document.head.appendChild(style);
}

export function useChannelViewBodyClass(): void {
    useLayoutEffect(() => {
        const body = document.body;
        ensureHeaderStyle();

        const hadApp = body.classList.contains('app__body');
        const hadChannel = body.classList.contains('channel-view');

        const ensureClasses = () => {
            if (!body.classList.contains('app__body')) {
                body.classList.add('app__body');
            }
            if (!body.classList.contains('channel-view')) {
                body.classList.add('channel-view');
            }
            if (!body.classList.contains(ACTIVE_CLASS)) {
                body.classList.add(ACTIVE_CLASS);
            }
        };
        ensureClasses();

        const observer = new MutationObserver(ensureClasses);
        observer.observe(body, {attributes: true, attributeFilter: ['class']});

        return () => {
            observer.disconnect();
            body.classList.remove(ACTIVE_CLASS);
            if (!hadApp) {
                body.classList.remove('app__body');
            }
            if (!hadChannel) {
                body.classList.remove('channel-view');
            }
        };
    }, []);
}
