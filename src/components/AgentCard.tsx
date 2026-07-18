import React from 'react';
import { AgentInfo } from '../types';
import { motion } from 'motion/react';
import { Cpu, CheckCircle2, Play, AlertCircle, Clock, Zap } from 'lucide-react';

interface AgentCardProps {
  id: string;
  agent: AgentInfo;
  onConfigure: (id: string, efficiency: number) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ id, agent, onConfigure }) => {
  const getStatusBadge = () => {
    switch (agent.status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Processando
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Pausado
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900">
            <AlertCircle size={12} />
            Erro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <CheckCircle2 size={12} />
            Ativo
          </span>
        );
    }
  };

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins}m ${remainSecs}s`;
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-5 rounded-xl border bg-white dark:bg-slate-900 transition-all ${
        agent.status === 'running'
          ? 'border-emerald-500 shadow-sm shadow-emerald-100/50 dark:shadow-emerald-950/10'
          : 'border-slate-100 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            agent.status === 'running' 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
              : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            <Cpu size={18} className={agent.status === 'running' ? 'animate-spin' : ''} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              {agent.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {agent.role}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 h-8">
        {agent.description}
      </p>

      {agent.currentTask && (
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-0.5">
            Trabalho Atual
          </span>
          <span className="text-xs text-emerald-950 dark:text-emerald-200 line-clamp-1">
            {agent.currentTask}
          </span>
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-slate-50 dark:border-slate-800 text-xs">
        {/* Efficiency */}
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Zap size={12} /> Eficiência do Agente
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{agent.efficiency}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${agent.efficiency}%` }}
            />
          </div>
        </div>

        {/* Total stats */}
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Clock size={12} /> Tempo de Execução
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {formatTime(agent.executionTime)}
          </span>
        </div>

        {/* Change efficiency speed slider */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Ajustar Eficiência:</span>
          <input
            type="range"
            min="50"
            max="100"
            value={agent.efficiency}
            onChange={(e) => onConfigure(agent.id, parseInt(e.target.value))}
            className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 dark:bg-slate-700"
          />
        </div>
      </div>
    </motion.div>
  );
};
