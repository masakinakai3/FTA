/*
 * Copyright (c) 2026 masakinakai3
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import React, { useState, useEffect } from 'react';
import Node from './Node';
import type { FTANode, FTAEdge } from '../types/fta';

interface CanvasProps {
    nodes: FTANode[];
    edges: FTAEdge[];
    updateNode: (id: string, updates: Partial<FTANode>) => void;
    addEdge: (sourceId: string, targetId: string) => void;
    removeNode: (id: string) => void;
    removeNodes: (ids: string[]) => void;
    removeEdge: (id: string) => void;
    removeEdges: (ids: string[]) => void;
    selectedNodeIds: Set<string>;
    setSelectedNodeIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedEdgeIds: Set<string>;
    setSelectedEdgeIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const Canvas: React.FC<CanvasProps> = ({ nodes, edges, updateNode, addEdge, selectedNodeIds, setSelectedNodeIds, selectedEdgeIds, setSelectedEdgeIds, removeNodes, removeEdge, removeEdges }) => {
    // Viewport state: x, y (pan), k (zoom scale)
    const [viewState, setViewState] = useState({ x: 0, y: 0, k: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const [isDraggingNode, setIsDraggingNode] = useState(false);
    // dragOffset is now map of {id: {x,y}} relative to mouse, or just simple offset if we calculate delta
    // Simpler: store last mouse world pos for drag, and apply delta to all selected nodes
    const [lastDragPos, setLastDragPos] = useState({ x: 0, y: 0 });

    const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, current: { x: number, y: number } } | null>(null);

    const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // For visual connection line

    // --- Helpers for Coordinate Conversion ---
    const getScreenToWorld = (clientX: number, clientY: number) => {
        const canvas = document.querySelector('.canvas-container');
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left - viewState.x) / viewState.k,
            y: (clientY - rect.top - viewState.y) / viewState.k
        };
    };

    // --- Event Handlers: Pan & Zoom ---
    const handleWheel = (e: React.WheelEvent) => {
        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
        const newScale = Math.min(Math.max(viewState.k + delta, 0.1), 5); // Limit zoom 0.1x to 5x

        const containerRect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - containerRect.left;
        const my = e.clientY - containerRect.top;

        const worldX = (mx - viewState.x) / viewState.k;
        const worldY = (my - viewState.y) / viewState.k;

        const newX = mx - worldX * newScale;
        const newY = my - worldY * newScale;

        setViewState({ x: newX, y: newY, k: newScale });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Middle mouse (button 1) or Space+Left (button 0 + space)
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Using Shift for Pan might conflict with Shift Select if not careful. Let's keep Space key for Pan.
            // Wait, usually Shift+Click is select. Space+Drag is pan.
            // If User holds Space, e.key isn't sufficient in mousedown, need to check global state or e.getModifierState?
            // But e.shiftKey is for selection usually.
            // Let's stick to Middle Mouse or Spacebar check (implemented via event listener usually or just assume if space is held).
            // Current logic: e.shiftKey causes Pan? That's non-standard. Usually Shift is add-selection.
            // User requested Simulink style. Simulink: Middle drag pan, Scroll zoom. Left drag box select.

            if (e.button === 1) {
                e.preventDefault();
                setIsPanning(true);
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }
        }

        // Left Click on Background -> Box Selection
        if (e.button === 0) {
            // Check if space is pressed for panning (simulated mostly via keydown listener elsewhere? No, need check here)
            // For now, let's assume if NOT on node (which bubbles up), it's box select OR clear selection.

            // Clear selection if not shifting
            if (!e.ctrlKey && !e.shiftKey) {
                setSelectedNodeIds(new Set());
                setSelectedEdgeIds(new Set());
            }
            setConnectingNodeId(null);
            setEditingNodeId(null);

            // Start Box Selection
            const worldPos = getScreenToWorld(e.clientX, e.clientY);
            setSelectionBox({ start: worldPos, current: worldPos });
        }
    };

    // --- Global Mouse Move/Up (Window level) ---
    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            // Update mouse pos for connection line
            if (connectingNodeId) {
                const worldPos = getScreenToWorld(e.clientX, e.clientY);
                setMousePos(worldPos);
            }

            if (isPanning) {
                const dx = e.clientX - lastMousePos.x;
                const dy = e.clientY - lastMousePos.y;
                setViewState(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
                setLastMousePos({ x: e.clientX, y: e.clientY });
            }

            if (isDraggingNode) {
                const worldPos = getScreenToWorld(e.clientX, e.clientY);
                const dx = worldPos.x - lastDragPos.x;
                const dy = worldPos.y - lastDragPos.y;

                if (dx !== 0 || dy !== 0) {
                    selectedNodeIds.forEach(id => {
                        const node = nodes.find(n => n.id === id);
                        if (node) {
                            updateNode(id, { x: node.x + dx, y: node.y + dy });
                        }
                    });
                    setLastDragPos(worldPos);
                }
            }

            if (selectionBox) {
                const worldPos = getScreenToWorld(e.clientX, e.clientY);
                setSelectionBox(prev => prev ? { ...prev, current: worldPos } : null);
            }
        };

        const handleWindowMouseUp = () => {
            if (selectionBox) {
                // Finalize Selection
                const x1 = Math.min(selectionBox.start.x, selectionBox.current.x);
                const y1 = Math.min(selectionBox.start.y, selectionBox.current.y);
                const x2 = Math.max(selectionBox.start.x, selectionBox.current.x);
                const y2 = Math.max(selectionBox.start.y, selectionBox.current.y);

                const newSelection = new Set(selectedNodeIds);
                // If dragging box without shift/ctrl, we usually cleared visible selection on mousedown, 
                // so we just add intersected.
                // But wait, if we held shift, we want to ADD.
                // Ideally we cleared on mousedown if needed.

                nodes.forEach(node => {
                    // Simple AABB overlap
                    const nodeW = node.type === 'gate' || node.subType === 'basic_event' ? 60 : 120;
                    const nodeH = node.type === 'gate' || node.subType === 'basic_event' ? 60 : 40;

                    // Node rect
                    const nx = node.x;
                    const ny = node.y;
                    // Box rect is x1,y1 to x2,y2

                    // Overlap Check
                    if (nx < x2 && nx + nodeW > x1 && ny < y2 && ny + nodeH > y1) {
                        newSelection.add(node.id);
                    }
                });
                setSelectedNodeIds(newSelection);
                setSelectionBox(null);
            }

            setIsPanning(false);
            setIsDraggingNode(false);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isPanning, isDraggingNode, lastMousePos, viewState, connectingNodeId, lastDragPos, selectionBox, nodes, selectedNodeIds]);

    // --- Delete Key ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Prevent delete if editing
                if (editingNodeId) return;

                if (selectedNodeIds.size > 0) {
                    removeNodes(Array.from(selectedNodeIds));
                    // setSelectedNodeIds(new Set()); // This is handled in useFTATree potentially, but safe to clear here? 
                    // removeNodes in useFTATree already clears selection logic.
                    // But we likely need to clear it here if the hook doesn't auto-sync external state setter?
                    // Ah, hook calls setSelectedNodeIds inside it. So no need here.
                }

                if (selectedEdgeIds.size > 0) {
                    removeEdges(Array.from(selectedEdgeIds));
                    // removeEdges in hook should handle clearing selection state
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeIds, removeNodes, editingNodeId, selectedEdgeIds, removeEdges]);


    // --- Node Handling ---
    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();

        // If connecting...
        if (connectingNodeId && connectingNodeId !== nodeId) {
            addEdge(connectingNodeId, nodeId);
            setConnectingNodeId(null);
            return;
        }

        // Selection Logic
        let newSelection = new Set(selectedNodeIds);
        if (e.shiftKey || e.ctrlKey) {
            if (newSelection.has(nodeId)) {
                newSelection.delete(nodeId);
            } else {
                newSelection.add(nodeId);
            }
            setSelectedNodeIds(newSelection);
        } else {
            if (!newSelection.has(nodeId)) {
                // If clicking an unselected node without modifier, select ONLY it
                newSelection = new Set([nodeId]);
                setSelectedNodeIds(newSelection);
            }
            // If clicking a selected node, keep selection as is for dragging group
        }

        // Clear Edge Selection when clicking Node?
        if (!e.shiftKey && !e.ctrlKey) {
            setSelectedEdgeIds(new Set());
        }

        // Start Dragging
        // We set isDraggingNode true.
        // We initialize lastDragPos to current world mouse
        const worldPos = getScreenToWorld(e.clientX, e.clientY);
        setLastDragPos(worldPos);
        setIsDraggingNode(true);
    };

    const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setConnectingNodeId(nodeId);
        // Initialize mousePos to current node center for immediate feedback
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            const container = document.querySelector('.canvas-container');
            if (container) {
                const rect = container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                const worldX = (mx - viewState.x) / viewState.k;
                const worldY = (my - viewState.y) / viewState.k;

                // We don't necessarily need to set mousePos here as mousemove will catch it, 
                // but it helps if mouse doesn't move immediately.
                setMousePos({ x: worldX, y: worldY }); // Or node center output port?
                // Let's just rely on mousemove for line end.
            }
        }
    };

    // --- Edge Handling ---
    const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
        e.stopPropagation();

        let newSelection = new Set(selectedEdgeIds);
        if (e.shiftKey || e.ctrlKey) {
            if (newSelection.has(edgeId)) {
                newSelection.delete(edgeId);
            } else {
                newSelection.add(edgeId);
            }
            setSelectedEdgeIds(newSelection);
        } else {
            // Select Only
            setSelectedEdgeIds(new Set([edgeId]));
            // Also Clear Node selection? Yes, usually exclusive unless careful
            setSelectedNodeIds(new Set());
        }
    };


    // --- Editing ---
    const handleNodeDoubleClick = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setEditingNodeId(nodeId);
    };

    const handleLabelChange = (nodeId: string, newLabel: string) => {
        updateNode(nodeId, { label: newLabel });
    };

    const handleFinishEditing = () => {
        setEditingNodeId(null);
    };


    // --- Render Helpers ---
    const getNodeDimensions = (node: FTANode) => {
        if (node.type === 'gate') return { w: 60, h: 60 };
        if (node.subType === 'basic_event') return { w: 60, h: 60 };
        return { w: 120, h: 40 };
    };

    const getNodeCenter = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0, w: 0, h: 0 };
        const { w, h } = getNodeDimensions(node);
        return { x: node.x, y: node.y, w, h };
    };

    const getSourcePoint = (node: { x: number, y: number, w: number, h: number }) => {
        return { x: node.x + node.w / 2, y: node.y + node.h };
    };

    const getTargetPoint = (node: { x: number, y: number, w: number, h: number }) => {
        return { x: node.x + node.w / 2, y: node.y };
    };

    const getOrthogonalPath = (source: { x: number, y: number }, target: { x: number, y: number }) => {
        const midY = (source.y + target.y) / 2;
        return `M ${source.x} ${source.y} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${target.y}`;
    };

    return (
        <div
            className="canvas-container"
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-color)',
                cursor: isPanning ? 'grabbing' : 'default'
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
        >
            <div
                style={{
                    transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.k})`,
                    transformOrigin: '0 0',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none' // Let events pass through to nodes? No, nodes need events.
                }}
            >
                {/* 
                   Problem: pointerEvents: 'none' on container will kill interaction with children.
                   We need to allow pointer events on children. 
                   Solution: Remove pointerEvents: 'none' here, but be careful about the background click.
                   Actually, if this div covers everything, handleMouseDown on parent might never fire if this div catches it.
                   But this div has no background, so clicks might pass through if transparent? 
                   Standard approach: The "scene" div.
                 */}
                <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                        {edges.map(edge => {
                            const sourceNode = getNodeCenter(edge.sourceId);
                            const targetNode = getNodeCenter(edge.targetId);
                            if (!sourceNode.x || !targetNode.x) return null;

                            const start = getSourcePoint(sourceNode);
                            const end = getTargetPoint(targetNode);
                            const path = getOrthogonalPath(start, end);

                            const isSelected = selectedEdgeIds.has(edge.id);

                            return (
                                <g key={edge.id}
                                    onClick={(e) => handleEdgeClick(e, edge.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Invisible thick path for easier clicking */}
                                    <path
                                        d={path}
                                        fill="none"
                                        stroke="transparent"
                                        strokeWidth="10"
                                    />
                                    {/* Visible path */}
                                    <path
                                        d={path}
                                        fill="none"
                                        stroke={isSelected ? 'var(--primary-color, #3b82f6)' : 'var(--line-color, #333)'}
                                        strokeWidth={isSelected ? "3" : "2"}
                                        style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                                    />
                                </g>
                            );
                        })}
                        {connectingNodeId && (
                            <line
                                x1={getSourcePoint(getNodeCenter(connectingNodeId)).x}
                                y1={getSourcePoint(getNodeCenter(connectingNodeId)).y}
                                x2={mousePos.x}
                                y2={mousePos.y}
                                stroke="#999"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        )}
                        {selectionBox && (
                            <rect
                                x={Math.min(selectionBox.start.x, selectionBox.current.x)}
                                y={Math.min(selectionBox.start.y, selectionBox.current.y)}
                                width={Math.abs(selectionBox.current.x - selectionBox.start.x)}
                                height={Math.abs(selectionBox.current.y - selectionBox.start.y)}
                                fill="rgba(59, 130, 246, 0.2)"
                                stroke="rgba(59, 130, 246, 0.8)"
                                strokeWidth="1" // increased from 1 for better visibility? 1 is fine.
                                vectorEffect="non-scaling-stroke" // Keep stroke width constant even when zoomed? Maybe.
                            />
                        )}
                    </svg>
                    {nodes.map(node => (
                        <Node
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeIds.has(node.id)}
                            isConnecting={node.id === connectingNodeId}
                            isEditing={node.id === editingNodeId}
                            onMouseDown={handleNodeMouseDown}
                            onPortMouseDown={handlePortMouseDown}
                            onDoubleClick={handleNodeDoubleClick}
                            onLabelChange={(newLabel) => handleLabelChange(node.id, newLabel)}
                            onFinishEditing={handleFinishEditing}
                        />
                    ))}
                </div>
            </div>

            {/* Overlay UI for Zoom Level, etc could go here */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '4px', fontSize: '12px', color: '#333' }}>
                Zoom: {Math.round(viewState.k * 100)}%
            </div>
        </div>
    );
};

export default Canvas;
