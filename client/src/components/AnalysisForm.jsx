import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  School, Hash, MapPin, Users, ChevronRight, ChevronLeft,
  Check, Loader2, AlertCircle
} from 'lucide-react'
import useSchoolStore from '../store/useSchoolStore'
import RuleVisualizer from './RuleVisualizer'

// Grades available for selection: 0 = Pre-KG, 1–12
const GRADE_OPTIONS = [
  { value: 0,  label: 'Pre-KG (0)' },
  { value: 1,  label: 'Grade 1'    },
  { value: 2,  label: 'Grade 2'    },
  { value: 3,  label: 'Grade 3'    },
  { value: 4,  label: 'Grade 4'    },
  { value: 5,  label: 'Grade 5'    },
  { value: 6,  label: 'Grade 6'    },
  { value: 7,  label: 'Grade 7'    },
  { value: 8,  label: 'Grade 8'    },
  { value: 9,  label: 'Grade 9'    },
  { value: 10, label: 'Grade 10'   },
  { value: 11, label: 'Grade 11'   },
  { value: 12, label: 'Grade 12'   },
]

const STEPS = [
  { id: 1, title: 'School Info',       desc: 'Basic identification' },
  { id: 2, title: 'Grade Configuration', desc: 'Select grade range' },
]

// Validation for Step 1
function validateStep1(fields) {
  const errs = {}
  if (!fields.udise.trim())            errs.udise      = 'UDISE code is required'
  else if (!/^\d{11}$/.test(fields.udise.trim())) errs.udise = 'UDISE must be exactly 11 digits'
  if (!fields.schoolName.trim())       errs.schoolName = 'School name is required'
  if (fields.studentCount && isNaN(Number(fields.studentCount))) errs.studentCount = 'Must be a number'
  return errs
}

// Validation for Step 2
function validateStep2(start, end) {
  const errs = {}
  if (start === null)    errs.startGrade = 'Select a start grade'
  if (end === null)      errs.endGrade   = 'Select an end grade'
  if (start !== null && end !== null && start > end)
    errs.endGrade = 'End grade must be ≥ start grade'
  return errs
}

