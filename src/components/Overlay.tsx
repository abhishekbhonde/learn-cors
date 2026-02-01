"use client";

import { useStore } from "../store/useStore";
import { motion } from "framer-motion";

export default function Overlay() {
    const { setStation, currentStation } = useStore();

    const stations = [
        { id: 0, label: "Overview" },
        { id: 1, label: "Server Logic" },
        { id: 2, label: "Client Flow" },
    ];

    return (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
            {/* Header */}
            <header className="flex justify-between items-center pointer-events-auto">
                <h1 className="text-2xl font-bold tracking-widest uppercase text-transparen bg-clip-text text-white text-glow">
                    CORS <span className="text-cyan-400">Visualizer</span>
                </h1>
                <nav className="flex gap-4">
                    <button className="px-4 py-2 glass-panel rounded hover:bg-white/10 transition">
                        Docs
                    </button>
                </nav>
            </header>

            {/* Main Content Area - Changes based on state */}
            <main className="flex-1 flex items-center">
                <motion.div
                    key={currentStation}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="max-w-md pointer-events-auto"
                >
                    <div className="glass-panel p-6 rounded-xl border-l-4 border-cyan-400">
                        <h2 className="text-4xl font-bold mb-2">
                            {stations[currentStation].label}
                        </h2>
                        <p className="text-gray-300">
                            Interactive 3D visualization of Cross-Origin Resource Sharing logic.
                            Explore the flow between client and server.
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Footer Navigation */}
            <footer className="pointer-events-auto flex justify-center gap-4">
                {stations.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setStation(s.id)}
                        className={`px-6 py-3 rounded-full transition-all duration-300 overflow-hidden relative ${currentStation === s.id
                                ? "bg-cyan-500 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                                : "glass-panel hover:bg-white/10"
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </footer>
        </div>
    );
}
