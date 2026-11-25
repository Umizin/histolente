# Integração e Entrega Contínuas (CI/CD) e Deploy

## 1. Pipeline

```
commit na branch ─► pull request ─► CI (7 jobs) ─► merge na main ─► CI na main ─► CD: imagens no GHCR ─► CD: implantação no servidor ─► conferência do site
```

Os dois *workflows* ficam em `.github/workflows/` e rodam no GitHub Actions.

### 1.1 CI — build e testes (`ci.yml`, em todo pull request e na `main`)

| Job | O que faz |
|---|---|
| Schema do banco | aplica `infra/db/schema.sql` num PostgreSQL 16.6 |
| Contratos de mensagens | valida os exemplos e 22 casos (válidos e inválidos) contra os JSON Schemas de `packages/contracts` |
| Aplicação web | verificação de tipos (TypeScript estrito), 14 testes unitários (Vitest) e build de produção do Next.js |
| Serviço de inferência | build da imagem Docker e 9 testes, incluindo o teste de arquitetura do RNF06 (nenhum driver ou variável de banco no serviço de IA) |
| Pipeline de ML | 36 testes: divisão sem vazamento, aumentos de dados, modelos, Grad-CAM, métricas, exportação, cor e leitura do mapa |
| Ambiente completo e teste de fumaça | sobe a pilha inteira com Docker Compose, roda os 7 testes da infraestrutura e o teste de ponta a ponta pela API: cadastro, termo, validações, análise com aviso por SSE, cache e isolamento entre usuários |
| Ferramentas de documentação | scripts de geração de diagramas e PDFs |

Um pull request só é integrado com os sete jobs verdes. Até 25/11/2026, a CI rodou 40 vezes, todas com sucesso, e 18 pull requests foram integrados (lista em https://github.com/Umizin/histolente/pulls?q=is%3Apr+is%3Amerged).

### 1.2 CD — publicação e implantação (`cd.yml`, depois da CI verde na `main`)

1. **Imagens:** monta as imagens `histolente-web` e `histolente-inference` e publica no GitHub Container Registry com duas etiquetas: `latest` e o SHA do commit. A etiqueta pelo SHA permite voltar a qualquer versão anterior.
2. **Implantação:** entra no servidor por SSH com uma chave exclusiva de implantação, copia a composição (`infra/`, sem o `.env`, que só existe no servidor), baixa as imagens novas usando o token temporário do próprio GitHub Actions (expira quando o job termina), aplica as migrações do banco (`infra/db/migracoes/`, todas idempotentes) e reinicia só os serviços da aplicação. Banco, Redis e RabbitMQ não são reiniciados.
3. **Conferência:** consulta `/api/healthz`, `/api/model` e a página de entrada no endereço público. Se alguma falhar, o *workflow* fica vermelho.

O passo de implantação só roda quando o repositório tem os segredos `DEPLOY_SSH_KEY` e `DEPLOY_KNOWN_HOSTS` e a variável `DEPLOY_HOST`; sem eles, o job registra um aviso e não toca no servidor. Os segredos foram cadastrados em 25/11/2026, e a primeira implantação automática completa rodou no mesmo dia (https://github.com/Umizin/histolente/actions/runs/45659552926): imagens publicadas, migrações aplicadas, serviços saudáveis e site conferido. Antes disso, as atualizações do servidor seguiam os mesmos passos, executados manualmente depois de cada merge com a CI verde.

**Como voltar uma versão:** no servidor, trocar a etiqueta `latest` pela do SHA anterior em `infra/docker-compose.prod.yml` (ou rodar o CD manualmente a partir do commit anterior).

## 2. Deploy

| Item | Valor |
|---|---|
| **Aplicação** | **https://189-24-15-186.sslip.io** |
| **Repositório** | **https://github.com/Umizin/histolente** (público) |
| Quadro de tarefas | https://github.com/users/Umizin/projects/1 |
| Execuções da CI/CD | https://github.com/Umizin/histolente/actions |
| Servidor | VPS Hostinger KVM 2, data center no Brasil: 2 vCPU, 8 GB de RAM, Ubuntu 26.04 LTS, sem GPU |
| Publicação | Caddy 2.8 nas portas 80 e 443, com certificado HTTPS automático (Let's Encrypt); HTTP redireciona para HTTPS |
| Endereço | `sslip.io` resolve o nome para o IP do servidor, sem registro de domínio |
| Segurança | firewall só com as portas 22, 80 e 443; SSH só por chave; banco, Redis e RabbitMQ sem porta exposta; senhas geradas no próprio servidor |
| Aplicação | os mesmos seis contêineres do desenvolvimento (Seção 2 do MVP), com as imagens do GHCR e o modelo 0.1.0 (SHA-256 conferido depois da cópia) |

Primeira implantação em 25/11/2026 (manual); desde a execução citada na Seção 1.2, cada merge na `main` atualiza o servidor sozinho. Depois de cada atualização, o teste de fumaça foi rodado de fora contra o endereço público e passou (340 ms do envio ao evento SSE na primeira medição). A latência medida no servidor está na Seção 4 do documento de MVP.

**Para acessar:** criar uma conta na tela de entrada (nome, e-mail e senha), aceitar o termo de uso e escolher uma amostra da galeria ou enviar um recorte H&E.

## 3. Outras formas de publicação previstas

A composição de produção (`infra/docker-compose.prod.yml`) também permite publicar sem servidor com IP público, por Cloudflare Tunnel (perfis `publicar` e `publicar-rapido`), e atualizar o servidor pelo Watchtower em vez do job de implantação (perfil `atualizar`, que exige um token de leitura do GHCR no servidor):

```
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --profile app --profile publicar-vps up -d --wait
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --profile app --profile publicar-rapido up -d --wait
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --profile atualizar up -d
```
