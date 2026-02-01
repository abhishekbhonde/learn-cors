export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface SimulationInput {
    method: RequestMethod;
    isSameOrigin: boolean;
    corsEnabled: boolean;        // Server has Access-Control-Allow-Origin header
    hasCustomHeaders: boolean;   // Request includes custom headers like Authorization
}

export type SimulationResult =
    | 'SAME_ORIGIN_ALLOWED'
    | 'SIMPLE_CORS_ALLOWED'
    | 'PREFLIGHT_THEN_ALLOWED'
    | 'PREFLIGHT_THEN_BLOCKED'
    | 'BLOCKED_NO_CORS';

export interface SimulationOutput {
    result: SimulationResult;
    steps: AnimationStep[];       // ordered steps for animation
    explanation: string;          // human-readable what happened
    preflightRequired: boolean;
    wasBlocked: boolean;
}

export type AnimationStep =
    | 'LAUNCH_MAIN'               // Main packet spawn + burst
    | 'TRAVEL_MAIN'               // Main packet arc
    | 'IMPACT_SUCCESS'            // Green explosion + ring
    | 'IMPACT_BLOCKED'            // Red shatter + ring
    | 'LAUNCH_PREFLIGHT'          // Purple octahedron spawn
    | 'TRAVEL_PREFLIGHT'          // Purple octahedron arc
    | 'PREFLIGHT_SUCCESS'         // Green flash + ring
    | 'PREFLIGHT_BLOCKED'         // Red shatter + ring
    | 'RESPONSE_TRAVEL';          // Green response packet back to browser

export function runCorsSimulation(input: SimulationInput): SimulationOutput {
    const { method, isSameOrigin, corsEnabled, hasCustomHeaders } = input;

    // CASE 1: Same Origin
    if (isSameOrigin) {
        return {
            result: 'SAME_ORIGIN_ALLOWED',
            steps: ['LAUNCH_MAIN', 'TRAVEL_MAIN', 'IMPACT_SUCCESS', 'RESPONSE_TRAVEL'],
            explanation: 'Same origin request. No CORS check required. The browser allows the request directly.',
            preflightRequired: false,
            wasBlocked: false,
        };
    }

    const isSimpleMethod = method === 'GET' || method === 'POST';
    const isSimpleRequest = isSimpleMethod && !hasCustomHeaders;

    // CASE 2: Cross-Origin, Simple Request
    if (isSimpleRequest) {
        if (corsEnabled) {
            return {
                result: 'SIMPLE_CORS_ALLOWED',
                steps: ['LAUNCH_MAIN', 'TRAVEL_MAIN', 'IMPACT_SUCCESS', 'RESPONSE_TRAVEL'],
                explanation: 'Simple cross-origin request. Server sends CORS headers (Access-Control-Allow-Origin). Browser allows it.',
                preflightRequired: false,
                wasBlocked: false,
            };
        } else {
            return {
                result: 'BLOCKED_NO_CORS',
                steps: ['LAUNCH_MAIN', 'TRAVEL_MAIN', 'IMPACT_BLOCKED'],
                explanation: 'Simple cross-origin request. Server is missing CORS headers. Browser blocks the response.',
                preflightRequired: false,
                wasBlocked: true,
            };
        }
    }

    // CASE 3: Preflight Required
    const needsPreflight = hasCustomHeaders || !isSimpleMethod;
    if (needsPreflight) {
        if (corsEnabled) {
            return {
                result: 'PREFLIGHT_THEN_ALLOWED',
                steps: [
                    'LAUNCH_PREFLIGHT', 'TRAVEL_PREFLIGHT', 'PREFLIGHT_SUCCESS',
                    'LAUNCH_MAIN', 'TRAVEL_MAIN', 'IMPACT_SUCCESS', 'RESPONSE_TRAVEL'
                ],
                explanation: 'Preflight required. Browser sends OPTIONS request. Server approves it. Browser then sends the actual request.',
                preflightRequired: true,
                wasBlocked: false,
            };
        } else {
            return {
                result: 'PREFLIGHT_THEN_BLOCKED',
                steps: ['LAUNCH_PREFLIGHT', 'TRAVEL_PREFLIGHT', 'PREFLIGHT_BLOCKED'],
                explanation: 'Preflight required. Browser sends OPTIONS request. Server REJECTS it (no CORS headers). Actual request is never sent.',
                preflightRequired: true,
                wasBlocked: true,
            };
        }
    }

    // Fallback (shouldn't happen with current logic coverage)
    return {
        result: 'BLOCKED_NO_CORS',
        steps: ['LAUNCH_MAIN', 'TRAVEL_MAIN', 'IMPACT_BLOCKED'],
        explanation: 'Request blocked by CORS policy.',
        preflightRequired: false,
        wasBlocked: true,
    };
}
