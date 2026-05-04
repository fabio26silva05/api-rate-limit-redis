 SentinelRate Guard
Este é um sistema de Rate Limiting que desenvolvi para proteger endpoints de APIs contra abusos e sobrecarga de requisições. A ideia aqui foi criar uma camada de segurança resiliente usando Redis para gerenciar o estado das requisições de forma distribuída e performática.

 Por que usar isso?
Em aplicações que escalam, como os projetos de automação que desenvolvo na Vaptia, controlar o fluxo de entrada é vital para não estourar custos de API ou sofrer com ataques de força bruta. Com este middleware, consegui garantir que cada IP respeite um limite de 10 requisições por minuto.

 Tecnologias que utilizei:
Node.js & Express: Base do servidor backend.
TypeScript: Tipagem estrita para evitar erros bobos em produção e facilitar a manutenção.
Redis (Upstash): Utilizado para persistência em cache e contagem atômica de requisições.
Dotenv: Gestão de variáveis de ambiente para manter as credenciais seguras e fora do código-fonte.

 Como rodar o projeto?
 
Se quiser testar aí, o processo é simples:

Clone o repositório.
Rode um npm install para baixar as dependências.
Crie um arquivo .env na raiz seguindo o modelo do .env.example.
Inicie o servidor em modo de desenvolvimento:

Como Testar?

1. Inicie o servidor:
```bash
npm run dev
```

2. Abra o PowerShell/Terminal e execute (11 vezes rapidamente):
```bash
curl http://localhost:3000
```

**Resultado esperado:**
- Primeiras 10 vezes: Vê a mensagem "SentinelRate Guard está protegendo a API"
- 11ª vez: Recebe erro `429` com mensagem `{"error":"Muitas requisições. Tente em 1 minuto."}`

Isso prova que o rate limit está funcionando!

O que aprendi fazendo isso?
O maior desafio não foi só codar o middleware, mas garantir a resiliência (Fail-Open). Se o banco de dados Redis cair por qualquer motivo, a API continua funcionando em vez de travar o usuário, priorizando a disponibilidade do sistema.
