# Camada de Banco de Dados (Database Layer)

Preparado para persistência durável em PostgreSQL em produção (usando ORM como Drizzle ou Prisma) e banco em arquivo JSON (`factory_db.json`) local para ambiente de desenvolvimento rápido e desacoplado.

## Esquema de Tabelas Mapeado:
1. `agents`: Armazena configurações de performance, custos por token e status operacional de cada agente.
2. `tasks` / `jobs`: Fila de tarefas pendentes, rodando ou concluídas com links para logs específicos de execução.
3. `products`: Armazena o infoproduto consolidado, incluindo título, nicho, descrição, capítulos (e-book), páginas de vendas, paletas de cores e precificações recomendadas.
4. `users`: Cadastro de usuários para controle de acesso ao painel.
