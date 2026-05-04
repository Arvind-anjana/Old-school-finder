import React from 'react'
import { GraduationCap, BookOpen } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="border-b border-white/8 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest leading-none">
                Ministry of Education
              </p>
              <p className="text-sm font-bold text-zinc-100 leading-tight mt-0.5">
                Samagra Shiksha Abhiyan
              </p>
            </div>
          </div>

          {/* Right: Tool label */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500 hidden sm:block">
              School Structure Audit Tool
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
