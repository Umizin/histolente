# 1. Arquitetura de Software

## 1.1 Estilo e padrões escolhidos

A solução combina **dois níveis de decisão arquitetural**:

| Nível | Estilo / padrão | Onde se aplica |
|---|---|---|
| Entre serviços (macro) | **Monólito modular com serviço de inferência assíncrono**, integrados por mensagens: a aplicação web (apresentação e orquestração) e o serviço de inferência são implantados separadamente e se comunicam por fila de mensagens (RabbitMQ), no padrão de consumidores concorrentes, com notificações por publicação e assinatura (Redis) (HOHPE; WOOLF, 2003) | Sistema como um todo (Figura 1) |
| Dentro de cada serviço (micro) | **Arquitetura hexagonal** (portas e adaptadores) (COCKBURN, 2005), organizada em camadas no estilo **Clean Architecture** (MARTIN, 2017): `domain` → `application` → `infrastructure` / `interfaces` | Backend de orquestração e serviço de inferência |
| Interface | **Componentes** React (Next.js App Router) com Server Components por padrão e componentes cliente apenas onde há interação | Frontend |

**Figura 1 — Arquitetura da solução, com o fluxo numerado de uma análise**

![Arquitetura](../monografia/figuras/arquitetura.svg){.paisagem}

Fonte: elaborado pelo autor (2026).

## 1.2 Justificativa

**Por que orientada a eventos entre os serviços:**
1. **Isolamento do modelo de IA (RNF06).** O serviço de inferência só conhece o contrato da mensagem. Não acessa banco, não conhece usuários e pode ser substituído ou reescrito sem afetar o restante.
2. **Picos de uso em aula (RNF09).** A fila absorve dezenas de envios simultâneos, e o `prefetch` limita quantas imagens cada instância processa por vez, protegendo a memória da CPU ou GPU.
3. **Resiliência (RNF05).** Mensagens duráveis, confirmação manual e fila de mensagens mortas garantem que nenhuma análise se perca silenciosamente.
4. **Latência percebida baixa (RNF01).** A resposta do envio é imediata (202); o resultado chega por SSE assim que fica pronto, sem *polling*.

**Por que hexagonal / Clean Architecture dentro dos serviços:**
1. **Testabilidade.** Regras de negócio (RN01–RN07) e casos de uso são testados sem banco, fila ou rede, usando implementações falsas das portas.
2. **Troca de tecnologia sem reescrever regras.** O PostgreSQL, o Redis ou o RabbitMQ ficam atrás de interfaces (`AnaliseRepository`, `CacheResultados`, `PublicadorJobs`); trocar um adaptador não toca o domínio.
3. **Princípios SOLID na prática** (MARTIN, 2017).
   - Inversão de dependência: os casos de uso dependem de portas, não de implementações.
   - Responsabilidade única: cada caso de uso faz uma coisa.
   - Aberto/fechado: novos adaptadores entram sem alterar o núcleo.

**Alternativas descartadas:**

| Alternativa | Motivo da rejeição |
|---|---|
| Monólito único com inferência embutida | Acopla PyTorch ao servidor web, impede escalar a inferência separadamente e viola o RNF06 |
| MVC clássico sem portas | Mistura regras de negócio com controladores e acesso a dados, o que dificulta testar as regras de negócio |
| Microsserviços com banco por serviço e múltiplos serviços de domínio | Complexidade desproporcional para um desenvolvedor e para o escopo do MVP |
| Chamada HTTP síncrona ao serviço de inferência | Sem controle de carga nem novas tentativas; picos derrubariam o serviço (RNF05, RNF09) |

## 1.3 Organização de pastas (alvo)

```
apps/web/                         # Next.js — Apresentação (+ Orquestração via Route Handlers, ver ADR 0001)
  src/app/                        # rotas (App Router) e Route Handlers (/api/...)
  src/components/workstation/     # componentes de interface
  src/server/
    domain/                       # entidades, value objects, regras de negócio (sem I/O)
    application/                  # casos de uso + portas (interfaces)
    infrastructure/               # adaptadores: Prisma, Redis, RabbitMQ, storage
services/inference/
  app/domain/                     # classes canônicas, resultado de inferência
  app/application/                # caso de uso ProcessarJob + portas
  app/infrastructure/             # consumidor AMQP, modelo PyTorch, Grad-CAM
packages/contracts/               # JSON Schema dos eventos (fonte única TS + Python)
infra/                            # docker-compose.yml, db/schema.sql
```

## 1.4 Registro de decisões

As decisões principais e suas alternativas estão no Quadro 5 da monografia (Seção 4.4). Os registros formais de decisão (ADRs) serão escritos em `docs/adr/` na Sprint 2, junto com a implementação. A decisão em aberto é onde roda o consumidor de resultados: rotas de API do Next.js não mantêm um processo de longa duração, então a proposta é **um segundo processo Node** com o mesmo código da aplicação web (outro ponto de entrada no Docker Compose), dedicado a consumir `inference.completed`.

## 1.5 Ajustes de projeto após a revisão interna (18/11/2026)

| Ponto | Decisão | Motivo |
|---|---|---|
| Versão do modelo | O backend envia a versão desejada no `inference.request`; o serviço recusa versões que não tem e devolve versão e SHA-256 do modelo que rodou | O serviço de inferência não acessa o banco (RNF06), então não poderia saber qual versão está ativa |
| Estado "processando" | Novo evento `inference.started`, publicado ao receber o job | Sem ele, o estado `PROCESSING` nunca seria atingido |
| Novas tentativas | Filas de espera com tempo de vida (1 s, 5 s, 25 s); na última, o serviço publica `FAILED`; rotina do backend fecha análises paradas | O RabbitMQ não gera eventos de falha; sem isso a análise ficaria presa |
| Entrega por SSE | Um canal por usuário, assinando antes de ler o estado | Evita perder eventos e o limite de 6 conexões por origem do HTTP/1.1 num lote de 50 |
| Redes | Redis em rede própria com o backend (`cache_net`); o serviço de inferência só alcança o RabbitMQ | Um serviço comprometido não consegue alterar o cache de resultados |
| Tamanho da mensagem | O backend extrai o recorte central de 224 × 224 px e publica só ele | Mensagens pequenas no broker e proteção contra imagens descomunais |

Esses ajustes serão implementados na Sprint 2 (EN04 e HU01).
