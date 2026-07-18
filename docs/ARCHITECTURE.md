# Arquitetura Geral do AI Business Factory

Esta plataforma foi desenhada sob os pilares de **Sistemas Multiagentes**, **Arquitetura Orientada a Eventos/Trabalhos** e **Clean Architecture**.

## 1. Topologia da Rede de Agentes

```
             ┌─────────────────────────┐
             │    Supervisor Agent     │◀──────────────┐
             └─────────────────────────┘               │
                          │ (Revisão & Aprovação)      │
                          ▼                            │
             ┌─────────────────────────┐               │
             │        CEO Agent        │               │
             └─────────────────────────┘               │
                          │ (Estratégia)               │
                          ▼                            │
             ┌─────────────────────────┐               │
             │     Research Agent      │               │
             └─────────────────────────┘               │
                          │                            │
                          ▼                            │
             ┌─────────────────────────┐               │
             │      Market Agent       │               │
             └─────────────────────────┘               │
                          │                            │
                          ▼                            │ (Loop de feedback)
             ┌─────────────────────────┐               │
             │      Product Agent      │               │
             └─────────────────────────┘               │
                          │                            │
                          ▼                            │
             ┌─────────────────────────┐               │
             │   Writer / Designer     │               │
             └─────────────────────────┘               │
                          │                            │
                          ▼                            │
             ┌─────────────────────────┐               │
             │   Marketing Agent       │               │
             └─────────────────────────┘               │
                          │                            │
                          ▼                            │
             ┌─────────────────────────┐               │
             │ Publisher / Finance     │───────────────┘
             └─────────────────────────┘
```

## 2. Fluxo de Dados (Data Flow)

1. **Ideação**: O usuário submete um nicho (ou ideia bruta) na interface do Dashboard.
2. **Orquestração de Fila**: Uma nova entidade `DigitalProduct` é persistida no banco de dados com estado `draft`.
3. **Pipeline Automático**: O orquestrador injeta 10 tarefas sequenciais na tabela `Task` com status `pending`.
4. **Despacho Assíncrono**: O scheduler do backend monitora a fila de tarefas. Quando o sistema está "Rodando":
   - Despacha o trabalho para o agente correto.
   - O agente inicializa seu contexto, carrega o prompt-mestre, lê o estado acumulado do produto e chama o **Gemini 3.5**.
   - O resultado gerado é salvo no banco, enriquecendo o `DigitalProduct` de forma incremental.
   - O log é injetado em tempo real.
5. **Auditoria e Entrega**: Após aprovação pelo `Supervisor Agent`, o produto transiciona para `published` e os lucros simulados são calculados.
