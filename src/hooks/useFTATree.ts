import { useState, useCallback } from 'react';
import type { FTANode, FTAEdge, FTANodeType, FTAEventType, FTAGateType } from '../types/fta';
import { v4 as uuidv4 } from 'uuid';

export const useFTATree = () => {
    const [nodes, setNodes] = useState<FTANode[]>([]);
    const [edges, setEdges] = useState<FTAEdge[]>([]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());

    const addNode = useCallback((type: FTANodeType, subType: FTAEventType | FTAGateType, x: number, y: number) => {
        const newNode: FTANode = {
            id: uuidv4(),
            type,
            subType,
            label: subType === 'top_event' ? 'Top Event' : subType === 'text_box' ? 'Text' : 'New Node',
            x,
            y,
            width: 100,
            height: 60,
        };
        setNodes((prev) => [...prev, newNode]);
        return newNode;
    }, []);

    const updateNode = useCallback((id: string, updates: Partial<FTANode>) => {
        setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...updates } : node)));
    }, []);

    const removeNode = useCallback((id: string) => {
        setNodes((prev) => prev.filter((node) => node.id !== id));
        setEdges((prev) => prev.filter((edge) => edge.sourceId !== id && edge.targetId !== id));
        setSelectedNodeIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const removeNodes = useCallback((ids: string[]) => {
        setNodes((prev) => prev.filter((node) => !ids.includes(node.id)));
        setEdges((prev) => prev.filter((edge) => !ids.includes(edge.sourceId) && !ids.includes(edge.targetId)));
        setSelectedNodeIds((prev) => {
            const next = new Set(prev);
            ids.forEach(id => next.delete(id));
            return next;
        });
    }, []);

    const addEdge = useCallback((sourceId: string, targetId: string) => {
        if (sourceId === targetId) return;
        setEdges((prev) => {
            if (prev.some((edge) => edge.sourceId === sourceId && edge.targetId === targetId)) return prev;
            return [...prev, { id: uuidv4(), sourceId, targetId }];
        });
    }, []);

    const removeEdge = useCallback((id: string) => {
        setEdges((prev) => prev.filter((edge) => edge.id !== id));
        setSelectedEdgeIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const removeEdges = useCallback((ids: string[]) => {
        setEdges((prev) => prev.filter((edge) => !ids.includes(edge.id)));
        setSelectedEdgeIds((prev) => {
            const next = new Set(prev);
            ids.forEach(id => next.delete(id));
            return next;
        });
    }, []);

    return {
        nodes,
        edges,
        selectedNodeIds,
        setSelectedNodeIds,
        selectedEdgeIds,
        setSelectedEdgeIds,
        addNode,
        updateNode,
        removeNode,
        removeNodes,
        addEdge,
        removeEdge,
        removeEdges,
        setNodes,
        setEdges,
    };
};
