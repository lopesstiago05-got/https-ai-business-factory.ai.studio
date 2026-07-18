import React, { useState } from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
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
        return <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
      case 'running':
        return (
          <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
          </div>
        );
      case 'failed':
        return <AlertCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />;
      default:
        return <Circle className="text-slate-300 dark:text-slate-600 w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pipeline Steps List */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
          <ListTodo size={18} className="text-indigo-500" />
          Fila de Execução da Fábrica
        </h3>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum lote de desenvolvimento ativo no momento. Clique em "Iniciar Lote" acima.
          </div>
        ) : (
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {tasks.map((task, index) => {
              const isSelected = activeTask?.id === task.id;
              const statusColors = {
                completed: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                running: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30',
                failed: 'bg-rose-50/30 dark:bg-rose-950/10',
                pending: 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              };

              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10'
                      : 'border-transparent'
                  } ${statusColors[task.status]}`}
                >
                  <div className="pt-0.5">{getStatusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Etapa {index + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {task.timestamp}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {task.agentId.toUpperCase()} Agent
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Task Details and Live Output */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col min-h-[450px]">
        {activeTask ? (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                  {activeTask.agentId.toUpperCase()} AGENT
                </span>
                <h3 className="font-bold text-slate-800 dark:text-white mt-1 text-base">
                  {activeTask.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeTask.description}
                </p>
              </div>
            </div>

            {/* Logs panel and Generated Outputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
              {/* Logs Console */}
              <div className="bg-slate-950 dark:bg-black rounded-lg p-4 font-mono text-xs text-slate-300 flex flex-col border border-slate-900">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 text-slate-500">
                  <span className="flex items-center gap-1.5 text-[10px]">
                    <Terminal size={12} /> LOGS DE EXECUÇÃO
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 uppercase">
                    {activeTask.status}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scroller">
                  {activeTask.logs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-slate-600 mr-1">&gt;</span>
                      <span className={log.includes('ERRO') ? 'text-rose-400' : log.includes('sucesso') ? 'text-emerald-400' : 'text-slate-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {activeTask.status === 'running' && (
                    <div className="text-indigo-400 animate-pulse font-bold">
                      &gt; Processando dados com o Gemini 3.5...
                    </div>
                  )}
                </div>
              </div>

              {/* Entrega Real (AI generated) */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-lg p-4 flex flex-col h-full overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-900 pb-2 mb-2 text-slate-600 dark:text-slate-400 text-xs font-bold">
                  <FileText size={14} className="text-indigo-500" />
                  ENTREGA DO AGENTE
                </div>
                <div className="flex-1 overflow-y-auto text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pr-1">
                  {activeTask.result ? (
                    activeTask.result
                  ) : (
                    <div className="text-slate-400 text-center py-16">
                      {activeTask.status === 'running'
                        ? 'O agente está gerando este conteúdo agora...'
                        : 'Aguardando processamento do agente.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ListTodo size={40} className="stroke-1 mb-2 text-slate-300" />
            <p className="text-xs">Selecione uma etapa do pipeline para ver as entregas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
