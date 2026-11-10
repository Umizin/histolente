# Workstation de Patologia Digital — TCC

**Reconhecimento Automatizado de Padrões Histológicos em Câncer Colorretal com Inteligência Artificial: Uma Ferramenta de Apoio à Patologia Digital**

Paulo Victor Silva Gonçalves — Engenharia de Software, Universidade de Vassouras (UVS), Campus Maricá, 2026.

Ferramenta web educacional e de apoio à triagem que classifica *patches* histológicos H&E (224 × 224 px) nas 9 classes do dataset NCT-CRC-HE-100K e exibe o mapa de explicabilidade Grad-CAM de forma interativa.

> ⚠️ **Ferramenta educacional e de apoio à triagem. Não substitui laudo anatomopatológico. A decisão clínica é sempre do médico (Res. CFM nº 2.454/2026).**

## Estrutura do repositório

| Pasta | Conteúdo |
|---|---|
| `docs/monografia/` | Monografia em Markdown (um arquivo por capítulo) e PDF da versão de trabalho |
| `docs/engenharia-requisitos/` | Artefatos de Engenharia de Requisitos (RF, RNF, histórias, UML, rastreabilidade) |
| `docs/gestao/` | Metodologia, EAP, roadmap, riscos, gestão de configuração e atas de sprint |
| `docs/pesquisa/` | Instrumentos de pesquisa (roteiro, formulário, TCLE) — respostas **não** são versionadas |
| `tools/` | Geração de diagramas e PDFs (`python3 -I tools/md2pdf.py todos`) |
| `apps/`, `services/`, `ml/`, `infra/` | Código (a partir da Sprint 1) |

## Stack
Next.js (TypeScript) · Tailwind CSS · shadcn/ui · API REST + SSE · RabbitMQ · Redis · PostgreSQL · Python · FastAPI · PyTorch · Grad-CAM · Docker Compose.

## Fluxo de trabalho
Ver [docs/gestao/gestao-configuracao.md](docs/gestao/gestao-configuracao.md): GitHub Flow, Conventional Commits e *pull requests* com revisão.
