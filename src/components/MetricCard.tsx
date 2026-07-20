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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-[#06060c] border border-[#161c33] rounded-2xl p-4.5 shadow-sm hover:shadow-emerald-950/20 hover:border-emerald-500/25 transition-all flex items-center justify-between group"
    >
      {/* Subtle ambient glow effect inside the card */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
      
      <div className="space-y-1 relative z-10">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
          // {title}
        </span>
        <h3 className="text-lg font-extrabold text-slate-100 tracking-tight leading-none font-sans mt-0.5">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-2 rounded-xl shrink-0 ${color} relative z-10 group-hover:scale-105 transition-transform duration-300`}>
        {icon}
      </div>
    </motion.div>
  );
};

