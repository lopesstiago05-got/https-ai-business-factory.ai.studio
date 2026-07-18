import React from 'react';
import { motion } from 'motion/react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  icon,
  color,
  subtitle
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
    >
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} text-white shadow-sm`}>
        {icon}
      </div>
    </motion.div>
  );
};
