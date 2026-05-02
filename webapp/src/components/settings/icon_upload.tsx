import React, {useRef, useState} from 'react';

import {MAX_ICON_BYTES} from '../../types/item';
import {sanitizeSvg, svgToDataUrl} from '../../utils/sanitize_svg';

const ALLOWED_MIME = new Set(['image/png', 'image/svg+xml', 'image/webp', 'image/gif', 'image/jpeg']);

type Props = {
    value: string;          // current data URL (empty = none)
    onChange: (dataUrl: string) => void;
    disabled?: boolean;
};

const previewBoxStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    border: '1px solid var(--center-channel-color-16, #ccc)',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--center-channel-bg, #fff)',
};

const previewImgStyle: React.CSSProperties = {
    maxWidth: 40,
    maxHeight: 40,
    objectFit: 'contain',
};

const errorStyle: React.CSSProperties = {
    color: 'var(--error-text, #d24b4e)',
    fontSize: 12,
    marginTop: 4,
};

const IconUpload: React.FC<Props> = ({value, onChange, disabled}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>('');

    const handleFile = async (file: File) => {
        setError('');
        if (!ALLOWED_MIME.has(file.type)) {
            setError(`Unsupported file type: ${file.type || 'unknown'}`);
            return;
        }
        if (file.size > MAX_ICON_BYTES) {
            setError(`File is too large (${file.size} bytes, max ${MAX_ICON_BYTES})`);
            return;
        }

        if (file.type === 'image/svg+xml') {
            const text = await file.text();
            const cleaned = sanitizeSvg(text);
            if (!cleaned) {
                setError('SVG could not be parsed or contained only disallowed elements');
                return;
            }
            onChange(svgToDataUrl(cleaned));
            return;
        }

        // Raster: read as data URL directly. Browser-decoded bytes have no
        // executable surface so a sanitiser pass would not buy anything.
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                onChange(result);
            } else {
                setError('Failed to read file');
            }
        };
        reader.onerror = () => setError('Failed to read file');
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={previewBoxStyle}>
                    {value ? (
                        <img
                            src={value}
                            alt='Icon preview'
                            style={previewImgStyle}
                        />
                    ) : (
                        <span style={{color: 'var(--center-channel-color-32, #999)', fontSize: 11}}>{'no icon'}</span>
                    )}
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <button
                        type='button'
                        className='btn btn-tertiary'
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                    >
                        {value ? 'Replace' : 'Upload'}
                    </button>
                    {value && (
                        <button
                            type='button'
                            className='btn btn-tertiary'
                            disabled={disabled}
                            onClick={() => onChange('')}
                        >
                            {'Remove'}
                        </button>
                    )}
                </div>
            </div>
            <input
                ref={inputRef}
                type='file'
                accept='.png,.svg,.webp,.gif,.jpg,.jpeg,image/png,image/svg+xml,image/webp,image/gif,image/jpeg'
                style={{display: 'none'}}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                        void handleFile(f);
                    }
                    e.target.value = ''; // allow re-uploading the same file
                }}
            />
            {error && <div style={errorStyle}>{error}</div>}
            <div style={{fontSize: 11, color: 'var(--center-channel-color-56, #888)', marginTop: 4}}>
                {'PNG / SVG / WEBP / GIF / JPEG, max '}{Math.round(MAX_ICON_BYTES / 1024)}{' KB. SVG is sanitised on upload.'}
            </div>
        </div>
    );
};

export default IconUpload;
