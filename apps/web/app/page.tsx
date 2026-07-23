import { Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E6F7FC] flex flex-col items-center py-8 px-6 font-sans">
      
      {/* Navbar */}
      <nav className="w-full max-w-6xl flex items-center justify-between bg-white rounded-full px-6 py-3 border-[3px] border-black shadow-[0_4px_0_0_#000] mb-20">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white p-1 rounded-full">
            <Zap size={16} fill="white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">DraftRoom</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700 text-sm">
          <a href="#" className="hover:text-black transition-colors">Process</a>
          <a href="#" className="hover:text-black transition-colors">Features</a>
          <a href="#" className="hover:text-black transition-colors">Why It's Different</a>
          <a href="#" className="hover:text-black transition-colors">Preview</a>
        </div>

        <button className="bg-[#15A1FA] text-white px-5 py-2 rounded-full flex items-center gap-2 font-bold text-sm hover:bg-[#3db5ff] transition-colors">
          {/* Inline SVG for GitHub */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.87-.63 1.82-.8 2.8-2.09-.5-3.55-1.5-4.8-3.5-1.2-1.5-2.4-4-3.5-6.5C.87 6.67.36 9.33 1 12c.78 2.75 2.21 5.5 4.12 7.5a7.5 7.5 0 0 0 3.88 1.5v3" />
          </svg>
          Source
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full max-w-5xl text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center bg-white border-2 border-black rounded-full overflow-hidden mb-8 shadow-sm">
          <span className="bg-[#15A1FA] text-white px-5 py-1.5 text-xs font-bold tracking-wide uppercase">
            🚀 Portfolio Project
          </span>
          <span className="px-5 py-1.5 text-xs font-medium text-gray-800 flex items-center gap-1">
            A full-stack build by one developer <ArrowRight size={14} />
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl md:text-[5rem] font-black leading-[1.05] tracking-tight text-black mb-6">
          Coding Interviews<br />
          That Feel Real.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed mx-auto mb-10">
          DraftRoom is a realtime interview platform I built to explore multiplayer editing, WebRTC and collaborative canvases — code editor, Excalidraw whiteboard, LeetCode problems and HD video in one room.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button className="bg-[#15A1FA] text-white px-8 py-3.5 rounded-full flex items-center gap-2 font-bold text-base hover:bg-[#3db5ff] transition-colors shadow-sm">
            <Zap size={18} fill="white" />
            Get Started
          </button>
          <button className="bg-white text-black border-2 border-black px-8 py-3.5 rounded-full flex items-center gap-2 font-bold text-base hover:bg-gray-50 transition-colors shadow-sm">
            {/* Inline SVG for GitHub */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.87-.63 1.82-.8 2.8-2.09-.5-3.55-1.5-4.8-3.5-1.2-1.5-2.4-4-3.5-6.5C.87 6.67.36 9.33 1 12c.78 2.75 2.21 5.5 4.12 7.5a7.5 7.5 0 0 0 3.88 1.5v3" />
            </svg>
            View Source
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl w-full text-left">
          <div className="flex items-start gap-3">
            <Zap className="text-[#15A1FA] mt-1" size={20} fill="currentColor" />
            <span className="text-gray-800 font-medium text-base">Realtime multiplayer code editor with syntax highlighting</span>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="text-[#15A1FA] mt-1" size={20} fill="currentColor" />
            <span className="text-gray-800 font-medium text-base">Excalidraw whiteboard for system design rounds</span>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="text-[#15A1FA] mt-1" size={20} fill="currentColor" />
            <span className="text-gray-800 font-medium text-base">Curated LeetCode-style problem library</span>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="text-[#15A1FA] mt-1" size={20} fill="currentColor" />
            <span className="text-gray-800 font-medium text-base">Built-in HD video calling — no Zoom link needed</span>
          </div>
        </div>

      </main>
    </div>
  );
}