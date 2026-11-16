# Contratos de mensagens (v1.0)

Fonte única dos formatos trocados entre o backend de orquestração e o serviço de inferência pelo RabbitMQ.

| Arquivo | Fila | Quem publica | Quem consome |
|---|---|---|---|
| `inference.request.schema.json` | `inference.request` | Backend de orquestração | Serviço de inferência |
| `inference.completed.schema.json` | `inference.completed` | Serviço de inferência | Backend de orquestração |

**Regras que o JSON Schema não expressa** (os consumidores validam em código):
- A soma de `probabilities` é 1 ± 1e-4.
- O consumidor ignora mensagens com `job_id` repetido (idempotência).

**Mudanças:**
- Alteração compatível (campo novo opcional): `1.x`.
- Alteração incompatível: `2.0`, com período em que os dois lados aceitam as duas versões.
- A ordem das classes (`ADI … TUM`) **não muda**: ela é o índice de saída do modelo.

**Testes:**
```
pip install -r packages/contracts/requirements-dev.txt
pytest packages/contracts
```
Os tipos TypeScript (Zod) e Python (Pydantic) serão gerados a partir destes arquivos quando o backend (HU01) e o serviço de inferência (EN04) forem implementados.
