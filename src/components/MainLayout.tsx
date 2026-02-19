/*
 * Copyright (c) 2026 masakinakai3
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import React from 'react';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import { useFTATree } from '../hooks/useFTATree';

const MainLayout: React.FC = () => {
    const { addNode, nodes, edges, updateNode, addEdge, removeNode, removeNodes, removeEdge, removeEdges, selectedNodeIds, setSelectedNodeIds, selectedEdgeIds, setSelectedEdgeIds, setNodes, setEdges } = useFTATree();

    const handleAddNode = (type: any, subType: any) => {
        // For now, just add a node at a random position near center
        addNode(type, subType, 100 + Math.random() * 50, 100 + Math.random() * 50);
    };

    const handleSave = () => {
        const data = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fta-diagram.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.nodes && data.edges) {
                    setNodes(data.nodes);
                    setEdges(data.edges);
                }
            } catch (error) {
                console.error('Failed to parse JSON', error);
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    // For Property Panel, just pick the last selected node or null
    const selectedNodeId = selectedNodeIds.size > 0 ? Array.from(selectedNodeIds)[selectedNodeIds.size - 1] : null;

    const handleExportImage = async () => {
        if (nodes.length === 0) {
            alert('No nodes to export');
            return;
        }

        // Dynamically import html2canvas to avoid SSR issues if any, and only load when needed
        const html2canvas = (await import('html2canvas')).default;

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            // Approx width/height - getting exact would be better but fixed sizes help
            const w = node.type === 'gate' || node.subType === 'basic_event' ? 60 : 120;
            const h = node.type === 'gate' || node.subType === 'basic_event' ? 60 : 40;
            maxX = Math.max(maxX, node.x + w);
            maxY = Math.max(maxY, node.y + h);
        });

        // Add padding
        const padding = 50;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        const width = maxX - minX;
        const height = maxY - minY;

        const canvasElement = document.querySelector('.canvas-bg') as HTMLElement;
        if (!canvasElement) return;

        try {
            const canvas = await html2canvas(canvasElement, {
                backgroundColor: '#0f172a', // Dark mode bg
                width: width,
                height: height,
                x: 0, // We will shift the content in onclone instead
                y: 0,
                onclone: (clonedDoc) => {
                    const clonedContainer = clonedDoc.querySelector('.canvas-bg') as HTMLElement;
                    const clonedContent = clonedContainer.querySelector('div') as HTMLElement; // The transform div

                    if (clonedContainer && clonedContent) {
                        clonedContainer.style.width = `${width}px`;
                        clonedContainer.style.height = `${height}px`;
                        clonedContainer.style.overflow = 'visible';

                        // Reset transform and shift to origin
                        // We need to shift everything so that minX, minY is at 0,0
                        // Since nodes are absolute, we can just apply a translation to the container
                        clonedContent.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`;
                    }
                }
            });

            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fta-diagram.png';
            a.click();
        } catch (error) {
            console.error('Export failed', error);
            alert('Failed to export image');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Toolbar onAddNode={handleAddNode} onSave={handleSave} onLoad={handleLoad} onExportImage={handleExportImage} />
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div className="canvas-bg" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <Canvas
                        nodes={nodes}
                        edges={edges}
                        updateNode={updateNode}
                        addEdge={addEdge}
                        removeNode={removeNode}
                        removeNodes={removeNodes}
                        removeEdge={removeEdge}
                        removeEdges={removeEdges}
                        selectedNodeIds={selectedNodeIds}
                        setSelectedNodeIds={setSelectedNodeIds}
                        selectedEdgeIds={selectedEdgeIds}
                        setSelectedEdgeIds={setSelectedEdgeIds}
                    />
                </div>
                <PropertyPanel
                    node={nodes.find(n => n.id === selectedNodeId) || null}
                    updateNode={updateNode}
                />
            </div>
        </div>
    );
};

export default MainLayout;
