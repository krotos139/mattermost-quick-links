import React, {useMemo, useState} from 'react';

import type {ValidationError, WebframeItem} from '../../types/item';
import {validateItem} from '../../types/item';
import IconPicker from './icon_picker';

type Props = {
    initial: WebframeItem;
    others: WebframeItem[];
    allowHTTP: boolean;
    onSave: (item: WebframeItem) => void;
    onCancel: () => void;
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1080,
};

const dialogStyle: React.CSSProperties = {
    background: 'var(--center-channel-bg, #fff)',
    color: 'var(--center-channel-color, #3d3c40)',
    borderRadius: 8,
    width: 520,
    maxWidth: '90vw',
    padding: 24,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
};

const fieldStyle: React.CSSProperties = {marginBottom: 16};
const labelStyle: React.CSSProperties = {display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13};
const errorStyle: React.CSSProperties = {color: 'var(--error-text, #d24b4e)', fontSize: 12, marginTop: 4};

function findError(errors: ValidationError[], field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
}

const ItemModal: React.FC<Props> = ({initial, others, allowHTTP, onSave, onCancel}) => {
    const [draft, setDraft] = useState<WebframeItem>(initial);
    const [submitted, setSubmitted] = useState(false);

    const errors = useMemo(
        () => validateItem(draft, others, allowHTTP),
        [draft, others, allowHTTP],
    );

    const update = <K extends keyof WebframeItem>(key: K, value: WebframeItem[K]) => {
        setDraft((d) => ({...d, [key]: value}));
    };

    // Plain function (no FormEvent) — see render comment about why we cannot
    // use a real <form> here.
    const handleSubmit = () => {
        setSubmitted(true);
        if (errors.length === 0) {
            onSave(draft);
        }
    };

    // Submit-on-Enter for usability (no <form>, so the browser does not do
    // this for us). Skip when the focus is in a multiline control or when a
    // modifier is held.
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
            const tag = (e.target as HTMLElement).tagName;
            if (tag !== 'TEXTAREA') {
                e.preventDefault();
                handleSubmit();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    };

    const showError = (field: string) => (submitted ? findError(errors, field) : undefined);

    // Render note: this dialog lives inside the System Console page, which
    // already wraps the entire admin settings tree in a <form>. HTML forbids
    // nested forms, so a <form> here would be folded into the outer one and
    // every Save click would submit the whole admin console. We use a <div>
    // and wire Enter / button clicks ourselves.
    return (
        <div style={overlayStyle} onClick={onCancel}>
            <div
                role='dialog'
                aria-modal='true'
                style={dialogStyle}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <h3 style={{marginTop: 0}}>{initial.displayName ? 'Edit web frame' : 'Add web frame'}</h3>

                <div style={fieldStyle}>
                    <label style={labelStyle}>{'Name'}</label>
                    <input
                        type='text'
                        className='form-control'
                        value={draft.displayName}
                        autoFocus={true}
                        placeholder='e.g. Wiki'
                        onChange={(e) => update('displayName', e.target.value)}
                    />
                    {showError('displayName') && <div style={errorStyle}>{showError('displayName')}</div>}
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>{'Slash command trigger'}</label>
                    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                        <span style={{color: 'var(--center-channel-color-56, #888)'}}>{'/'}</span>
                        <input
                            type='text'
                            className='form-control'
                            value={draft.slashTrigger}
                            placeholder='wiki'
                            style={{flex: 1}}
                            onChange={(e) => update('slashTrigger', e.target.value.toLowerCase())}
                        />
                    </div>
                    {showError('slashTrigger') && <div style={errorStyle}>{showError('slashTrigger')}</div>}
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>{'URL'}</label>
                    <input
                        type='url'
                        className='form-control'
                        value={draft.url}
                        placeholder='https://...'
                        onChange={(e) => update('url', e.target.value)}
                    />
                    {showError('url') && <div style={errorStyle}>{showError('url')}</div>}
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>{'Open mode'}</label>
                    <label style={{display: 'block', fontWeight: 400}}>
                        <input
                            type='radio'
                            checked={draft.openMode === 'iframe'}
                            onChange={() => update('openMode', 'iframe')}
                        />{' '}{'Embed in iframe (in the product menu)'}
                    </label>
                    <label style={{display: 'block', fontWeight: 400}}>
                        <input
                            type='radio'
                            checked={draft.openMode === 'newWindow'}
                            onChange={() => update('openMode', 'newWindow')}
                        />{' '}{'Open in a new browser window'}
                    </label>
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>{'Icon'}</label>
                    <IconPicker
                        presetIcon={draft.iconPreset}
                        customDataUrl={draft.iconDataUrl}
                        onChange={({presetIcon, customDataUrl}) => {
                            setDraft((d) => ({...d, iconPreset: presetIcon, iconDataUrl: customDataUrl}));
                        }}
                    />
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>{'Slash command response auto-delete (seconds, 0 = never)'}</label>
                    <input
                        type='number'
                        className='form-control'
                        min={0}
                        value={draft.ephemeralTtlSec}
                        onChange={(e) => update('ephemeralTtlSec', Number(e.target.value))}
                    />
                    {showError('ephemeralTtlSec') && <div style={errorStyle}>{showError('ephemeralTtlSec')}</div>}
                </div>

                <div style={fieldStyle}>
                    <label style={{display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400}}>
                        <input
                            type='checkbox'
                            checked={draft.enabled}
                            onChange={(e) => update('enabled', e.target.checked)}
                        />
                        {'Enabled'}
                    </label>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16}}>
                    <button
                        type='button'
                        className='btn btn-tertiary'
                        onClick={onCancel}
                    >
                        {'Cancel'}
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={handleSubmit}
                    >
                        {'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;
