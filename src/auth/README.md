# Camada de Autenticação & Segurança (Auth Security)

O sistema está planejado para suportar autenticação profissional baseada em padrões modernos de mercado.

## Estratégia de Autenticação:
- **JWT (JSON Web Tokens)**: Assinados no backend de forma stateless contendo permissões do usuário (Ex: Admin, Visualizador, Desenvolvedor).
- **Integração Externa**: Preparado para suportar Firebase Authentication, Auth0 ou Google OAuth, permitindo login social rápido e seguro.
- **Middlewares**: `authMiddleware.ts` responsável por validar o token de autorização Bearer nas requisições protegidas da API REST.
