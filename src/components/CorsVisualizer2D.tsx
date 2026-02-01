"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// CORS LOGIC — pure state machine, no network calls
// ═══════════════════════════════════════════════════════════════
function runCorsSimulation({ method, isSameOrigin, corsEnabled, hasCustomHeaders }: any) {
    if (isSameOrigin) {
        return { result: "SAME_ORIGIN_ALLOWED", needsPreflight: false, preflightPasses: false, blocked: false, explanation: "Same-origin request. No CORS policy is checked. The browser allows it directly without any restrictions." };
    }
    const isSimple = (method === "GET" || method === "POST") && !hasCustomHeaders;
    if (isSimple && corsEnabled) {
        return { result: "SIMPLE_CORS_ALLOWED", needsPreflight: false, preflightPasses: false, blocked: false, explanation: "Cross-origin simple request. The server includes Access-Control-Allow-Origin. The browser checks the response header and grants access to the data." };
    }
    if (isSimple && !corsEnabled) {
        return { result: "BLOCKED_NO_CORS", needsPreflight: false, preflightPasses: false, blocked: true, explanation: "Cross-origin request. The server does not return CORS headers. The browser receives the response but blocks JavaScript from reading it." };
    }
    if (corsEnabled) {
        return { result: "PREFLIGHT_THEN_ALLOWED", needsPreflight: true, preflightPasses: true, blocked: false, explanation: "Cross-origin request requiring preflight. The browser sends an OPTIONS request first. The server responds with CORS headers — preflight passes, then the actual request succeeds." };
    }
    return { result: "PREFLIGHT_THEN_BLOCKED", needsPreflight: true, preflightPasses: false, blocked: true, explanation: "Cross-origin request requiring preflight. The browser sends an OPTIONS request. The server does NOT return CORS headers — preflight fails and the actual request is never sent." };
}

// ═══════════════════════════════════════════════════════════════
// CURVE MATH — catmull-rom style bezier sampling
// ═══════════════════════════════════════════════════════════════
function getCurvePoint(t: number, points: { x: number, y: number }[]) {
    // Cubic bezier through 4 control points
    const [p0, p1, p2, p3] = points;
    const mt = 1 - t;
    return {
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
    };
}

// Forward arc: Browser (left) → Server (right)
const FORWARD_CURVE = [
    { x: 80, y: 320 },   // start at browser
    { x: 180, y: 80 },   // control 1 — pulls up
    { x: 420, y: 80 },   // control 2 — pushes right
    { x: 520, y: 320 },  // end at server
];

