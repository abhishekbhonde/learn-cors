'use client';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface DocsProps {
    onBack: () => void;
    activeSection?: string;
}

const SECTIONS = [
    {
        id: 'intro',
        title: 'What is CORS?',
        content: `CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers to control how web applications at one origin can interact with resources at a different origin. It's a way for servers to say "I trust this other domain and it's okay for them to access my data."`
    },
    {
        id: 'sop',
        title: 'Same-Origin Policy',
        content: `By default, browsers follow the Same-Origin Policy (SOP). This prevents a malicious script on one page from obtaining access to sensitive data on another web page through that page's Document Object Model (DOM). An origin is defined by the **protocol**, **host**, and **port**.`
    },
    {
        id: 'simple',
        title: 'Simple Requests',
        content: `Some requests don't trigger a preflight. These are called "Simple Requests". They must meet specific criteria:
- Method is GET, HEAD, or POST.
- Only safe headers are used (Accept, Accept-Language, Content-Language, Content-Type).
- Content-Type is limited to application/x-www-form-urlencoded, multipart/form-data, or text/plain.`
    },
    {
        id: 'preflight',
        title: 'Preflight (OPTIONS)',
        content: `If a request is not "simple" (e.g., uses PUT, DELETE, or custom headers like 'Authorization'), the browser sends a **Preflight Request** using the OPTIONS method. 
        
The preflight checks if the server is aware of and permits the actual request. The server must respond with appropriate 'Access-Control-Allow-*' headers for the actual request to proceed.`
    },
    {
        id: 'headers',
        title: 'Key CORS Headers',
        content: `
- **Access-Control-Allow-Origin**: Specifies which origins are allowed.
- **Access-Control-Allow-Methods**: Lists the allowed HTTP methods.
- **Access-Control-Allow-Headers**: Lists the allowed custom headers.
- **Access-Control-Max-Age**: How long the preflight result can be cached.
`
    }
];

export default function Docs({ onBack, activeSection }: DocsProps) {
    useEffect(() => {
        if (activeSection) {
            const element = document.getElementById(activeSection);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [activeSection]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] bg-[#050810] overflow-y-auto font-sans text-white p-6 md:p-12"
        >
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-white transition-colors uppercase tracking-[2px] text-xs font-bold"
                >
                    ← Back to Simulator
                </button>

                <h1 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                    CORS Documentation
                </h1>
                <p className="text-white/50 mb-12 max-w-2xl leading-relaxed">
                    A deep dive into how Cross-Origin Resource Sharing works in modern browsers.
                    Understand the mechanics behind security and resource accessibility.
                </p>

                <div className="grid md:grid-cols-[200px_1fr] gap-12">
                    {/* Sticky Navigation */}
                    <aside className="hidden md:block sticky top-12 h-fit">
                        <nav className="flex flex-col gap-4 border-l border-white/10 pl-6">
                            {SECTIONS.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className={`text-sm transition-colors ${activeSection === section.id ? 'text-cyan-400 font-bold' : 'text-white/40 hover:text-white'}`}
                                >
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="flex flex-col gap-16 pb-24">
                        {SECTIONS.map((section) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="scroll-mt-12 transition-all duration-500"
                            >
                                <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-cyan-400 rounded-full inline-block" />
                                    {section.title}
                                </h2>
                                <div className="text-white/80 leading-[1.8] whitespace-pre-wrap text-lg">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
