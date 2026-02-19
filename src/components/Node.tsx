import React from 'react';
import type { FTANode } from '../types/fta';
import { getGatePath, getEventPath } from '../utils/shapes';

interface NodeProps {
    node: FTANode;
    isSelected?: boolean;
    isConnecting?: boolean;
    isEditing?: boolean;
    onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
    onPortMouseDown: (e: React.MouseEvent, nodeId: string) => void;
    onDoubleClick: (e: React.MouseEvent, nodeId: string) => void;
    onLabelChange: (newLabel: string) => void;
    onFinishEditing: () => void;
}

const Node: React.FC<NodeProps> = ({ node, isSelected, isConnecting, isEditing, onMouseDown, onPortMouseDown, onDoubleClick, onLabelChange, onFinishEditing }) => {
    const isGate = node.type === 'gate';
    const orientation = 'TB';

    let width = 60;
    let height = 60;

    if (!isGate) {
        if (node.subType === 'basic_event') {
            width = 60;
            height = 60;
        } else if (node.subType === 'text_box') {
            width = 120;
            height = 40;
        } else {
            // Top/Intermediate
            width = 120; // Wider rectangles
            height = 40;
        }
    }

    const path = isGate
        ? getGatePath(node.subType as any, orientation)
        : node.subType === 'text_box'
            ? '' // No path for text box
            : getEventPath(node.subType as any, orientation);

    // Color Palette
    let fillColor = '#ffffff';
    let textColor = '#000000';
    let strokeColor = 'transparent';

    if (node.subType === 'top_event') {
        fillColor = '#49bcd4'; // Teal
        textColor = '#ffffff';
    } else if (node.subType === 'intermediate_event') {
        fillColor = '#49bcd4'; // Teal (or maybe lighter?)
        textColor = '#ffffff';
    } else if (node.subType === 'basic_event') {
        fillColor = '#d9a5b3'; // Pinkish
        textColor = '#000000'; // Or dark gray
    } else if (node.subType === 'and_gate') {
        fillColor = '#92a8d1'; // Slate Blue
        textColor = '#000000';
    } else if (node.subType === 'or_gate') {
        fillColor = '#d6d6e6'; // Pale Lavender
        textColor = '#000000';
    } else if (node.subType === 'text_box') {
        fillColor = 'transparent';
        textColor = node.color || 'var(--text-color)';
    }

    // Override fill color if custom color is set (except for text_box which uses it for text)
    if (node.color && node.subType !== 'text_box') {
        fillColor = node.color;
    }

    const style: React.CSSProperties = {
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: width,
        height: height,
        cursor: 'move',
        userSelect: 'none',
        zIndex: 10,
        backgroundColor: 'transparent', // Explicitly clear background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        filter: isSelected
            ? 'drop-shadow(0 0 5px #3b82f6) drop-shadow(0 0 10px #3b82f6)' // Strong glow
            : isConnecting
                ? 'drop-shadow(0 0 5px orange)'
                : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        transition: 'all 0.2s',
    };

    // Label positioning
    const isBasic = node.subType === 'basic_event';

    return (
        <div
            style={style}
            onMouseDown={(e) => onMouseDown(e, node.id)}
            onDoubleClick={(e) => onDoubleClick(e, node.id)}
        >
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                <path
                    d={path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="0"
                />

                {/* Logic label for Gates (AND/OR) inside the shape */}
                {isGate && (
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#333" fontSize="12px" fontWeight="bold">
                        {node.subType === 'and_gate' ? 'AND' : 'OR'}
                    </text>
                )}

                <foreignObject x={isBasic ? 0 : 0} y={0} width={width} height={height} style={{ pointerEvents: 'none' }}>
                    {isEditing ? (
                        <input
                            autoFocus
                            value={node.label}
                            onChange={(e) => onLabelChange(e.target.value)}
                            onBlur={onFinishEditing}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onFinishEditing();
                                }
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: 'rgba(255, 255, 255, 0.9)',
                                color: 'black',
                                textAlign: 'center',
                                fontSize: '12px',
                                fontWeight: '600',
                                outline: '2px solid #3b82f6',
                                borderRadius: '2px',
                                padding: 0,
                                margin: 0,
                                pointerEvents: 'auto'
                            }}
                        />
                    ) : (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%',
                            padding: '0 4px', // Add slight padding to prevent touching edges
                            boxSizing: 'border-box',
                            fontSize: isGate ? '0px' : '12px',
                            fontWeight: '600',
                            color: textColor,
                            textAlign: 'center',
                            lineHeight: '1.1',
                            wordBreak: 'break-word', // Ensure long words wrap
                            overflow: 'hidden' // Clip if too long
                        }}>
                            {!isGate ? node.label : ''}
                        </div>
                    )}
                </foreignObject>
            </svg>

            {/* ID Badge or external label? Reference shows numbers below events. Let's start with just internal text. */}
            {/* Output Port - Only for non-basic events and non-text-box */}
            {!isBasic && node.subType !== 'text_box' && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '100%',
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#4a90e2',
                        borderRadius: '50%',
                        cursor: 'crosshair',
                        zIndex: 20,
                        border: '1px solid white'
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onPortMouseDown(e, node.id);
                    }}
                />
            )}
        </div>
    );
};

export default Node;
