'use client';

export default function SplineBackground() {
    return (
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-[#020208]" />

            {/* Radial gradient for depth */}
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background: 'radial-gradient(ellipse at 30% 40%, rgba(0, 229, 255, 0.08) 0%, transparent 50%)',
                }}
            />
            <div
                className="absolute inset-0 opacity-50"
                style={{
                    background: 'radial-gradient(ellipse at 70% 60%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)',
                }}
            />

            {/* Animated noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.5) 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px',
                }}
            />
        </div>
    );
}
