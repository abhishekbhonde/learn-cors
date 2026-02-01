'use client';
import { AnimatePresence, motion } from 'framer-motion';

interface ControlPanelProps {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    setMethod: (m: any) => void;
    isSameOrigin: boolean;
    setIsSameOrigin: (v: boolean) => void;
    corsEnabled: boolean;
    setCorsEnabled: (v: boolean) => void;
    hasCustomHeaders: boolean;
    setHasCustomHeaders: (v: boolean) => void;
    onRun: () => void;
    onDemoMode: () => void;
    isRunning: boolean;
}

export default function ControlPanel(props: ControlPanelProps) {
    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-[280px]">
            <motion.div
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[20px] border border-white/10 bg-black/55 backdrop-blur-[20px] p-6 shadow-[0_0_40px_rgba(0,229,255,0.06)]"
            >
                <h2 className="mb-6 text-center text-[11px] font-mono font-bold uppercase tracking-[3px] text-cyan-400">
                    Simulation Controls
                </h2>

                {/* Method Selector */}
                <div className="mb-5">
                    <span className="block mb-1 text-[11px] text-white/40 uppercase tracking-wider font-semibold">Request Method</span>
                    <select
                        value={props.method}
                        onChange={(e) => props.setMethod(e.target.value)}
                        className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>

                {/* Toggles */}
                <div className="space-y-1">
                    <ToggleSwitch
                        label="Same Origin"
                        value={props.isSameOrigin}
                        onChange={props.setIsSameOrigin}
                    />
                    <ToggleSwitch
                        label="CORS Enabled"
                        value={props.corsEnabled}
                        onChange={props.setCorsEnabled}
                    />
                    <ToggleSwitch
                        label="Custom Headers"
                        subLabel="e.g. Authorization"
                        value={props.hasCustomHeaders}
                        onChange={props.setHasCustomHeaders}
                    />
                </div>

                {/* Run Button */}
                <button
                    onClick={props.onRun}
                    disabled={props.isRunning}
                    className="mt-6 w-full rounded-xl bg-[#00e5ff] hover:bg-[#4df2ff] disabled:opacity-35 disabled:hover:bg-[#00e5ff] text-black font-bold py-3 text-[13px] transition-all cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
                >
                    {props.isRunning ? 'Running...' : 'Run Simulation'}
                </button>

                {/* Demo Button */}
                <button
                    onClick={props.onDemoMode}
                    disabled={props.isRunning}
                    className="mt-3 w-full rounded-xl border border-purple-500/40 hover:border-purple-400 text-purple-400 hover:bg-purple-500/10 py-2 text-[12px] transition-all disabled:opacity-40 cursor-pointer"
                >
                    ⚡ Auto-Play Demo
                </button>
            </motion.div>
        </div>
    );
}

function ToggleSwitch({ label, subLabel, value, onChange }: { label: string; subLabel?: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <div className="flex flex-col">
                <span className="text-[13px] text-white/70">{label}</span>
                {subLabel && <span className="text-[9px] text-white/30">{subLabel}</span>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 cursor-pointer ${value ? 'bg-cyan-500' : 'bg-white/10'}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${value ? 'translate-x-5' : ''}`}
                />
            </button>
        </div>
    );
}
