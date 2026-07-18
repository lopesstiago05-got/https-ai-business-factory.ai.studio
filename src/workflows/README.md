# Fluxos de Trabalho Automatizados (Workflows Engine)

O AI Business Factory suporta a criação de fluxos de trabalho sequenciais e paralelos para orquestração de múltiplos agentes.

## Componentes do Módulo:
- `PipelineOrchestrator.ts`: Motor que lê o pipeline configurado e dispara os trabalhos respeitando as dependências entre agentes (ex: `Writer` só pode rodar depois que o `Product` estruturar o sumário).
- `ContextAggregator.ts`: Consolidador de contexto que reúne as entregas anteriores de outros agentes e empacota para servir de insumo de entrada no prompt do próximo agente.