// Reverse arc: Server (right) → Browser (left)
const REVERSE_CURVE = [
    { x: 520, y: 320 },
    { x: 420, y: 560 },  // dips down
    { x: 180, y: 560 },  // pulls left
    { x: 80, y: 320 },   // end at browser
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function CorsVisualizer2D() {
    const [method, setMethod] = useState("GET");
    const [isSameOrigin, setIsSameOrigin] = useState(false);
    const [corsEnabled, setCorsEnabled] = useState(true);
    const [hasCustomHeaders, setHasCustomHeaders] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [packetPos, setPacketPos] = useState({ x: 80, y: 320 });
    const [opacity, setOpacity] = useState(0);
    const [color, setColor] = useState("cyan");
    const [statusText, setStatusText] = useState("");

    const runAnimation = () => {
        if (isAnimating) return;

        const sim = runCorsSimulation({ method, isSameOrigin, corsEnabled, hasCustomHeaders });
        setResult(sim);
        setIsAnimating(true);
        setOpacity(1);
        setStatusText("");

        let start = performance.now();
        const DURATION = 2000; // 2s

        const animate = (time: number) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / DURATION, 1);

            // Determine Curve & Phase based on Sim
            if (sim.needsPreflight && !sim.preflightPasses) {
                // Preflight Blocked: Go 50% way then die
                const p = progress * 2; // speed up
                if (p < 1) {
                    const pt = getCurvePoint(p, FORWARD_CURVE);
                    setPacketPos(pt);
                    setColor("purple"); // Preflight color
                    requestAnimationFrame(animate);
                } else {
                    // Blocked
                    setOpacity(0);
                    setIsAnimating(false);
                    setStatusText("🚫 BLOCKED (Preflight Failed)");
                }
            } else if (sim.needsPreflight && sim.preflightPasses) {
                // Full Preflight + Main Flow implies specific multi-stage logic
                // Simplified 2D visualization for this snippet:
                // Just show Main Flow but purple->green
                const pt = getCurvePoint(progress, FORWARD_CURVE);
                setPacketPos(pt);

                if (progress < 0.5) setColor("purple");
                else setColor("#00e5ff"); // cyan

                if (progress < 1) requestAnimationFrame(animate);
                else {
                    setIsAnimating(false);
                    setOpacity(0);
                    setStatusText("✅ ALLOWED (After Preflight)");
                }
            } else {
                // Simple Flow
                const pt = getCurvePoint(progress, FORWARD_CURVE);
                setPacketPos(pt);
                setColor("#00e5ff");

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setIsAnimating(false);
                    setOpacity(0);
                    if (sim.blocked) setStatusText("🚫 BLOCKED (CORS Missing)");
                    else setStatusText("✅ ALLOWED");
                }
            }
        };

        requestAnimationFrame(animate);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050810] text-white p-4 font-sans">
            <h1 className="text-3xl font-bold tracking-[4px] mb-8 text-cyan-400">2D LOGIC VIEWER</h1>

            {/* SVG CANVAS */}
            <div className="relative border border-white/10 rounded-3xl bg-black/40 shadow-2xl mb-8">
                <svg width="600" height="640" viewBox="0 0 600 640" className="overflow-visible">
                    {/* Paths */}
                    <path d={`M${FORWARD_CURVE[0].x},${FORWARD_CURVE[0].y} C${FORWARD_CURVE[1].x},${FORWARD_CURVE[1].y} ${FORWARD_CURVE[2].x},${FORWARD_CURVE[2].y} ${FORWARD_CURVE[3].x},${FORWARD_CURVE[3].y}`}
                        fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="5 5" />

                    {/* Browser */}
                    <rect x="30" y="270" width="100" height="100" rx="10" fill="#222" stroke="white" strokeOpacity="0.2" />
                    <text x="80" y="325" fill="white" textAnchor="middle" fontSize="12" fontFamily="monospace">BROWSER</text>

                    {/* Server */}
                    <rect x="470" y="270" width="100" height="100" rx="10" fill="#222" stroke="white" strokeOpacity="0.2" />
                    <text x="520" y="325" fill="white" textAnchor="middle" fontSize="12" fontFamily="monospace">SERVER</text>

                    {/* Packet */}
                    <circle cx={packetPos.x} cy={packetPos.y} r="8" fill={color} opacity={opacity} className="transition-colors duration-300">
                        <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
                    </circle>

                    {/* Status */}
                    <text x="300" y="600" textAnchor="middle" fill={statusText.includes("BLOCKED") ? "#ef4444" : "#22c55e"} fontSize="20" fontWeight="bold">
                        {statusText}
                    </text>
                </svg>
            </div>

            {/* CONTROLS */}
            <div className="grid grid-cols-2 gap-4 max-w-lg w-full bg-white/5 p-6 rounded-xl border border-white/10">
                <label>Method:
                    <select value={method} onChange={e => setMethod(e.target.value)} className="bg-black border border-white/20 p-1 rounded ml-2 text-sm">
                        <option>GET</option><option>POST</option><option>PUT</option>
                    </select>
                </label>
                <label><input type="checkbox" checked={isSameOrigin} onChange={e => setIsSameOrigin(e.target.checked)} /> Same Origin</label>
                <label><input type="checkbox" checked={corsEnabled} onChange={e => setCorsEnabled(e.target.checked)} /> CORS Enabled</label>
                <label><input type="checkbox" checked={hasCustomHeaders} onChange={e => setHasCustomHeaders(e.target.checked)} /> Custom Headers</label>

                <button onClick={runAnimation} disabled={isAnimating} className="col-span-2 bg-cyan-500 text-black font-bold py-2 rounded-lg hover:bg-cyan-400 disabled:opacity-50 mt-4">
                    {isAnimating ? "Running..." : "Run 2D Simulation"}
                </button>
            </div>

            {result && !isAnimating && (
                <p className="mt-4 max-w-lg text-center text-white/60 text-sm">{result.explanation}</p>
            )}

        </div>
    );
}
