import React, {useCallback, useMemo, useState} from 'react';

import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {makeEmptyItem, parseItems, type WebframeItem} from '../../types/item';
import ItemModal from './item_modal';

// PluginCustomSettingsComponentProps from the host. Re-declared locally so we
// do not depend on `types/mattermost-webapp` where this is a thin export.
type Props = {
    id: string;
    label: string;
    helpText: string;
    value: unknown;
    disabled: boolean;
    onChange: (id: string, value: unknown) => void;
    setSaveNeeded: () => void;
    config: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    license?: unknown;
    setByEnv?: boolean;
    registerSaveAction?: unknown;
    unRegisterSaveAction?: unknown;
    cancelSubmit?: unknown;
    showConfirm?: boolean;
};

const cellStyle: React.CSSProperties = {padding: '8px 12px', verticalAlign: 'middle'};
const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    color: 'var(--center-channel-color-56, #777)',
    borderBottom: '1px solid var(--center-channel-color-16, #ccc)',
    textAlign: 'left',
};
const rowStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--center-channel-color-08, #eee)',
};
const handleStyle: React.CSSProperties = {
    cursor: 'grab',
    color: 'var(--center-channel-color-32, #aaa)',
    fontSize: 18,
    userSelect: 'none',
    width: 16,
    textAlign: 'center',
};
const iconCellStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

type RowProps = {
    item: WebframeItem;
    onEdit: () => void;
    onDelete: () => void;
    disabled: boolean;
};

const SortableRow: React.FC<RowProps> = ({item, onEdit, onDelete, disabled}) => {
    const sortable = useSortable({id: item.id, disabled});
    const style: React.CSSProperties = {
        ...rowStyle,
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        background: sortable.isDragging ? 'var(--center-channel-color-04, #f5f5f5)' : undefined,
        opacity: item.enabled ? 1 : 0.5,
    };

    return (
        <tr
            ref={sortable.setNodeRef}
            style={style}
        >
            <td style={cellStyle}>
                <span
                    {...sortable.attributes}
                    {...sortable.listeners}
                    style={handleStyle}
                    title='Drag to reorder'
                >{'⠿'}</span>
            </td>
            <td style={cellStyle}>
                <div style={iconCellStyle}>
                    {item.iconPreset ? (
                        <i
                            className={`icon icon-${item.iconPreset}`}
                            style={{fontSize: 20}}
                        />
                    ) : item.iconDataUrl ? (
                        <img
                            src={item.iconDataUrl}
                            alt=''
                            style={{maxWidth: 24, maxHeight: 24, objectFit: 'contain'}}
                        />
                    ) : (
                        <i className='icon icon-globe'/>
                    )}
                </div>
            </td>
            <td style={cellStyle}>{item.displayName || <em style={{color: '#aaa'}}>{'(no name)'}</em>}</td>
            <td style={cellStyle}><code>{'/'}{item.slashTrigger || '?'}</code></td>
            <td style={{...cellStyle, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                <span title={item.url}>{item.url}</span>
            </td>
            <td style={cellStyle}>{item.ephemeralTtlSec === 0 ? '∞' : `${item.ephemeralTtlSec}s`}</td>
            <td style={{...cellStyle, textAlign: 'right', whiteSpace: 'nowrap'}}>
                <button
                    type='button'
                    className='btn btn-tertiary btn-sm'
                    disabled={disabled}
                    onClick={onEdit}
                >{'Edit'}</button>
                <button
                    type='button'
                    className='btn btn-tertiary btn-sm'
                    style={{marginLeft: 4, color: 'var(--error-text, #d24b4e)'}}
                    disabled={disabled}
                    onClick={onDelete}
                >{'Delete'}</button>
            </td>
        </tr>
    );
};

const ItemsEditor: React.FC<Props> = ({id, value, disabled, onChange, setSaveNeeded}) => {
    const items = useMemo(() => parseItems(value), [value]);
    const [editing, setEditing] = useState<WebframeItem | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 4}}));

    const commit = useCallback((next: WebframeItem[]) => {
        onChange(id, JSON.stringify(next));
        setSaveNeeded();
    }, [id, onChange, setSaveNeeded]);

    const handleAdd = () => setEditing(makeEmptyItem());

    const handleSave = (item: WebframeItem) => {
        const idx = items.findIndex((x) => x.id === item.id);
        const next = idx >= 0 ?
            items.map((x) => (x.id === item.id ? item : x)) :
            [...items, item];
        commit(next);
        setEditing(null);
    };

    const handleDelete = (itemId: string) => {
        const target = items.find((x) => x.id === itemId);
        if (!target) {
            return;
        }
        // eslint-disable-next-line no-alert
        if (!window.confirm(`Delete "${target.displayName || target.id}"?`)) {
            return;
        }
        commit(items.filter((x) => x.id !== itemId));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) {
            return;
        }
        const from = items.findIndex((x) => x.id === active.id);
        const to = items.findIndex((x) => x.id === over.id);
        if (from < 0 || to < 0) {
            return;
        }
        commit(arrayMove(items, from, to));
    };

    return (
        <div style={{width: '100%'}}>
            {items.length === 0 ? (
                <div style={{padding: 16, color: 'var(--center-channel-color-56, #777)', fontStyle: 'italic'}}>
                    {'No links yet. Click "Add" to create one.'}
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'auto'}}>
                        <thead>
                            <tr>
                                <th style={headerCellStyle}/>
                                <th style={headerCellStyle}>{'Icon'}</th>
                                <th style={headerCellStyle}>{'Name'}</th>
                                <th style={headerCellStyle}>{'Trigger'}</th>
                                <th style={headerCellStyle}>{'URL'}</th>
                                <th style={headerCellStyle}>{'TTL'}</th>
                                <th style={headerCellStyle}/>
                            </tr>
                        </thead>
                        <tbody>
                            <SortableContext
                                items={items.map((x) => x.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((item) => (
                                    <SortableRow
                                        key={item.id}
                                        item={item}
                                        onEdit={() => setEditing(item)}
                                        onDelete={() => handleDelete(item.id)}
                                        disabled={disabled}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>
            )}

            <button
                type='button'
                className='btn btn-primary'
                style={{marginTop: 12}}
                disabled={disabled}
                onClick={handleAdd}
            >{'Add'}</button>

            {editing && (
                <ItemModal
                    initial={editing}
                    others={items}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                />
            )}
        </div>
    );
};

export default ItemsEditor;
