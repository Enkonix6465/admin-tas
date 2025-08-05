import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface PerformanceGraphProps {
  overallPerformance: number;
  onTimeRate: number;
  overdueTasks: number;
  avgDelay: string;
  className?: string;
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({
  overallPerformance,
  onTimeRate,
  overdueTasks,
  avgDelay,
  className = ""
}) => {
  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-600 dark:text-green-400';
    if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceBg = (value: number) => {
    if (value >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (value >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`liquid-glass-card ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Overview
        </h3>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
            {overallPerformance >= 80 ? 'Improving' : 'Needs Attention'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Performance */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`${getPerformanceBg(overallPerformance)} rounded-xl p-4 border border-gray-200 dark:border-purple-500/30`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overall Performance
            </span>
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getPerformanceColor(overallPerformance)}`}>
              {overallPerformance}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPerformance}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${
                overallPerformance >= 80 ? 'bg-green-500' : 
                overallPerformance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </motion.div>

        {/* On-Time Rate */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`${getPerformanceBg(onTimeRate)} rounded-xl p-4 border border-gray-200 dark:border-purple-500/30`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              On-Time Rate
            </span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${getPerformanceColor(onTimeRate)}`}>
              {onTimeRate}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${onTimeRate}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className={`h-2 rounded-full ${
                onTimeRate >= 80 ? 'bg-green-500' : 
                onTimeRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </motion.div>

        {/* Overdue Tasks */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-gray-200 dark:border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overdue Tasks
            </span>
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {overdueTasks}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Need attention
          </p>
        </motion.div>

        {/* Average Delay */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-gray-200 dark:border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg Delay
            </span>
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {avgDelay}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Per task
          </p>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Performance Summary
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {overallPerformance >= 80 
                ? 'Excellent performance! Keep up the great work.' 
                : overallPerformance >= 60 
                ? 'Good progress, but there\'s room for improvement.' 
                : 'Performance needs attention. Consider reviewing processes.'
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
