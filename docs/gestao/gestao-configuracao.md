# Gestão de Configuração

## 1. Repositório
- **Git**, com repositório remoto no **GitHub**: https://github.com/Umizin/histolente.
- Branch principal: `main`. Ela é sempre estável e cada sprint concluída recebe uma *tag* (`sprint-00`, `sprint-01`…).
- O repositório contém código, documentação, monografia e ferramentas. **Não** contém modelos treinados (`.pt`), o dataset, segredos (`.env`) nem respostas de participantes (ver `.gitignore`).

## 2. Estratégia de branches: GitHub Flow (variação leve do trunk-based)

| Branch | Uso | Exemplo |
|---|---|---|
| `main` | Código integrado e estável; só recebe merge via *pull request* com CI verde | — |
| `feat/<id>-<descricao>` | Nova funcionalidade ligada a uma história ou habilitador | `feat/HU07-gradcam-opacidade` |
| `fix/<descricao>` | Correção de defeito | `fix/sse-reconexao` |
| `docs/<descricao>` | Documentação e monografia | `docs/cap4-arquitetura` |
| `chore/<descricao>` | Infraestrutura, dependências, CI | `chore/ci-pipeline` |

**Por que GitHub Flow e não GitFlow:**
- O GitFlow mantém branches longas (`develop`, `release/*`, `hotfix/*`) pensadas para equipes com várias versões em paralelo.
- Com um desenvolvedor e entrega contínua, essa estrutura só adiciona *merges* sem benefício.
- Branches curtas a partir da `main`, integradas por *pull request*, mantêm o histórico rastreável e são o padrão do trunk-based.

**Proteção da `main`:** em repositório privado, o GitHub só permite regras de proteção de branch no plano Pro, que estudantes conseguem de graça pelo GitHub Student Developer Pack. Enquanto o Pro não estiver ativo, a regra "nada entra na `main` sem PR" é seguida por disciplina. A partir da Sprint 1, todo trabalho de código entra por PR.

## 3. Padrão de commits: Conventional Commits

```
<tipo>(<escopo>): <descrição no imperativo>

[corpo opcional: o quê e por quê]

refs HU07, RF04
```

- **Tipos:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `perf`.
- **Escopos:** `web`, `api`, `inference`, `ml`, `infra`, `monografia`, `requisitos`, `gestao`, `pesquisa`.
- **Exemplos:**
  - `feat(web): adiciona slider de opacidade do Grad-CAM`
  - `fix(inference): normaliza mapa constante sem divisão por zero`
  - `docs(monografia): reescreve Seção 4.3 com fluxo SSE`

Toda referência a requisito usa o ID do documento de requisitos (RF, RNF, HU, UC). Isso liga o histórico do Git à matriz de rastreabilidade.

## 4. Pull requests e code review
- Todo trabalho entra na `main` por *pull request*, mesmo com um único desenvolvedor.
- **Modelo de PR:** o que muda; requisitos atendidos (RF/HU); como testar; checklist da Definição de Pronto.
- **Revisão em duas camadas:**
  1. **Automática:** CI com lint, verificação de tipos, testes e build.
  2. **Humana:** autorrevisão do diff com o checklist. Quando possível, uma revisão assistida (revisor automatizado ou colega) registrada como comentário no PR.
- O orientador pode ser marcado como revisor nos PRs de marcos (fim de sprint).
- **Merge:** *squash and merge*, com a mensagem no padrão Conventional Commits.

## 5. Quadro de tarefas: GitHub Projects
- **Colunas:** `Backlog` → `Sprint atual` → `Em andamento` (limite: 2) → `Em revisão (PR)` → `Pronto`.
- **Campos:** Sprint, Pontos, Prioridade (MoSCoW), Épico, Requisito.
- Cada história do backlog vira uma *issue*, com os critérios de aceite como checklist. O PR fecha a issue (`Closes #N`).

## 6. Integração e entrega contínuas (CI/CD)

**CI** (`.github/workflows/ci.yml`, em todo PR e na `main`):

| Job | O que verifica |
|---|---|
| Schema do banco | `infra/db/schema.sql` aplica sem erro no PostgreSQL 16.6 |
| Contratos de mensagens | exemplos e casos inválidos contra os JSON Schemas de `packages/contracts` |
| Aplicação web | verificação de tipos (TypeScript estrito), testes unitários (Vitest) e build de produção |
| Serviço de inferência | build da imagem e testes, incluindo o teste de arquitetura do RNF06 (nenhum driver ou variável de banco) |
| Ambiente completo e teste de fumaça | sobe a pilha inteira com Docker Compose e percorre o fluxo principal pela API: cadastro, termo, validações, análise com aviso por SSE, cache e isolamento entre usuários |
| Pipeline de ML | testes de dados, modelos, Grad-CAM e exportação |
| Ferramentas de documentação | scripts de geração de diagramas e PDFs |

**CD** (`.github/workflows/cd.yml`): quando a CI passa na `main`, as imagens `histolente-web` e `histolente-inference` são publicadas no GitHub Container Registry com as etiquetas `latest` e o SHA do commit. A etiqueta pelo SHA permite voltar a uma versão anterior.

**Implantação** (`infra/docker-compose.prod.yml`): a mesma composição do desenvolvimento, trocando o build local pelas imagens do GHCR. O Watchtower consulta o registro a cada 5 minutos e reinicia só os serviços da aplicação quando há imagem nova; banco, Redis e RabbitMQ não são tocados. A publicação na internet é feita por Cloudflare Tunnel, sem abrir porta no roteador:

```
docker login ghcr.io -u <usuario>                    # token com read:packages
# endereço fixo (TUNNEL_TOKEN no infra/.env, criado no painel da Cloudflare):
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --profile app --profile publicar up -d --wait
# ou endereço temporário *.trycloudflare.com, sem conta:
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --profile app --profile publicar-rapido up -d --wait
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml logs tunel-rapido | grep trycloudflare
```

Fluxo completo: commit → PR → CI verde → merge na `main` → CD publica a imagem → Watchtower atualiza o servidor.
