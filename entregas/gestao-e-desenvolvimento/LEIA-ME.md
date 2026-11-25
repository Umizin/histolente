# Entrega de Gestão e Desenvolvimento — HistoLente

**Aluno:** Paulo Victor Silva Gonçalves — Engenharia de Software, Universidade de Vassouras (campus Maricá), 2026

| | |
|---|---|
| Documento da entrega | `HistoLente-Gestao-e-Desenvolvimento.pdf` (nesta pasta) |
| Aplicação publicada | https://189-24-15-186.sslip.io |
| Repositório | https://github.com/Umizin/histolente (privado; acesso por convite) |
| Quadro de tarefas | https://github.com/users/Umizin/projects/1 |
| Pull requests | https://github.com/Umizin/histolente/pulls?q=is%3Apr |
| CI/CD | https://github.com/Umizin/histolente/actions |

## Itens do roteiro

| Item | Capítulo do PDF | Fonte no repositório |
|---|---|---|
| 1. Metodologia de desenvolvimento | 1 | `docs/gestao/metodologia.md` |
| 2. Planejamento (EAP, roadmap, estimativas) | 2 | `docs/gestao/eap-e-roadmap.md`; backlog em `docs/engenharia-requisitos/` |
| 3. Gestão de riscos | 3 | `docs/gestao/riscos.md` |
| 3. Gestão de configuração (branches, commits, PRs, quadro) | 4 | `docs/gestao/gestao-configuracao.md` |
| 4. Atas de sprint | 5 e 6 | `docs/gestao/sprints/` |
| 5. Desenvolvimento do MVP e boas práticas | 7 | `docs/gestao/mvp-e-implantacao.md`; código em `apps/`, `services/`, `ml/`; ADRs em `docs/adr/` |
| 6. CI/CD | 8, Seção 1 | `.github/workflows/` |
| 7. Deploy | 8, Seção 2 | `infra/docker-compose.prod.yml` |

## Como testar a aplicação

1. Abrir https://189-24-15-186.sslip.io e criar uma conta (nome, e-mail e senha).
2. Aceitar o termo de uso.
3. Clicar numa amostra da galeria (ou enviar um recorte H&E) e ver a classe sugerida, a confiança por classe, o mapa Grad-CAM e o quadro "Como ler este mapa".
4. Testar o modo **Quiz** e o **Histórico**.

## Como rodar localmente

```
git clone https://github.com/Umizin/histolente.git && cd histolente
make app      # sobe os seis contêineres; aplicação em http://127.0.0.1:3000
make fumaca   # teste de ponta a ponta
```
