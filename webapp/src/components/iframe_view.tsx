import React from 'react';

import {useChannelViewBodyClass} from '../utils/use_channel_view_body_class';

type Props = {
    url: string;
    title: string;
};

// No `className='mainFrame'` here: Mattermost already mounts mainComponent
// inside its own .mainFrame container and the global CSS for that class
// (position: absolute / inset: 0) will overlay the global header if applied
// twice in nested elements.
const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--center-channel-bg, #fff)',
};

const headerStyle: React.CSSProperties = {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    fontSize: 12,
    color: 'var(--center-channel-color-72, #555)',
    borderBottom: '1px solid var(--center-channel-color-08, #eee)',
    background: 'var(--center-channel-bg, #fff)',
};

const iframeStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    border: 'none',
    background: 'var(--center-channel-bg, #fff)',
};

// Browsers do not fire iframe.onError when the site blocks framing via
// X-Frame-Options or CSP frame-ancestors — the iframe just stays blank or
// shows the browser's own error chrome. We therefore expose the "open in new
// tab" link permanently as a thin top bar, so users always have an escape
// hatch even when nothing rendered inside the iframe.
const IframeView: React.FC<Props> = ({url, title}) => {
    useChannelViewBodyClass();
    return (
    <div style={wrapperStyle}>
        <div style={headerStyle}>
            <span title={url} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {url}
            </span>
            <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                style={{marginLeft: 12, whiteSpace: 'nowrap'}}
            >
                {'Open in new tab ↗'}
            </a>
        </div>
        <iframe
            src={url}
            title={title}
            style={iframeStyle}
            sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads'
            allow='clipboard-read; clipboard-write; fullscreen'
            referrerPolicy='no-referrer-when-downgrade'
        />
    </div>
    );
};

export default IframeView;
