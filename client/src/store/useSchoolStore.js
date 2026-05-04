import { create } from 'zustand'

// ─── Standard Configurations ──────────────────────────────────────────────────
export const STANDARD_CONFIGS = [
  { label: 'Foundational', start: 0, end: 2, description: 'Pre-KG to Grade 2' },
  { label: 'Preparatory',  start: 3, end: 5, description: 'Grade 3 to Grade 5' },
  { label: 'Middle',       start: 6, end: 8, description: 'Grade 6 to Grade 8' },
  { label: 'Secondary',    start: 9, end: 12, description: 'Grade 9 to Grade 12' },
  { label: 'Integrated',   start: 1, end: 12, description: 'Grade 1 to Grade 12' },
]

// NEP 2020 block boundaries: 5+3+3+4
// Block 1 (Foundational): Pre-KG–2  → grades 0–2
// Block 2 (Preparatory):  3–5        → grades 3–5
// Block 3 (Middle):       6–8        → grades 6–8
// Block 4 (Secondary):    9–12       → grades 9–12
const NEP_BLOCKS = [
  { start: 0, end: 2 },
  { start: 3, end: 5 },
  { start: 6, end: 8 },
  { start: 9, end: 12 },
]

// ─── Rule Engine ──────────────────────────────────────────────────────────────
function evaluateRules(startGrade, endGrade) {
  if (startGrade === null || endGrade === null) return null
  if (startGrade > endGrade) return null

  const rules = []

  // Check if standard
  const isStandard = STANDARD_CONFIGS.some(
    (c) => c.start === startGrade && c.end === endGrade
  )
  if (isStandard) {
    const match = STANDARD_CONFIGS.find((c) => c.start === startGrade && c.end === endGrade)
    return {
      isOdd: false,
      label: 'Standard Configuration',
      type: match.label,
      rules: [],
      suggestion: `This school follows the NEP 2020 "${match.label}" stage (${match.description}). No restructuring required.`,
      resourceImpact: 'No reallocation needed. Eligible for full Samagra Shiksha grants.',
      coverageGap: [],
    }
  }

  // Rule A — Fragmented Exit: ends at Grade 4 or 7
  if (endGrade === 4) {
    rules.push({
      id: 'A',
      label: 'Exit Point Mismatch',
      detail: 'School exits at Grade 4, orphaning students before the Preparatory Stage (3–5) is complete.',
    })
  }
  if (endGrade === 7) {
    rules.push({
      id: 'A',
      label: 'Exit Point Mismatch',
      detail: 'School exits at Grade 7, mid-way through the Middle Stage (6–8), causing structural fragmentation.',
    })
  }

  // Rule B — Transition Leak: starts at Grade 5 or 8
  if (startGrade === 5) {
    rules.push({
      id: 'B',
      label: 'Entry Point Mismatch',
      detail: 'School starts at Grade 5, creating a transition leak — students completing Grade 4 have no clear pathway.',
    })
  }
  if (startGrade === 8) {
    rules.push({
      id: 'B',
      label: 'Entry Point Mismatch',
      detail: 'School starts at Grade 8, causing severe drop-off pressure at the Grade 7 → 8 transition.',
    })
  }

  // Rule C — Middle-Heavy: 5–7 or 6–10
  if ((startGrade === 5 && endGrade === 7) || (startGrade === 6 && endGrade === 10)) {
    rules.push({
      id: 'C',
      label: 'Middle-Heavy Configuration',
      detail: `School spans Grades ${startGrade}–${endGrade}, crossing NEP block boundaries without completing any single stage.`,
    })
  }

  // Rule D — NEP Mismatch: check if the range fully covers at least one complete NEP block
  const coversFullBlock = NEP_BLOCKS.some(
    (block) => startGrade <= block.start && endGrade >= block.end
  )
  if (!coversFullBlock) {
    rules.push({
      id: 'D',
      label: 'NEP 2020 Non-Compliant',
      detail: `Grades ${startGrade}–${endGrade} do not fully cover any of the 5+3+3+4 NEP blocks (Foundational, Preparatory, Middle, or Secondary).`,
    })
  }

  // Compute coverage gaps (grades not covered by NEP blocks that include this range)
  const coverageGap = []
  NEP_BLOCKS.forEach((block) => {
    const overlapStart = Math.max(startGrade, block.start)
    const overlapEnd   = Math.min(endGrade, block.end)
    if (overlapStart <= overlapEnd) {
      // Partially overlaps — flag any missing grades in this block
      for (let g = block.start; g <= block.end; g++) {
        if (g < startGrade || g > endGrade) coverageGap.push(g)
      }
    }
  })

  // Generate suggestion
  const suggestion = buildSuggestion(startGrade, endGrade, rules)
  const resourceImpact = buildResourceImpact(rules)

  return {
    isOdd: rules.length > 0,
    label: rules.length > 0 ? 'Odd Structure Detected' : 'Standard Configuration',
    type: 'Custom',
    rules,
    suggestion,
    resourceImpact,
    coverageGap: [...new Set(coverageGap)],
  }
}

