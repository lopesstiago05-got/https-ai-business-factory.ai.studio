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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PROCESSANDO
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            PAUSADO
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
            <AlertCircle size={10} />
            ERRO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 size={10} />
            CONECTADO
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

  const isRunning = agent.status === 'running';

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`relative p-5 rounded-2xl border bg-[#06060c] transition-all group overflow-hidden ${
        isRunning
          ? 'border-emerald-500/60 shadow-md shadow-emerald-500/5'
          : 'border-[#161c33] hover:border-emerald-500/60 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border transition-all ${
            isRunning 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm' 
              : 'bg-[#0b0b14] text-emerald-400 border-[#1c223a]'
          }`}>
            <Cpu size={18} className={isRunning ? 'animate-spin' : ''} />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm tracking-tight transition-colors">
              {agent.name}
            </h4>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              {agent.role}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <p className="text-xs text-slate-400 mb-4 line-clamp-2 h-8 leading-relaxed font-sans relative z-10">
        {agent.description}
      </p>

      {agent.currentTask && (
        <div className="mb-4 p-2.5 rounded-xl bg-[#030307]/80 border border-[#1c223a] relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5 font-mono">
            // PROCESSO CORRENTE
          </span>
          <span className="text-xs text-slate-300 line-clamp-1 font-mono">
            {agent.currentTask}
          </span>
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-[#121625] text-xs relative z-10 font-mono">
        {/* Efficiency */}
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-[11px] font-bold">
              <Zap size={12} className="text-emerald-400" /> EFICIÊNCIA DO PROCESSO
            </span>
            <span className="font-bold text-emerald-400">{agent.efficiency}%</span>
          </div>
          <div className="w-full h-1 bg-[#121625] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isRunning ? 'bg-emerald-500' : 'bg-emerald-500'}`}
              style={{ width: `${agent.efficiency}%` }}
            />
          </div>
        </div>

        {/* Total stats */}
        <div className="flex items-center justify-between text-slate-400 pt-1 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-emerald-400" /> TEMPO OPERACIONAL
          </span>
          <span className="font-semibold text-slate-200">
            {formatTime(agent.executionTime)}
          </span>
        </div>

        {/* Change efficiency speed slider */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#121625]">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">Modulação de Clock:</span>
          <input
            type="range"
            min="50"
            max="100"
            value={agent.efficiency}
            onChange={(e) => onConfigure(agent.id, parseInt(e.target.value))}
            className="w-24 h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