export default function AnalysisForm() {
  const {
    udise, schoolName, district, state, studentCount,
    startGrade, endGrade,
    step, isSubmitting,
    setField, setGrades, nextStep, prevStep, submitAnalysis,
  } = useSchoolStore()

  const [errors, setErrors] = useState({})

  // ── Step 1 handlers ─────────────────────────────────────────────────────────
  function handleStep1Next() {
    const errs = validateStep1({ udise, schoolName, studentCount })
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    nextStep()
  }

  // ── Step 2 handlers ─────────────────────────────────────────────────────────
  function handleStartChange(e) {
    const val = Number(e.target.value)
    const newEnd = endGrade !== null && endGrade < val ? null : endGrade
    setGrades(val, newEnd)
    setErrors({})
  }

  function handleEndChange(e) {
    const val = Number(e.target.value)
    setGrades(startGrade, val)
    setErrors({})
  }

  async function handleSubmit() {
    const errs = validateStep2(startGrade, endGrade)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    await submitAnalysis()
  }

  // ── Shared input handler ─────────────────────────────────────────────────────
  function handleField(field) {
    return (e) => {
      setField(field, e.target.value)
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const slideVariants = {
    enter:  (dir) => ({ opacity: 0, x: dir > 0 ?  40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -40 :  40 }),
  }

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <StepIndicator currentStep={step} steps={STEPS} />

      {/* Form Panel */}
      <div className="glass-card-elevated p-6 sm:p-8 min-h-[340px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={1}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-zinc-100">School Information</h2>
                <p className="text-sm text-zinc-500 mt-1">Enter the school's basic identification details.</p>
              </div>

              {/* UDISE + School Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  label="UDISE Code"
                  icon={<Hash className="w-4 h-4" />}
                  error={errors.udise}
                >
                  <input
                    id="udise"
                    type="text"
                    value={udise}
                    onChange={handleField('udise')}
                    placeholder="11-digit UDISE code"
                    maxLength={11}
                    className={`input-field font-mono ${errors.udise ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
                  />
                </FormField>

                <FormField
                  label="School Name"
                  icon={<School className="w-4 h-4" />}
                  error={errors.schoolName}
                >
                  <input
                    id="schoolName"
                    type="text"
                    value={schoolName}
                    onChange={handleField('schoolName')}
                    placeholder="Full school name"
                    className={`input-field ${errors.schoolName ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
                  />
                </FormField>
              </div>

              {/* District + State */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="District" icon={<MapPin className="w-4 h-4" />}>
                  <input
                    id="district"
                    type="text"
                    value={district}
                    onChange={handleField('district')}
                    placeholder="e.g. South Delhi"
                    className="input-field"
                  />
                </FormField>
                <FormField label="State">
                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={handleField('state')}
                    placeholder="e.g. Delhi"
                    className="input-field"
                  />
                </FormField>
              </div>

              {/* Student Count */}
              <FormField
                label="Total Student Enrolment"
                icon={<Users className="w-4 h-4" />}
                error={errors.studentCount}
                hint="Optional"
              >
                <input
                  id="studentCount"
                  type="number"
                  value={studentCount}
                  onChange={handleField('studentCount')}
                  placeholder="e.g. 420"
                  min={1}
                  className={`input-field ${errors.studentCount ? 'border-red-500/60' : ''}`}
                />
              </FormField>

              <div className="flex justify-end pt-2">
                <button id="btn-step1-next" onClick={handleStep1Next} className="btn-primary">
                  Next: Grade Config
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Grade Configuration</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Select the start and end grades — the timeline updates in real-time.
                </p>
              </div>

              {/* Grade selectors */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Start Grade" error={errors.startGrade}>
                  <select
                    id="startGrade"
                    value={startGrade ?? ''}
                    onChange={handleStartChange}
                    className={`input-field appearance-none ${errors.startGrade ? 'border-red-500/60' : ''}`}
                  >
                    <option value="" disabled>Select start grade…</option>
                    {GRADE_OPTIONS.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="End Grade" error={errors.endGrade}>
                  <select
                    id="endGrade"
                    value={endGrade ?? ''}
                    onChange={handleEndChange}
                    className={`input-field appearance-none ${errors.endGrade ? 'border-red-500/60' : ''}`}
                  >
                    <option value="" disabled>Select end grade…</option>
                    {GRADE_OPTIONS
                      .filter(g => startGrade === null || g.value >= startGrade)
                      .map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))
                    }
                  </select>
                </FormField>
              </div>

              {/* Live Visualizer */}
              <RuleVisualizer />

              {/* NEP Reference */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                <AlertCircle className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-600 leading-relaxed">
                  <span className="text-zinc-400 font-semibold">NEP 2020 Reference:</span>{' '}
                  Standard stages — Foundational (PKG–2), Preparatory (3–5), Middle (6–8), Secondary (9–12), Integrated (1–12).
                  Schools deviating from these boundaries are flagged as "Odd Structures."
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button id="btn-step2-back" onClick={prevStep} className="btn-secondary">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  id="btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
                  ) : (
                    <><Check className="w-4 h-4" /> Submit Analysis</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, idx) => {
        const done    = currentStep > s.id
        const active  = currentStep === s.id
        return (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                done   ? 'bg-indigo-500 border-indigo-500 text-white'
                : active ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-600'
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className={`text-xs font-semibold truncate transition-colors duration-300 ${
                  active ? 'text-zinc-200' : done ? 'text-zinc-400' : 'text-zinc-600'
                }`}>{s.title}</p>
                <p className="text-[10px] text-zinc-600 truncate">{s.desc}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-all duration-500 ${
                currentStep > s.id ? 'bg-indigo-500/50' : 'bg-zinc-800'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function FormField({ label, icon, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 label">
          {icon && <span className="text-zinc-600">{icon}</span>}
          {label}
        </label>
        {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
      </div>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      )}
    </div>
  )
}
