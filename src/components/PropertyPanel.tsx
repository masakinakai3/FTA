import React from 'react';
import type { FTANode } from '../types/fta';

interface PropertyPanelProps {
    node: FTANode | null;
    updateNode: (id: string, updates: Partial<FTANode>) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ node, updateNode }) => {
    if (!node) {
        return (
            <div className="property-panel" style={{
                width: '300px',
                padding: '24px',
                borderLeft: '1px solid var(--panel-border)',
                backgroundColor: 'var(--panel-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-color)',
                fontSize: '14px',
                textAlign: 'center',
                // background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 100%)' // Subtle dark gradient or none
            }}>
                <p>Select a node to edit properties</p>
            </div>
        );
    }

    const handleChange = (field: keyof FTANode, value: string | number) => {
        updateNode(node.id, { [field]: value });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid var(--panel-border)',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'var(--text-color)',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: 'var(--input-bg)',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '6px',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    return (
        <div className="property-panel" style={{
            width: '300px',
            padding: '24px',
            borderLeft: '1px solid var(--panel-border)',
            backgroundColor: 'var(--panel-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.02)',
            zIndex: 50
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-color)' }}>Properties</h3>

            <div>
                <label style={labelStyle}>Label</label>
                <input
                    type="text"
                    value={node.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                    style={inputStyle}
                    placeholder="Enter label..."
                />
            </div>

            <div>
                <label style={labelStyle}>Color</label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px',
                    marginBottom: '8px'
                }}>
                    {[
                        '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#495057', '#000000',
                        '#ffc9c9', '#ff6b6b', '#ff922b', '#fcc419', '#51cf66', '#20c997',
                        '#339af0', '#5c7cfa', '#cc5de8', '#f06595', '#845ef7', '#49bcd4',
                        '#d9a5b3', '#92a8d1', '#d6d6e6', '#ffec99', '#a5d8ff', '#b2f2bb'
                    ].map(color => (
                        <div
                            key={color}
                            onClick={() => handleChange('color', color)}
                            style={{
                                width: '100%',
                                paddingTop: '100%', // 1:1 Aspect Ratio
                                backgroundColor: color,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: (node.color || '#ffffff') === color ? '2px solid var(--primary-color, #3b82f6)' : '1px solid var(--panel-border)',
                                position: 'relative'
                            }}
                            title={color}
                        />
                    ))}
                </div>
                <button
                    onClick={() => handleChange('color', '')}
                    style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        width: '100%',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--text-color)'
                    }}
                    title="Reset to default color"
                >
                    Reset to Default
                </button>
            </div>

            <div>
                <label style={labelStyle}>Description</label>
                <textarea
                    value={node.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                    placeholder="Enter description..."
                />
            </div>

            {node.type === 'event' && (
                <div>
                    <label style={labelStyle}>Probability</label>
                    <input
                        type="number"
                        value={node.probability || ''}
                        onChange={(e) => handleChange('probability', parseFloat(e.target.value))}
                        style={inputStyle}
                        step="0.0001"
                        placeholder="0.0 - 1.0"
                    />
                </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--panel-border)' }}>
                <label style={labelStyle}>Node Info</label>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', lineHeight: '1.6' }}>
                    ID: {node.id.slice(0, 8)}...<br />
                    Type: {node.type} ({node.subType})
                </div>
            </div>
        </div>
    );
};

export default PropertyPanel;
