import React, {useEffect, useRef} from 'react';

type Props = {
    url: string;
    title: string;
};

const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--center-channel-color-56, #888)',
    background: 'var(--center-channel-bg, #fff)',
};

// ExternalRedirect handles the "open in new window" mode for a webframe item.
//
// Why we don't just use registerProduct(switcherLinkURL=externalURL): the host
// router treats that as an internal route, navigates, finds nothing, and the
// MM tab ends up on a broken page. Workaround flow:
//   1. Register the product so the menu entry exists at /wf-{id}.
//   2. When this component mounts (i.e. the user clicked the menu item),
//      open the URL in a new tab via a synthesised <a target='_blank'> click.
//   3. Pop the orphan /wf-{id} entry off history so the MM tab returns to
//      whatever page the user was on before.
//
// We use anchor.click() rather than window.open() because window.open with
// rel='noopener' returns null in Firefox/Chrome even when it succeeded — that
// false negative made the previous version of this component think the popup
// was blocked when it actually opened. The anchor approach inherits the user
// gesture from the original menu click and has consistent return semantics
// (no return value to misinterpret).
const ExternalRedirect: React.FC<Props> = ({url, title}) => {
    const triedRef = useRef(false);

    useEffect(() => {
        if (triedRef.current) {
            return;
        }
        triedRef.current = true;

        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Go back so the MM tab is not stranded on /wf-{id}. Done after a
        // micro-delay so the new-tab spawn definitely begins before history
        // navigation; some browsers cancel the open if we navigate away too
        // fast.
        window.setTimeout(() => {
            window.history.back();
        }, 50);
    }, [url]);

    return (
        <div style={wrapperStyle}>
            <span>{'Opening '}{title}{' …'}</span>
        </div>
    );
};

export default ExternalRedirect;