function buildSuggestion(start, end, rules) {
  const ruleIds = rules.map((r) => r.id)
  if (ruleIds.includes('A') && end === 4) {
    return 'Extend school to Grade 5 to complete the Preparatory Stage (Grades 3–5), or merge with a nearby Preparatory-stage school.'
  }
  if (ruleIds.includes('A') && end === 7) {
    return 'Extend school to Grade 8 to complete the Middle Stage (Grades 6–8), ensuring students are not displaced mid-cycle.'
  }
  if (ruleIds.includes('B') && start === 5) {
    return 'Lower entry to Grade 3 to form a complete Preparatory Block (3–5), or realign as a Middle School starting at Grade 6.'
  }
  if (ruleIds.includes('B') && start === 8) {
    return 'Lower entry to Grade 6 to form a complete Middle Block (6–8). Coordinate with feeder schools to prevent Grade 7 dropout.'
  }
  if (ruleIds.includes('C')) {
    return `Restructure to align with a standard NEP block: Middle (6–8) + Secondary (9–12), or seek cluster-level integration with Grades ${start < 6 ? '3–5' : '9–12'}.`
  }
  if (ruleIds.includes('D')) {
    return `Realign Grades ${start}–${end} to match a complete NEP 2020 stage. Recommended: expand or contract to the nearest standard boundary (Foundational 0–2, Preparatory 3–5, Middle 6–8, or Secondary 9–12).`
  }
  return 'Review grade configuration against NEP 2020 5+3+3+4 framework and consult the district Samagra Shiksha coordinator.'
}

function buildResourceImpact(rules) {
  if (rules.length === 0) return 'No reallocation needed. Eligible for full Samagra Shiksha grants.'
  const ruleIds = rules.map((r) => r.id)
  if (ruleIds.includes('C') || (ruleIds.includes('A') && ruleIds.includes('B'))) {
    return 'High impact: Likely ineligible for Middle School infrastructure grants. Composite school merger recommended to optimize teacher deployment and SMC governance.'
  }
  if (ruleIds.includes('D')) {
    return 'Medium impact: Grant eligibility may be partial. Rationalization under Samagra Shiksha composite school norms advised. UDISE re-categorization required.'
  }
  return 'Low–Medium impact: Minor restructuring required. Coordinate with Block Education Officer for transition support and student tracking (APAAR ID linkage).'
}

// ─── Zustand Store ─────────────────────────────────────────────────────────────
const useSchoolStore = create((set, get) => ({
  // Form data
  udise: '',
  schoolName: '',
  district: '',
  state: '',
  studentCount: '',
  startGrade: null,
  endGrade: null,

  // UI state
  step: 1,
  isSubmitting: false,
  isSubmitted: false,
  submitError: null,

  // Live analysis (computed on grade change)
  analysisResult: null,

  // Actions
  setField: (field, value) => set({ [field]: value }),

  setGrades: (startGrade, endGrade) => {
    const analysisResult = evaluateRules(startGrade, endGrade)
    set({ startGrade, endGrade, analysisResult })
  },

  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 3) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  goToStep: (n) => set({ step: n }),

  submitAnalysis: async () => {
    const { udise, schoolName, district, state, studentCount, startGrade, endGrade, analysisResult } = get()
    set({ isSubmitting: true, submitError: null })
    try {
      await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udise, schoolName, district, state, studentCount, startGrade, endGrade, analysisResult }),
      })
      set({ isSubmitting: false, isSubmitted: true, step: 3 })
    } catch (err) {
      // Still proceed to results even if backend is unavailable
      set({ isSubmitting: false, isSubmitted: true, step: 3, submitError: 'Backend unavailable — results shown locally.' })
    }
  },

  reset: () => set({
    udise: '', schoolName: '', district: '', state: '', studentCount: '',
    startGrade: null, endGrade: null, analysisResult: null,
    step: 1, isSubmitting: false, isSubmitted: false, submitError: null,
  }),
}))

export default useSchoolStore
