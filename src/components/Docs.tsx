'use client';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface DocsProps {
    onBack: () => void;
    activeSection?: string;
}

const SECTIONS = [
    {
        id: 'overview',
        title: 'Full Overview',
        content: `CORS (Cross-Origin Resource Sharing) is a fundamental web security mechanism that allows or restricts requested resources on a web page to be requested from another domain outside the domain from which the first resource was served.

Imagine you are visiting **website-a.com**. If that website tries to fetch data from **api.website-b.com**, the browser intervenes. Without CORS, a malicious site could easily make requests to your bank's API or your email provider's server in the background using your session cookies.

CORS provides a way for a server to explicitly say: "I allow these specific origins to access my resources, and here are the methods they are allowed to use." It is a delicate balance between **Interoperability** (making the web work together) and **Security** (protecting user data).`
    },
    {
        id: 'intro',
        title: 'What Problem does CORS Solve?',
        content: `The primary problem is **Unauthorized Cross-Origin Data Access**. 

Before CORS, if a script from origin A attempted to read data from origin B, it was strictly forbidden by the browser. However, as the web grew into an ecosystem of APIs, we needed a controlled way to "punch holes" in this security wall.

CORS allows servers to share resources across different origins while ensuring that the data is only shared with trusted parties. It converts the "everything is blocked" policy into a "tell me who you trust" policy.`
    },
    {
        id: 'sop',
        title: 'The Same-Origin Policy (SOP)',
        content: `CORS is actually an *exception* to the **Same-Origin Policy**.

Two URLs have the same origin if they have identical:
1. **Protocol** (e.g., https://)
2. **Host** (e.g., example.com)
3. **Port** (e.g., :443)

**Example Comparison (from https://site.com:80):**
- ✅ https://site.com:80/page.html (Same Origin)
- ❌ http://site.com:80/page.html (Different Protocol)
- ❌ https://api.site.com:80/ (Different Host)
- ❌ https://site.com:8080/ (Different Port)

The SOP is the "Default Security" of the browser. CORS is the "Configured Permission" granted by the server.`
    },
    {
        id: 'simple',
        title: 'Simple Requests vs. Preflighted',
        content: `Browsers categorize requests into two types to optimize performance while maintaining security.

### 1. Simple Requests
These are requests that browsers deem "safe" enough to send immediately without asking for permission first. They must use methods: **GET, HEAD, or POST**.
Headers are limited to: **Accept, Accept-Language, Content-Language, and Content-Type** (limited to text/plain, multipart/form-data, or application/x-www-form-urlencoded).

### 2. Preflighted Requests
If a request is not "simple" (e.g., it uses **JSON**, **PUT**, **DELETE**, or custom headers like **Authorization**), the browser enters a "Wait Mode". It sends a preliminary check called an **OPTIONS** request before the real one.`
    },
    {
        id: 'preflight',
        title: 'The Preflight (OPTIONS) Mechanism',
        content: `The Preflight is like a "Security Handshake".

**Step 1:** The browser sends an **OPTIONS** request to the server.
**Step 2:** The request includes headers like \`Access-Control-Request-Method\` (e.g., PUT) and \`Access-Control-Request-Headers\` (e.g., Authorization).
**Step 3:** The server inspects these. If it allows them, it responds with \`Access-Control-Allow-Origin\`, \`Methods\`, and \`Headers\`.
**Step 4:** The browser only sends the *actual* request if the preflight response is successful.

**Why do we need this?** It protects legacy servers that were built before CORS and might perform dangerous actions on PUT/DELETE requests without checking for cross-origin permissions.`
    },
    {
        id: 'headers',
        title: 'Key CORS Response Headers',
        content: `These are the headers your **Server** must send to the **Browser**:

- **Access-Control-Allow-Origin**: The most important one. Can be \`*\` (everything), or a specific origin like \`https://app.com\`.
- **Access-Control-Allow-Methods**: e.g., \`GET, POST, OPTIONS, PUT\`.
- **Access-Control-Allow-Headers**: e.g., \`Content-Type, Authorization\`.
- **Access-Control-Allow-Credentials**: Set to \`true\` if you want to allow sending cookies.
- **Access-Control-Max-Age**: Tells the browser how many seconds to cache the preflight result (to avoid sending OPTIONS for every single request).`
    },
    {
        id: 'troubleshooting',
        title: 'Common Errors & Solutions',
        content: `### 1. "No 'Access-Control-Allow-Origin' header is present"
**Cause:** The server didn't send the CORS header at all.
**Fix:** Add the \`Access-Control-Allow-Origin\` header to your server's response.

### 2. "Method not allowed"
**Cause:** You are trying a PUT/DELETE but the server only listed GET/POST.
**Fix:** Update \`Access-Control-Allow-Methods\` on the server.

### 3. "The 'Access-Control-Allow-Origin' header contains multiple values"
**Cause:** The server misconfigured the header to send a list instead of a single origin.
**Fix:** Ensure only the requesting origin (or \`*\`) is sent.`
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
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[#050810] flex overflow-hidden font-sans text-white"
        >
            {/* Left Sidebar Navigation */}
            <aside className="w-[300px] border-r border-white/5 bg-black/20 p-8 hidden lg:flex flex-col">
                <button
                    onClick={onBack}
                    className="mb-12 flex items-center gap-2 text-cyan-400 hover:text-white transition-colors uppercase tracking-[2px] text-xs font-bold"
                >
                    ← Back to Simulator
                </button>

                <div className="text-[10px] uppercase tracking-[3px] text-white/20 mb-6 font-bold">
                    Core Concepts
                </div>

                <nav className="flex flex-col gap-1">
                    {SECTIONS.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className={`px-4 py-3 rounded-xl transition-all text-sm group flex items-center gap-3 ${activeSection === section.id
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(0,229,255,0.05)]'
                                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSection === section.id ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,1)]' : 'bg-white/10 group-hover:bg-white/30'}`} />
                            {section.title}
                        </a>
                    ))}
                </nav>

                <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest font-bold">
                        Pro Tip:
                    </p>
                    <p className="text-[11px] text-white/50 mt-1 italic">
                        CORS is a browser-only security feature. Tools like Postman or cURL don't enforce it!
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
                    <div className="mb-20">
                        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] uppercase font-bold tracking-[2px] mb-6">
                            Security Handbook
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter drop-shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                            Cross-Origin Resource Sharing
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-8" />
                        <p className="text-xl text-white/50 leading-relaxed">
                            A complete guide to understanding, implementing, and debugging CORS in modern web applications.
                        </p>
                    </div>

                    <div className="space-y-24 pb-32">
                        {SECTIONS.map((section) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="group scroll-mt-24"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="text-4xl font-mono text-white/5 font-black">
                                        {SECTIONS.indexOf(section) < 9 ? `0${SECTIONS.indexOf(section) + 1}` : SECTIONS.indexOf(section) + 1}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                        {section.title}
                                    </h2>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <div className="text-xl text-white/70 leading-[1.8] whitespace-pre-wrap font-light border-l-4 border-white/5 pl-8 py-2">
                                        {section.content}
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tiny Mobile Back Button */}
            <button
                onClick={onBack}
                className="lg:hidden fixed bottom-6 right-6 px-6 py-3 rounded-full bg-cyan-500 text-black font-black text-xs uppercase tracking-widest shadow-2xl z-[110]"
            >
                Close Docs
            </button>
        </motion.div>
    );
}
