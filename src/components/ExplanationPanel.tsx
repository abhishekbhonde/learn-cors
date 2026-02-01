'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationOutput } from '../lib/corsLogic';

interface Props {
    result: SimulationOutput | null;
    visible: boolean;
    onLearnMore: (section: string) => void;
}

export default function ExplanationPanel({ result, visible, onLearnMore }: Props) {
    if (!result) return null;

    const learnMoreSection = result.preflightRequired ? 'preflight' : result.result.includes('SAME_ORIGIN') ? 'sop' : 'intro';

    const isBlocked = result.wasBlocked;
    const statusLabel = isBlocked ? '✗ BLOCKED' : '✓ ALLOWED';
    const statusColor = isBlocked ? 'text-red-500' : 'text-green-500';
    const borderColor = isBlocked ? 'border-red-500/30' : 'border-green-500/30';

    // Stats chips
    const Chip = ({ label, value }: { label: string, value: string }) => (
        <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-white/50 backdrop-blur-sm">
            <span className="text-white/30 mr-1">{label}:</span>
            <span className="text-white/80">{value}</span>
        </div>
    );

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-2xl border ${borderColor} bg-black/70 backdrop-blur-2xl p-6 shadow-2xl overflow-hidden`}
                >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
                        <div className={`text-base font-bold ${statusColor} tracking-wide`}>
                            {statusLabel}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
                            {result.result.replace(/_/g, ' ')}
                        </div>
                    </div>

                    {/* Explanation Body */}
                    <div className="mb-4">
                        <p className="text-[13px] leading-relaxed text-white/70">
                            {result.explanation}
                        </p>
                    </div>

                    {/* Footer Stats & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        <div className="flex flex-wrap gap-2">
                            <Chip label="Cross-Origin" value={String(!result.result.includes('SAME_ORIGIN'))} />
                            <Chip label="Preflight" value={result.preflightRequired ? "Yes" : "No"} />
                            <Chip label="Final" value={result.wasBlocked ? "Blocked" : "Allowed"} />
                        </div>

                        <button
                            onClick={() => onLearnMore(learnMoreSection)}
                            className="text-[10px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
                        >
                            Learn this concept in detail →
                        </button>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
