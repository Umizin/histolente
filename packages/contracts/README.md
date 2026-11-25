# Contratos de mensagens (v1.0)

> **PENDENTE (Sprint 2, EN03b):** a versão 1.1 incluirá `model_version` e `crop_sha256` no `inference.request` (com `maxLength` de cerca de 300 KB para o recorte de 224 × 224), o evento `inference.started` e os campos `ood_score`, `ood_method` e `ood_threshold` no `inference.completed`, conforme `docs/projeto/01-arquitetura.md` §1.5.

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

**Histórico:**
- 25/11/2026: campos opcionais `ood_reasons` (`pouco_tecido`, `baixa_confianca`, `coloracao`) e `color_adjusted` (sugestão para a imagem com a cor normalizada, só informativa) no `inference.completed`. Mensagens sem eles continuam válidas, então `schema_version` segue `1.0`; o número 1.1 fica reservado para o pacote do ADR 0004.
- 25/11/2026: campo opcional `gradcam.summary`, com as medidas da região de maior influência do mapa (leitura "Como ler este mapa"); `schema_version` segue `1.0` pelo mesmo motivo.

**Testes:**
```
pip install -r packages/contracts/requirements-dev.txt
pytest packages/contracts
```
Os tipos TypeScript (Zod) e Python (Pydantic) serão gerados a partir destes arquivos quando o backend (HU01) e o serviço de inferência (EN04) forem implementados.
