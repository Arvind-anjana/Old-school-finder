import React from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle, AlertTriangle, XCircle, Lightbulb,
  BookOpen, Users, ChevronRight, RotateCcw
} from 'lucide-react'
import useSchoolStore from '../store/useSchoolStore'

const RULE_COLORS = {
  A: { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/25' },
  B: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/25' },
  C: { bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/25' },
  D: { bg: 'bg-rose-500/15',   text: 'text-rose-400',   border: 'border-rose-500/25' },
}

const RULE_NAMES = {
  A: 'Rule A — Fragmented Exit',
  B: 'Rule B — Transition Leak',
  C: 'Rule C — Middle-Heavy',
  D: 'Rule D — NEP Mismatch',
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.4 } },
}

export default function RecommendationCard() {
  const { analysisResult, schoolName, udise, startGrade, endGrade, studentCount, submitError, reset } = useSchoolStore()

  if (!analysisResult) return null

  const { isOdd, label, rules, suggestion, resourceImpact, type } = analysisResult

  const isCritical = rules.some(r => r.id === 'C' || r.id === 'D')

  const StatusIcon  = !isOdd ? CheckCircle : isCritical ? XCircle : AlertTriangle
  const statusColor = !isOdd
    ? 'text-emerald-400'
    : isCritical
    ? 'text-red-400'
    : 'text-amber-400'

  const cardBorder  = !isOdd
    ? 'border-emerald-500/20'
    : isCritical
    ? 'border-red-500/20'
    : 'border-amber-500/20'

  const headerGrad  = !isOdd
    ? 'from-emerald-500/10 to-transparent'
    : isCritical
    ? 'from-red-500/10 to-transparent'
    : 'from-amber-500/10 to-transparent'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`glass-card border ${cardBorder} overflow-hidden`}
    >
      {/* Header gradient strip */}
      <div className={`bg-gradient-to-r ${headerGrad} px-6 py-5 border-b border-white/6`}>
        <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-7 h-7 flex-shrink-0 ${statusColor}`} />
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Analysis Result</p>
              <h2 className={`text-lg font-bold mt-0.5 ${statusColor}`}>{label}</h2>
            </div>
          </div>
          <span className={`badge text-xs ${
            !isOdd ? 'badge-standard' : isCritical ? 'badge-critical' : 'badge-odd'
          }`}>
            {type}
          </span>
        </motion.div>
      </div>

      <div className="p-6 space-y-5">
        {/* School info summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoPill label="School" value={schoolName || '—'} />
          <InfoPill label="UDISE" value={udise || '—'} mono />
          <InfoPill label="Grades" value={
            `${startGrade === 0 ? 'PKG' : startGrade} → ${endGrade}`
          } />
          <InfoPill label="Students" value={studentCount ? `${studentCount}` : '—'} icon={<Users className="w-3 h-3" />} />
        </motion.div>

        {/* Triggered Rules */}
        {rules.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Triggered Conditions</p>
            <div className="space-y-2">
              {rules.map((rule, i) => {
                const colors = RULE_COLORS[rule.id] || RULE_COLORS.D
                return (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-black/20 ${colors.text} flex-shrink-0 self-start mt-0.5`}>
                      {RULE_NAMES[rule.id] || `Rule ${rule.id}`}
                    </span>
                    <p className={`text-xs leading-relaxed ${colors.text}`}>{rule.detail}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Policy Suggestion */}
        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-indigo-400 mb-1">Policy Recommendation</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{suggestion}</p>
            </div>
          </div>
        </motion.div>

        {/* Resource Impact */}
        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/40">
          <div className="flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-1">Resource Allocation Impact</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{resourceImpact}</p>
            </div>
          </div>
        </motion.div>

        {/* Backend note */}
        {submitError && (
          <motion.p variants={itemVariants} className="text-xs text-zinc-600 text-center">
            ⚠ {submitError}
          </motion.p>
        )}

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex items-center justify-between pt-2 border-t border-white/6">
          <button onClick={reset} className="btn-secondary text-xs gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Analyse Another
          </button>
          <a
            href="https://samagra.education.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs"
          >
            Samagra Portal
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
}

function InfoPill({ label, value, mono, icon }) {
  return (
    <div className="bg-zinc-800/40 rounded-lg px-3 py-2 border border-zinc-700/30">
      <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold text-zinc-200 mt-0.5 truncate flex items-center gap-1 ${mono ? 'font-mono' : ''}`}>
        {icon}{value}
      </p>
    </div>
  )
}
