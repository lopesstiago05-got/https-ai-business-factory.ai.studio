import React, { useState } from 'react';
import { Task } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, Play, Circle, AlertCircle, FileText, Terminal, ListTodo } from 'lucide-react';

interface TaskQueueProps {
  id: string;
  tasks: Task[];
  activeAgentId?: string;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({ id, tasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Auto-select first running or completed task if none is selected
  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks.find(t => t.status === 'running') || tasks[0];

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-emerald-500 w-4.5 h-4.5 flex-shrink-0" />;
      case 'running':
        return (
          <div className="relative flex items-center justify-center w-4.5 h-4.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-500"></span>
          </div>
        );
      case 'failed':
        return <AlertCircle className="text-rose-500 w-4.5 h-4.5 flex-shrink-0" />;
      default:
        return <Circle className="text-slate-300 dark:text-slate-700 w-4.5 h-4.5 flex-shrink-0" />;
    }
  };

  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pipeline Steps List */}
      <div className="lg:col-span-1 bg-white dark:bg-[#111827] border border-slate-150 dark:border-[#151D30] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider font-mono">
          <ListTodo size={14} className="text-indigo-600 dark:text-indigo-400" />
          Fila de Processamento
        </h3>

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-mono">
            &gt; Nenhum lote de desenvolvimento ativo no momento. Clique em "Iniciar Lote" acima.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 scroller">
            {tasks.map((task, index) => {
              const isSelected = activeTask?.id === task.id;
              
              let statusBg = 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300';
              if (isSelected) {
                statusBg = 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-300';
              } else if (task.status === 'running') {
                statusBg = 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white';
              } else if (task.status === 'failed') {
                statusBg = 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-950/30 text-rose-800 dark:text-rose-300';
              }

              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${statusBg}`}
                >
                  <div className="pt-0.5">{getStatusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
                        ETAPA {index + 1}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                        {task.timestamp}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold truncate font-sans mt-0.5">
                      {task.title}
                    </h4>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-mono uppercase tracking-wider mt-0.5">
                      &gt; {task.agentId.toUpperCase()} AGENT
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Task Details and Live Output */}
      <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-150 dark:border-[#151D30] rounded-2xl p-5 shadow-sm flex flex-col min-h-[450px]">
        {activeTask ? (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-2 py-0.5 rounded font-mono">
                  [ AGENTE {activeTask.agentId.toUpperCase()} ATIVO ]
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 mt-2 text-sm tracking-tight font-sans">
                  {activeTask.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {activeTask.description}
                </p>
              </div>
            </div>

            {/* Logs panel and Generated Outputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
              {/* Logs Console */}
              <div className="bg-slate-50 dark:bg-[#080B12] rounded-xl p-4 font-mono text-xs text-slate-700 dark:text-slate-300 flex flex-col border border-slate-200/50 dark:border-slate-800/80 relative overflow-hidden">
                <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/50 pb-2 mb-2 text-slate-500 dark:text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Terminal size={12} className="text-indigo-600 dark:text-indigo-400" /> LOGS DE TELEMETRIA
                  </span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-bold">
                    {activeTask.status}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scroller">
                  {activeTask.logs.map((log, i) => (
                    <div key={i} className="leading-relaxed text-[11px]">
                      <span className="text-indigo-550/40 dark:text-indigo-500/50 mr-1.5">&gt;</span>
                      <span className={log.includes('ERRO') ? 'text-rose-600 dark:text-rose-400 font-bold' : log.includes('sucesso') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {activeTask.status === 'running' && (
                    <div className="text-indigo-600 dark:text-indigo-400 animate-pulse font-bold text-[11px]">
                      &gt; Processando dados com o Gemini 3.5...
                    </div>
                  )}
                </div>
              </div>

              {/* Entrega Real (AI generated) */}
              <div className="bg-slate-50 dark:bg-[#080B12] border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-4 flex flex-col h-full overflow-hidden relative">
                <div className="flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/50 pb-2 mb-2 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono">
                  <FileText size={14} className="text-indigo-600 dark:text-indigo-400" />
                  ENTREGA DO AGENTE
                </div>
                <div className="flex-1 overflow-y-auto text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pr-1 scroller font-mono">
                  {activeTask.result ? (
                    activeTask.result
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-center py-20 font-mono">
                      {activeTask.status === 'running'
                        ? '[ AGENTE PROCESSANDO SÍNTESE... ]'
                        : '[ AGUARDANDO PIPELINE OPERACIONAL ]'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-12">
            <ListTodo size={40} className="stroke-1 mb-2 text-indigo-400/40 animate-pulse" />
            <p className="text-xs font-mono">&gt; Selecione uma etapa do pipeline para auditar as entregas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
