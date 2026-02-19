import React from 'react';
import type { FTANodeType, FTAEventType, FTAGateType } from '../types/fta';

interface ToolbarProps {
    onAddNode: (type: FTANodeType, subType: FTAEventType | FTAGateType) => void;
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExportImage: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, onSave, onLoad, onExportImage }) => {
    return (
        <div className="toolbar" style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'var(--panel-bg)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            zIndex: 100,
            border: '1px solid var(--panel-border)',
            backdropFilter: 'blur(8px)',
        }}>
            <div className="toolbar-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ marginRight: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Events</span>
                <button onClick={() => onAddNode('event', 'top_event')}>Top</button>
                <button onClick={() => onAddNode('event', 'basic_event')}>Basic</button>
                <button onClick={() => onAddNode('event', 'intermediate_event')}>Inter</button>
                <button onClick={() => onAddNode('event', 'text_box')}>Text</button>
            </div>
            <div className="toolbar-divider" style={{ width: '1px', backgroundColor: 'var(--panel-border)', height: '24px' }}></div>
            <div className="toolbar-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ marginRight: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Gates</span>
                <button onClick={() => onAddNode('gate', 'and_gate')}>AND</button>
                <button onClick={() => onAddNode('gate', 'or_gate')}>OR</button>
            </div>
            <div className="toolbar-divider" style={{ width: '1px', backgroundColor: 'var(--panel-border)', height: '24px' }}></div>
            <div className="toolbar-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ marginRight: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>File</span>
                <button onClick={onSave} style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}>Save</button>
                <label className="button" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 12px',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--panel-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    Load
                    <input type="file" accept=".json" onChange={onLoad} style={{ display: 'none' }} />
                </label>
                <button onClick={onExportImage} style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>Export</button>
            </div>
        </div>
    );
};

export default Toolbar;
