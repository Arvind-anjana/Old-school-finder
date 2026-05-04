import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSchoolStore from '../store/useSchoolStore'

// Grade labels: 0 = Pre-KG, 1–12 = standard
const GRADE_LABELS = {
  0:  'PKG',
  1:  '1',  2:  '2',  3:  '3',  4:  '4',
  5:  '5',  6:  '6',  7:  '7',  8:  '8',
  9:  '9',  10: '10', 11: '11', 12: '12',
}

// NEP block separators
const NEP_BLOCKS = [
  { label: 'Foundational', start: 0, end: 2,  color: 'from-violet-500/20 to-violet-500/10' },
  { label: 'Preparatory',  start: 3, end: 5,  color: 'from-blue-500/20 to-blue-500/10' },
  { label: 'Middle',       start: 6, end: 8,  color: 'from-cyan-500/20 to-cyan-500/10' },
  { label: 'Secondary',    start: 9, end: 12, color: 'from-teal-500/20 to-teal-500/10' },
]

const ALL_GRADES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function getGradeStatus(grade, startGrade, endGrade, coverageGap) {
  if (startGrade === null || endGrade === null) return 'idle'
  const inRange = grade >= startGrade && grade <= endGrade
  const isGap   = coverageGap?.includes(grade)
  if (inRange) return 'selected'
  if (isGap)   return 'gap'
  return 'idle'
}

export default function RuleVisualizer() {
  const { startGrade, endGrade, analysisResult } = useSchoolStore()

  const isOdd     = analysisResult?.isOdd ?? false
  const coverageGap = analysisResult?.coverageGap ?? []

  const selectedColor = useMemo(() => {
    if (!analysisResult) return 'bg-zinc-700'
    if (!analysisResult.isOdd) return 'bg-emerald-500'
    const ruleIds = analysisResult.rules.map(r => r.id)
    if (ruleIds.includes('C') || ruleIds.includes('D')) return 'bg-red-500'
    return 'bg-amber-500'
  }, [analysisResult])

  const glowColor = useMemo(() => {
    if (!analysisResult) return ''
    if (!analysisResult.isOdd) return 'shadow-emerald-500/30'
    const ruleIds = analysisResult.rules.map(r => r.id)
    if (ruleIds.includes('C') || ruleIds.includes('D')) return 'shadow-red-500/30'
    return 'shadow-amber-500/30'
  }, [analysisResult])

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Grade Timeline Visualizer</h3>
        {analysisResult && (
          <motion.span
            key={analysisResult.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              !isOdd
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                : analysisResult.rules.some(r => r.id === 'C' || r.id === 'D')
                ? 'bg-red-500/15 text-red-400 border-red-500/25'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
            }`}
          >
            {analysisResult.label}
          </motion.span>
        )}
      </div>

      {/* NEP Block Labels */}
      <div className="flex text-[9px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
        {NEP_BLOCKS.map(block => (
          <div
            key={block.label}
            className="flex-shrink-0 text-center"
            style={{ width: `${((block.end - block.start + 1) / 13) * 100}%` }}
          >
            {block.label}
          </div>
        ))}
      </div>

      {/* Grade Cells */}
      <div className="relative flex items-stretch gap-1">
        {ALL_GRADES.map((grade, idx) => {
          const status = getGradeStatus(grade, startGrade, endGrade, coverageGap)
          const isFirst = grade === startGrade
          const isLast  = grade === endGrade
          return (
            <div key={grade} className="relative flex-1 flex flex-col items-center gap-1">
              {/* Separator line at NEP boundaries */}
              {(grade === 3 || grade === 6 || grade === 9) && (
                <div className="absolute -left-0.5 top-0 bottom-0 w-px bg-zinc-700/50 z-10" />
              )}

              <motion.div
                layout
                animate={{
                  backgroundColor:
                    status === 'selected'
                      ? isOdd
                        ? analysisResult?.rules.some(r => r.id === 'C' || r.id === 'D')
                          ? 'rgba(239,68,68,0.75)'
                          : 'rgba(245,158,11,0.75)'
                        : 'rgba(52,211,153,0.75)'
                      : status === 'gap'
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(39,39,42,0.6)',
                  scale: status === 'selected' ? 1 : 0.95,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`w-full h-10 rounded-lg flex items-center justify-center relative overflow-hidden
                  ${status === 'selected' ? `shadow-md ${glowColor}` : ''}
                  ${status === 'gap' ? 'border border-dashed border-indigo-500/40' : 'border border-zinc-800/50'}
                `}
              >
                {/* Shimmer on selected */}
                {status === 'selected' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                )}
                {/* Gap pulse */}
                {status === 'gap' && (
                  <motion.div
                    className="absolute inset-0 bg-indigo-500/10 rounded-lg"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <span className={`text-[10px] font-bold z-10 ${
                  status === 'selected' ? 'text-white' : status === 'gap' ? 'text-indigo-400' : 'text-zinc-600'
                }`}>
                  {GRADE_LABELS[grade]}
                </span>
              </motion.div>

              {/* Connector dots for selected range */}
              {status === 'selected' && !isLast && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current opacity-50 translate-x-full" />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1">
        <LegendItem color="bg-emerald-500/70" label="Standard" />
        <LegendItem color="bg-amber-500/70"   label="Misaligned" />
        <LegendItem color="bg-red-500/70"     label="Critical" />
        <LegendItem color="border-dashed border border-indigo-500/40 bg-indigo-500/10" label="Coverage Gap" isGap />
      </div>

      {/* Active range summary */}
      <AnimatePresence>
        {startGrade !== null && endGrade !== null && (
          <motion.div
            key={`${startGrade}-${endGrade}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 pt-1 border-t border-white/6"
          >
            <span className="text-xs text-zinc-500">Selected:</span>
            <span className="text-xs font-semibold text-zinc-200">
              {startGrade === 0 ? 'Pre-KG' : `Grade ${startGrade}`} → Grade {endGrade}
            </span>
            <span className="text-xs text-zinc-600">({endGrade - startGrade + 1} levels)</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LegendItem({ color, label, isGap }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  )
}
