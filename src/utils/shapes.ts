/*
 * Copyright (c) 2026 masakinakai3
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { FTAEventType, FTAGateType } from '../types/fta';

export const getGatePath = (type: FTAGateType, orientation: 'TB' | 'LR' = 'TB'): string => {
    if (orientation === 'LR') {
        // ... (Keep LR logic if needed, or just let it be for now)
        return 'M 60 0 L 0 0 L 0 100 L 60 100 Z';
    }

    // Standard Upright Shapes (60x60)
    switch (type) {
        case 'and_gate':
            // Flat bottom, Round top
            // M 0 60 L 60 60 L 60 30 Q 60 0 30 0 Q 0 0 0 30 Z
            return 'M 0 60 L 60 60 L 60 25 Q 60 0 30 0 Q 0 0 0 25 Z';
        case 'or_gate':
            // Curved bottom, Pointed top
            // M 0 60 Q 30 40 60 60 L 60 25 Q 60 0 30 0 Q 0 0 0 25 Z
            return 'M 0 60 Q 30 45 60 60 L 60 25 Q 60 0 30 0 Q 0 0 0 25 Z';
        default:
            return 'M 0 0 L 60 0 L 60 60 L 0 60 Z';
    }
};

export const getEventPath = (type: FTAEventType, orientation: 'TB' | 'LR' = 'TB'): string => {
    if (orientation === 'LR') {
        switch (type) {
            case 'basic_event':
                return 'M 30 30 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0';
            case 'intermediate_event':
            case 'top_event':
                return 'M 0 0 L 120 0 L 120 40 L 0 40 Z';
            default:
                return 'M 0 0 L 120 0 L 120 40 L 0 40 Z';
        }
    }

    switch (type) {
        case 'basic_event':
            // Circle (60x60 container, r=30)
            // M 30 60 m -28 0 a 28 28 0 1 0 56 0 a 28 28 0 1 0 -56 0
            return 'M 30 30 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0';
        case 'intermediate_event':
        case 'top_event':
            return 'M 0 0 L 120 0 L 120 40 L 0 40 Z';
        default:
            return 'M 0 0 L 120 0 L 120 40 L 0 40 Z';
    }
};
