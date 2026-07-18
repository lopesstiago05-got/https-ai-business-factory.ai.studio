# Mecanismos de Logs Operacionais & Monitoramento

Um painel multiagentes em tempo real exige alta transparência de logs e telemetria.

## Estrutura de Logs do Sistema:
- **Auditoria de Agentes**: Registro de tempo de boot, tokens de entrada, tokens de saída, chamadas de LLM, erros de rede e tempo de execução exato.
- **Console do Desenvolvedor**: Rastreabilidade em tempo real transmitida para a tela por polling/WebSockets, ideal para entender "o que o agente está pensando" em cada etapa do ciclo de vida.
- **Persistência**: Gravação de arquivos físicos rotativos de log no servidor ou logs centralizados baseados em nuvem.
