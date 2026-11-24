# ADR 0001 — Orquestração nos route handlers do Next.js

- **Data:** 24/11/2026
- **Status:** aceita

## Contexto
A arquitetura prevê um backend de orquestração (REST + SSE, PostgreSQL, Redis, RabbitMQ) separado do serviço de inferência. Ele podia ser um serviço próprio (NestJS/Fastify) ou ficar nos route handlers do Next.js, no mesmo projeto da interface.

## Decisão
A orquestração fica em `apps/web/src/app/api/` (route handlers), com as regras em `apps/web/src/lib/`. O serviço de inferência continua separado e só conversa por RabbitMQ.

## Consequências
- Um projeto, um build e uma imagem a menos para um desenvolvedor só manter; tipos compartilhados entre tela e API.
- O isolamento que importa para o RNF06 continua: a inferência não tem rota nem credencial para o banco ou o Redis.
- Se a API precisar escalar separada da interface, as rotas saem para um serviço próprio sem mudar o contrato HTTP.
