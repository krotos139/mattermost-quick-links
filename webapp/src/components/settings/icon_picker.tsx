import React, {useMemo, useState} from 'react';

import {PRESET_ICONS} from '../../data/preset_icons';
import IconUpload from './icon_upload';

type Tab = 'library' | 'upload';

type Props = {
    presetIcon: string;
    customDataUrl: string;
    disabled?: boolean;
    onChange: (next: {presetIcon: string; customDataUrl: string}) => void;
};

const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
    borderBottom: '1px solid var(--center-channel-color-16, #ccc)',
    marginBottom: 8,
};

const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'transparent',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--button-bg, #1c58d9)' : 'var(--center-channel-color-72, #555)',
    borderBottom: active ? '2px solid var(--button-bg, #1c58d9)' : '2px solid transparent',
    marginBottom: -1,
});

const searchStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: 8,
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: 4,
    maxHeight: 240,
    overflowY: 'auto',
    padding: 4,
    border: '1px solid var(--center-channel-color-08, #eee)',
    borderRadius: 4,
};

const cellStyle = (selected: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '8px 4px',
    borderRadius: 4,
    cursor: 'pointer',
    background: selected ? 'var(--button-bg-08, #e6efff)' : 'transparent',
    border: selected ? '1px solid var(--button-bg, #1c58d9)' : '1px solid transparent',
    minHeight: 56,
});

const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: 'var(--center-channel-color-56, #888)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    textAlign: 'center',
    whiteSpace: 'nowrap',
};

const categoryHeaderStyle: React.CSSProperties = {
    gridColumn: '1 / -1',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    color: 'var(--center-channel-color-56, #888)',
    padding: '4px 4px 0',
};

// IconPicker lets the admin pick an icon from Mattermost's compass-icons font
// or upload a custom one. The two are mutually exclusive: choosing a preset
// clears the upload, and uploading clears the preset selection. Persistence
// stores both fields anyway so we never lose the user's previous choice when
// they switch tabs back and forth before saving.
const IconPicker: React.FC<Props> = ({presetIcon, customDataUrl, disabled, onChange}) => {
    const [tab, setTab] = useState<Tab>(() => (customDataUrl && !presetIcon ? 'upload' : 'library'));
    const [query, setQuery] = useState('');

    const filteredCategories = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return PRESET_ICONS;
        }
        return PRESET_ICONS.
            map((c) => ({title: c.title, icons: c.icons.filter((n) => n.includes(q))})).
            filter((c) => c.icons.length > 0);
    }, [query]);

    const handlePickPreset = (name: string) => {
        // Selecting the same preset again clears the selection (toggle).
        if (name === presetIcon) {
            onChange({presetIcon: '', customDataUrl});
            return;
        }
        // Selecting a preset clears the upload — UI guarantees one icon at a time.
        onChange({presetIcon: name, customDataUrl: ''});
    };

    const handleUpload = (dataUrl: string) => {
        onChange({presetIcon: '', customDataUrl: dataUrl});
    };

    return (
        <div>
            <div style={tabBarStyle}>
                <button
                    type='button'
                    style={tabStyle(tab === 'library')}
                    onClick={() => setTab('library')}
                >{'From library'}</button>
                <button
                    type='button'
                    style={tabStyle(tab === 'upload')}
                    onClick={() => setTab('upload')}
                >{'Upload'}</button>
                {(presetIcon || customDataUrl) && (
                    <button
                        type='button'
                        style={{...tabStyle(false), marginLeft: 'auto'}}
                        onClick={() => onChange({presetIcon: '', customDataUrl: ''})}
                    >{'Clear'}</button>
                )}
            </div>

            {tab === 'library' && (
                <>
                    <input
                        type='search'
                        className='form-control'
                        placeholder='Search by name…'
                        value={query}
                        disabled={disabled}
                        onChange={(e) => setQuery(e.target.value)}
                        style={searchStyle}
                    />
                    <div style={gridStyle}>
                        {filteredCategories.length === 0 && (
                            <div style={{...categoryHeaderStyle, fontStyle: 'italic'}}>{'No matches.'}</div>
                        )}
                        {filteredCategories.map((cat) => (
                            <React.Fragment key={cat.title}>
                                <div style={categoryHeaderStyle}>{cat.title}</div>
                                {cat.icons.map((name) => (
                                    <div
                                        key={name}
                                        style={cellStyle(name === presetIcon)}
                                        title={name}
                                        onClick={() => !disabled && handlePickPreset(name)}
                                    >
                                        <i
                                            className={`icon icon-${name}`}
                                            style={{fontSize: 22}}
                                        />
                                        <span style={labelStyle}>{name}</span>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}

            {tab === 'upload' && (
                <IconUpload
                    value={customDataUrl}
                    onChange={handleUpload}
                    disabled={disabled}
                />
            )}
        </div>
    );
};

export default IconPicker;
