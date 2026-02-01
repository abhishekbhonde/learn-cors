'use client';
import { useState, useRef, useEffect } from 'react';
import Scene from './Scene';
import SplineBackground from './SplineBackground';
import ControlPanel from './ControlPanel';
import ExplanationPanel from './ExplanationPanel';
import Docs from './Docs';
import { runCorsSimulation, type SimulationOutput, type RequestMethod, type SimulationInput } from '../lib/corsLogic';

const DEMO_SCENARIOS = [
    {
        method: 'GET', isSameOrigin: false, corsEnabled: true, hasCustomHeaders: false
    },
    {
        method: 'POST', isSameOrigin: false, corsEnabled: true, hasCustomHeaders: true
    },
    {
        method: 'PUT', isSameOrigin: false, corsEnabled: false, hasCustomHeaders: true
    },
];

export default function App() {
    const [method, setMethod] = useState<RequestMethod>('GET');
    const [isSameOrigin, setIsSameOrigin] = useState(false);
    const [corsEnabled, setCorsEnabled] = useState(true);
    const [hasCustomHeaders, setHasCustomHeaders] = useState(false);

    const [isRunning, setIsRunning] = useState(false);
    const [simulation, setSimulation] = useState<SimulationOutput | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // Demo Mode State
    const [isDemoMode, setIsDemoMode] = useState(false);
    const demoIndexRef = useRef(0);

    // Docs State
    const [showDocs, setShowDocs] = useState(false);
    const [activeDocsSection, setActiveDocsSection] = useState('intro');

    const handleRun = (overrideInput?: SimulationInput) => {
        if (isRunning) return;

        setShowExplanation(false);

        const input: SimulationInput = overrideInput || {
            method,
            isSameOrigin,
            corsEnabled,
            hasCustomHeaders,
        };

        const result = runCorsSimulation(input);
        setSimulation(result);
        setIsRunning(true);
    };

    const handleAnimationComplete = () => {
        setIsRunning(false);
        setShowExplanation(true);

        if (isDemoMode) {
            setTimeout(() => {
                const nextIndex = demoIndexRef.current + 1;
                if (nextIndex < DEMO_SCENARIOS.length) {
                    demoIndexRef.current = nextIndex;
                    const scenario = DEMO_SCENARIOS[nextIndex];
                    // Sync UI
                    setMethod(scenario.method as RequestMethod);
                    setIsSameOrigin(scenario.isSameOrigin);
                    setCorsEnabled(scenario.corsEnabled);
                    setHasCustomHeaders(scenario.hasCustomHeaders);

                    handleRun(scenario as SimulationInput);
                } else {
                    setIsDemoMode(false);
                    demoIndexRef.current = 0;
                }
            }, 3000); // 3s pause
        }
    };

    const startDemo = () => {
        if (isRunning) return;
        setIsDemoMode(true);
        demoIndexRef.current = 0;

        const scenario = DEMO_SCENARIOS[0];
        setMethod(scenario.method as RequestMethod);
        setIsSameOrigin(scenario.isSameOrigin);
        setCorsEnabled(scenario.corsEnabled);
        setHasCustomHeaders(scenario.hasCustomHeaders);

        handleRun(scenario as SimulationInput);
    };

    const openDocs = (section: string = 'intro') => {
        setActiveDocsSection(section);
        setShowDocs(true);
    };

    return (
        <main className="relative w-full h-screen overflow-hidden bg-black select-none font-sans">
            {/* Header */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-none">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[6px] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    CORS VISUALIZER
                </h1>
                <p className="text-[11px] text-white/35 tracking-[3px] mt-1 uppercase">
                    3D Web Systems Universe
                </p>
                <button
                    onClick={() => openDocs('intro')}
                    className="mt-4 pointer-events-auto px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] tracking-[2px] uppercase font-bold"
                >
                    📖 View Docs
                </button>
            </div>

            <SplineBackground />

            <Scene
                simulation={simulation}
                isRunning={isRunning}
                onAnimationComplete={handleAnimationComplete}
            />

            <ControlPanel
                method={method}
                setMethod={setMethod}
                isSameOrigin={isSameOrigin}
                setIsSameOrigin={setIsSameOrigin}
                corsEnabled={corsEnabled}
                setCorsEnabled={setCorsEnabled}
                hasCustomHeaders={hasCustomHeaders}
                setHasCustomHeaders={setHasCustomHeaders}
                onRun={() => handleRun()}
                onDemoMode={startDemo}
                isRunning={isRunning}
            />

            <ExplanationPanel
                result={simulation}
                visible={showExplanation}
                onLearnMore={(section) => openDocs(section)}
            />

            {showDocs && (
                <Docs
                    onBack={() => setShowDocs(false)}
                    activeSection={activeDocsSection}
                />
            )}

            {/* Footer */}
            <div className="fixed bottom-6 w-full px-8 flex justify-between items-center z-50 pointer-events-auto">
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/abhishekbhonde/learn-cors"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 transition-all text-[11px]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Source Code
                    </a>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium tracking-[1px] text-white/30 uppercase">
                    Made with <span className="text-red-500/60 animate-pulse">❤️</span> by Abhishek
                </div>

                <div className="opacity-30 text-[10px] italic text-white hidden md:block">
                    Visual Systems Series © 2026
                </div>
            </div>
        </main>
    );
}
