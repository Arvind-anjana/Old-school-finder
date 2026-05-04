import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import AnalysisForm from './components/AnalysisForm'
import RecommendationCard from './components/RecommendationCard'
import useSchoolStore from './store/useSchoolStore'

export default function App() {
  const { step } = useSchoolStore()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-24 pb-16 px-4 sm:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-10 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            NEP 2020 Compliance Engine · Samagra Shiksha Abhiyan
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient leading-tight">
            Standardizing Odd<br />
            <span className="text-gradient-indigo">School Structures</span>
          </h1>
          <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto">
            Real-time analysis of school grade configurations against NEP 2020's
            5+3+3+4 framework. Identify structural misalignments and get
            evidence-based restructuring recommendations.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-2xl space-y-6">
          <AnimatePresence mode="wait">
            {step < 3 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnalysisForm />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-6"
              >
                <RecommendationCard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-zinc-700 text-center">
          Data processed in-browser · Submitted records saved to Samagra Shiksha Audit DB
        </p>
      </main>
    </div>
  )
}
