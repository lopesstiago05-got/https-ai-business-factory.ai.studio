import React, { useState } from 'react';
import { DigitalProduct } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  Layers,
  Award
} from 'lucide-react';

interface ProductViewerProps {
  id: string;
  products: DigitalProduct[];
}

export const ProductViewer: React.FC<ProductViewerProps> = ({ id, products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'concept' | 'blueprint' | 'sales' | 'design' | 'finance' | 'logs'>('concept');

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const formatPrice = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Products list sidebar */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
          <ShoppingBag size={18} className="text-indigo-500" />
          Produtos Fabricados
        </h3>

        {products.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Nenhum produto digital gerado ainda. Digite um nicho e inicie o lote de desenvolvimento!
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {products.map(p => {
              const isSelected = currentProduct?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setActiveTab('concept');
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      p.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {p.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{formatPrice(p.price)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {p.niche}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Product Specs & Deliverables */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col min-h-[500px]">
        {currentProduct ? (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {currentProduct.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-indigo-500 font-medium">{currentProduct.niche}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {currentProduct.name}
                </h3>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 px-4 py-2.5 rounded-xl">
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500">Preço e Receita</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {formatPrice(currentProduct.price)}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500">Receita Estimada</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {formatPrice(currentProduct.revenue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Inner Tabs navigation */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('concept')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'concept'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Layers size={14} /> Conceito
              </button>
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'blueprint'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen size={14} /> Conteúdo & Blueprint
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'sales'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText size={14} /> Página de Vendas (Copy)
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'design'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles size={14} /> Identidade Visual
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'finance'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <DollarSign size={14} /> Modelo Financeiro
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'logs'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Award size={14} /> Certificações
              </button>
            </div>

            {/* Tab content area */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-5 overflow-y-auto max-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans"
                >
                  {activeTab === 'concept' && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <Layers size={16} className="text-indigo-500" />
                        Tese de Negócio & Ideia do Produto
                      </h4>
                      {currentProduct.description || 'Aguardando entrega do CEO Agent...'}
                    </div>
                  )}

                  {activeTab === 'blueprint' && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <BookOpen size={16} className="text-indigo-500" />
                        Esqueleto Estrutural e Capítulo Escrito
                      </h4>
                      {currentProduct.content || 'Aguardando os agentes Product e Writer finalizarem a redação estruturada.'}
                    </div>
                  )}

                  {activeTab === 'sales' && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <FileText size={16} className="text-indigo-500" />
                        Cópia da Página de Vendas (Copywriting & Headlines)
                      </h4>
                      {currentProduct.salesPage || 'Aguardando o Marketing Agent redigir o funil de alta conversão.'}
                    </div>
                  )}

                  {activeTab === 'design' && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <Sparkles size={16} className="text-indigo-500" />
                        Diretrizes de Identidade Visual e Prompts de Arte
                      </h4>
                      {currentProduct.designerAssets && currentProduct.designerAssets.length > 0
                        ? currentProduct.designerAssets[0]
                        : 'Aguardando o Designer Agent conceber a identidade de marca e criar os mockups.'}
                    </div>
                  )}

                  {activeTab === 'finance' && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <DollarSign size={16} className="text-indigo-500" />
                        Precificação, ROI e Projeções Financeiras
                      </h4>
                      {currentProduct.financialProjection || 'Aguardando o Finance Agent calcular custos, metas e retorno sobre investimento.'}
                    </div>
                  )}

                  {activeTab === 'logs' && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <Award size={16} className="text-indigo-500" />
                        Registro de Auditoria e Aprovações dos Lotes
                      </h4>
                      <ul className="space-y-2">
                        {currentProduct.publicationLogs.map((log, i) => (
                          <li key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                            <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                            <span>{log}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ShoppingBag size={48} className="stroke-1 mb-2 text-slate-300" />
            <p className="text-xs">Inicie um ciclo de criação de produtos para povoar o inventário.</p>
          </div>
        )}
      </div>
    </div>
  );
};
