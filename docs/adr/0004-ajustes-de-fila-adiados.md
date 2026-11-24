# ADR 0004 — Ajustes de mensageria adiados para depois do MVP

- **Data:** 24/11/2026
- **Status:** aceita

## Contexto
A revisão interna de 18/11/2026 (Seção 1.5 do projeto) propôs: versão do modelo no `inference.request`, evento `inference.started`, filas de espera com tempo de vida e fila quorum com limite de entregas.

## Decisão
O MVP mantém o contrato v1.0 e implementa só o necessário para o fluxo funcionar com segurança: recorte central no backend, SSE por usuário assinando antes de ler o estado, Redis em `cache_net` e novas tentativas por republicação com cabeçalho `x-tentativa` (até 3; depois `FAILED` e DLQ). Os demais itens entram no contrato v1.1.

## Consequências
- A análise passa direto de `QUEUED` para `DONE`/`FAILED`; o estado `PROCESSING` só aparece com o `inference.started`.
- A versão do modelo é registrada a partir do que o serviço devolve (`model.version` e `model.sha256`), não pedida pelo backend.
- Sem rotina de expiração, uma análise pode ficar em `QUEUED` se o serviço de inferência estiver fora do ar; a tela mostra o tempo decorrido.
