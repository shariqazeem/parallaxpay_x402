'use client'

import { motion } from 'framer-motion'

/**
 * Reusable loading skeleton components for consistent loading states
 */

// Base shimmer animation
const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Agent Card Skeleton
export function AgentCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm"
    >
      {/* Header with avatar and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"
            style={{ backgroundSize: '400% 100%' }}
            variants={shimmer}
            initial="initial"
            animate="animate"
          />
          <div className="space-y-2">
            {/* Name */}
            <motion.div
              className="h-5 w-32 rounded bg-gradient-to-r from-gray-200 to-gray-300"
              style={{ backgroundSize: '400% 100%' }}
              variants={shimmer}
              initial="initial"
              animate="animate"
            />
            {/* Badge */}
            <motion.div
              className="h-4 w-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"
              style={{ backgroundSize: '400% 100%' }}
              variants={shimmer}
              initial="initial"
              animate="animate"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <motion.div
          className="h-4 w-full rounded bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="h-4 w-3/4 rounded bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-4 w-16 rounded bg-gradient-to-r from-gray-200 to-gray-300"
            style={{ backgroundSize: '400% 100%' }}
            variants={shimmer}
            initial="initial"
            animate="animate"
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.div
          className="h-10 flex-1 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="h-10 w-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
      </div>
    </motion.div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <motion.div
            className="h-4 w-full rounded bg-gradient-to-r from-gray-200 to-gray-300"
            style={{ backgroundSize: '400% 100%' }}
            variants={shimmer}
            initial="initial"
            animate="animate"
          />
        </td>
      ))}
    </tr>
  )
}

// Stats Card Skeleton
export function StatsCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm"
    >
      {/* Icon */}
      <motion.div
        className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 mb-4"
        style={{ backgroundSize: '400% 100%' }}
        variants={shimmer}
        initial="initial"
        animate="animate"
      />

      {/* Title */}
      <motion.div
        className="h-4 w-24 rounded bg-gradient-to-r from-gray-200 to-gray-300 mb-2"
        style={{ backgroundSize: '400% 100%' }}
        variants={shimmer}
        initial="initial"
        animate="animate"
      />

      {/* Value */}
      <motion.div
        className="h-8 w-32 rounded bg-gradient-to-r from-gray-200 to-gray-300"
        style={{ backgroundSize: '400% 100%' }}
        variants={shimmer}
        initial="initial"
        animate="animate"
      />
    </motion.div>
  )
}

// Provider Cluster Card Skeleton
export function ProviderCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className="h-6 w-40 rounded bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="h-6 w-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <motion.div
              className="h-3 w-16 rounded bg-gradient-to-r from-gray-200 to-gray-300"
              style={{ backgroundSize: '400% 100%' }}
              variants={shimmer}
              initial="initial"
              animate="animate"
            />
            <motion.div
              className="h-5 w-24 rounded bg-gradient-to-r from-gray-200 to-gray-300"
              style={{ backgroundSize: '400% 100%' }}
              variants={shimmer}
              initial="initial"
              animate="animate"
            />
          </div>
        ))}
      </div>

      {/* Toggle button */}
      <motion.div
        className="h-10 w-full rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"
        style={{ backgroundSize: '400% 100%' }}
        variants={shimmer}
        initial="initial"
        animate="animate"
      />
    </motion.div>
  )
}

// Prediction Card Skeleton (for Oracle page)
export function PredictionCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="h-6 w-48 rounded bg-gradient-to-r from-gray-200 to-gray-300"
          style={{ backgroundSize: '400% 100%' }}
          variants={shimmer}
          initial="initial"
          animate="animate"
        />
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-4 w-full rounded bg-gradient-to-r from-gray-200 to-gray-300"
            style={{ backgroundSize: '400% 100%', width: `${100 - i * 10}%` }}
            variants={shimmer}
            initial="initial"
            animate="animate"
          />
        ))}
      </div>
    </motion.div>
  )
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm"
    >
      {/* Chart bars */}
      <div className="flex items-end justify-between gap-2 h-64">
        {[60, 80, 45, 90, 70, 85, 55].map((height, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-lg bg-gradient-to-r from-gray-200 to-gray-300"
            style={{ height: `${height}%`, backgroundSize: '400% 100%' }}
            variants={shimmer}
            initial="initial"
            animate="animate"
          />
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={i}
            className="h-3 w-12 rounded bg-gradient-to-r from-gray-200 to-gray-300"
            style={{ backgroundSize: '400% 100%' }}
            variants={shimmer}
            initial="initial"
            animate="animate"
          />
        ))}
      </div>
    </motion.div>
  )
}
