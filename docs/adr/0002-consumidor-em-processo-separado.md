# ADR 0002 — Consumidor de resultados em processo separado

- **Data:** 24/11/2026
- **Status:** aceita (resolve a decisão em aberto da Seção 1.4 do projeto)

## Contexto
Os route handlers do Next.js atendem requisições e não mantêm um consumidor AMQP de longa duração de forma confiável.

## Decisão
`apps/web/consumer.mjs` roda como segundo contêiner (`consumidor`) com a mesma imagem da web. Ele consome `inference.completed`, grava o resultado e o mapa, preenche o cache e publica no canal Redis `user:{id}`, que alimenta o SSE.

## Consequências
- O consumidor é o único ponto que grava resultados; a atualização é condicional (`status IN ('QUEUED','PROCESSING')`), o que torna mensagens duplicadas inofensivas.
- Mensagem fora do contrato vai para a DLQ; erro transitório é republicado até 3 vezes.
- Se a conexão com o RabbitMQ cair, o processo encerra e o Compose o reinicia.
