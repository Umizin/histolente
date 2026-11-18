# 2. Modelagem Estrutural e Comportamental

> Revisão de 18/11/2026: os fluxos SQ1 e SQ3 e as classes de domínio foram atualizados após a revisão interna (assinatura antes da leitura no SSE, canal por usuário, versão do modelo no pedido, evento `inference.started`, novas tentativas por filas de espera). Os contratos e a topologia correspondentes serão implementados com o serviço de inferência (EN04) e o backend (HU01), na Sprint 2.
>
> Os diagramas estão em Mermaid. Eles são renderizados no GitHub e no VS Code (extensão *Markdown Preview Mermaid Support*), e as imagens usadas nos PDFs ficam em `docs/projeto/figuras/` (geradas por `tools/mermaid_svg.py`).

## 2.1 Diagrama de classes — Modelo de domínio do backend de orquestração

```mermaid
classDiagram
    direction TB

    class Perfil {
        <<enumeration>>
        ESTUDANTE
        PROFESSOR
        ADMINISTRADOR
    }
    class ClasseTecidual {
        <<enumeration>>
        ADI
        BACK
        DEB
        LYM
        MUC
        MUS
        NORM
        STR
        TUM
    }
    class StatusAnalise {
        <<enumeration>>
        QUEUED
        PROCESSING
        DONE
        FAILED
    }

    class Usuario {
        +UUID id
        +Email email
        +String nome
        +Perfil perfil
        +String hashSenha
        +podeVerAnalise(a: Analise) bool
    }
    class Imagem {
        +UUID id
        +Sha256 hash
        +String mimeType
        +int largura
        +int altura
        +int tamanhoBytes
        +String chaveArmazenamento
        +ClasseTecidual? classeVerdadeira
        +validar() void
        +recorteCentral() Imagem
    }
    class VersaoModelo {
        +UUID id
        +String nome
        +String versao
        +Sha256 hashArquivo
        +bool ativa
    }
    class Analise {
        +UUID id
        +StatusAnalise status
        +bool cacheHit
        +Duracao tempoWorker
        +Duracao tempoTotal
        +String? erro
        +concluir(r: ResultadoInferencia) void
        +falhar(motivo: String) void
        +UUID? reenvioDe
        +reenviar() Analise
    }
    class ResultadoInferencia {
        +ClasseTecidual classeSugerida
        +Map~ClasseTecidual,float~ probabilidades
        +MapaGradCam mapa
        +float escoreForaDoPadrao
        +bool foraDoPadrao
        +String versaoModelo
        +bool baixaConfianca()
        +ranking() List~ClasseTecidual~
    }
    class MapaGradCam {
        +String chaveArmazenamento
        +String camadaAlvo
        +ClasseTecidual classeAlvo
    }
    class Lote {
        +UUID id
        +String rotulo
        +adicionar(a: Analise) void
    }
    class TentativaQuiz {
        +UUID id
        +ClasseTecidual resposta
        +bool acertou()
    }
    class Consentimento {
        +String documento
        +String versao
        +DateTime aceitoEm
    }

    Usuario "1" --> "*" Analise : solicita
    Usuario "1" --> "*" Lote : cria
    Usuario "1" --> "*" Consentimento : registra
    Usuario "1" --> "*" TentativaQuiz : realiza
    Imagem "1" --> "*" Analise : analisada em
    VersaoModelo "1" --> "*" Analise : produz
    Lote "0..1" o-- "*" Analise : agrupa
    Analise "1" *-- "0..1" ResultadoInferencia
    ResultadoInferencia "1" *-- "1" MapaGradCam
    TentativaQuiz "*" --> "1" Imagem : sobre
    Usuario --> Perfil
    Analise --> StatusAnalise

```

## 2.2 Diagrama de classes — Casos de uso, portas e adaptadores (arquitetura hexagonal)

Os casos de uso dependem apenas das portas (interfaces). As implementações concretas, os adaptadores, ficam na camada de infraestrutura e podem ser trocadas sem alterar o domínio.

```mermaid
classDiagram
    direction LR
    class SubmeterAnalise {
        <<caso de uso>>
        +executar(cmd) RespostaSubmissao
    }
    class ProcessarResultado {
        <<caso de uso>>
        +executar(evento) void
    }
    class ConsultarHistorico {
        <<caso de uso>>
        +executar(filtro) Pagina~Analise~
    }
    class ResponderQuiz {
        <<caso de uso>>
        +executar(cmd) FeedbackQuiz
    }

    class AnaliseRepository {
        <<interface>>
        +salvar(a: Analise) void
        +buscar(id: UUID) Analise
        +listar(filtro) Pagina~Analise~
    }
    class CacheResultados {
        <<interface>>
        +obter(hash, versao) ResultadoInferencia?
        +gravar(hash, versao, r) void
    }
    class PublicadorJobs {
        <<interface>>
        +publicar(job: JobInferencia) void
    }
    class NotificadorEventos {
        <<interface>>
        +notificar(analiseId, evento) void
    }
    class ArmazenamentoImagens {
        <<interface>>
        +guardar(bytes) String
    }

    SubmeterAnalise ..> AnaliseRepository
    SubmeterAnalise ..> CacheResultados
    SubmeterAnalise ..> PublicadorJobs
    SubmeterAnalise ..> ArmazenamentoImagens
    ProcessarResultado ..> AnaliseRepository
    ProcessarResultado ..> CacheResultados
    ProcessarResultado ..> NotificadorEventos
    ConsultarHistorico ..> AnaliseRepository

    class PrismaAnaliseRepository
    class RedisCacheResultados
    class RabbitMqPublicadorJobs
    class RedisPubSubNotificador
    class DiscoArmazenamentoImagens
    PrismaAnaliseRepository ..|> AnaliseRepository
    RedisCacheResultados ..|> CacheResultados
    RabbitMqPublicadorJobs ..|> PublicadorJobs
    RedisPubSubNotificador ..|> NotificadorEventos
    DiscoArmazenamentoImagens ..|> ArmazenamentoImagens
```

Os valores de `StatusAnalise` são os mesmos do banco e do contrato de mensagens; a interface mostra rótulos em português ("na fila", "processando", "concluída", "falhou"). `reenviar()` cria uma **nova** análise ligada à original por `reenvioDe`, preservando o histórico de tentativas. A decisão de imagem fora do padrão (RF17) é produzida pelo serviço de inferência e chega no resultado; por isso pertence a `ResultadoInferencia`, e não a `Imagem`.

**Padrões de projeto aplicados:**

| Padrão | Onde | Para quê |
|---|---|---|
| Ports & Adapters, hexagonal (COCKBURN, 2005) | Portas `*Repository`, `CacheResultados`, `PublicadorJobs`; adaptadores Prisma, Redis, RabbitMQ | Isolar o domínio da infraestrutura |
| Repository (FOWLER, 2002) | `AnaliseRepository` | Abstrair a persistência |
| Command / Use Case | `SubmeterAnalise`, `ProcessarResultado`… | Uma operação de negócio por classe (responsabilidade única) |
| Value Object (EVANS, 2003) | `Sha256`, `Email`, `Duracao` | Validar na criação e evitar dados inválidos no domínio |
| Observer (GAMMA et al., 1994) / Publish-Subscribe (HOHPE; WOOLF, 2003) | `NotificadorEventos` → SSE | Notificar o navegador quando o resultado chega |
| Strategy (GAMMA et al., 1994) | Backbone da CNN e colormap do Grad-CAM (serviço de inferência) | Trocar a arquitetura do modelo ou a paleta sem alterar o fluxo |
| Idempotent Receiver (HOHPE; WOOLF, 2003) | `ProcessarResultado` (ignora `job_id` repetido) | Mensagens duplicadas não geram efeitos duplicados |

## 2.3 Diagrama de classes — Serviço de inferência

```mermaid
classDiagram
    direction LR
    class ConsumidorJobs {
        +iniciar() void
        -aoReceber(msg) void
    }
    class ProcessarJob {
        <<caso de uso>>
        +executar(job: JobInferencia) ResultadoJob
    }
    class PreProcessador {
        +preparar(bytes) Tensor
    }
    class Classificador {
        <<interface>>
        +prever(t: Tensor) Probabilidades
    }
    class ExplicadorGradCam {
        +gerar(t: Tensor, classe) MapaCalor
    }
    class ModeloPyTorch {
        +versao String
        +hashArquivo String
        +carregar(caminho) void
        +aquecer() void
    }
    class PublicadorResultados {
        <<interface>>
        +publicar(r: ResultadoJob) void
    }
    class RabbitMqPublicadorResultados
    ConsumidorJobs --> ProcessarJob
    ProcessarJob --> PreProcessador
    ProcessarJob --> Classificador
    ProcessarJob --> ExplicadorGradCam
    ProcessarJob --> PublicadorResultados
    ModeloPyTorch ..|> Classificador
    ExplicadorGradCam --> ModeloPyTorch
    RabbitMqPublicadorResultados ..|> PublicadorResultados
```

## 2.4 Diagramas de sequência dos fluxos principais

### SQ1 — Enviar *patch* (sem resultado em cache) — UC02, RF01–RF05, RNF01

```mermaid
sequenceDiagram
    autonumber
    actor U as Estudante
    participant FE as Frontend (Next.js)
    participant BE as Orquestração (API/SSE)
    participant RD as Redis
    participant PG as PostgreSQL
    participant MQ as RabbitMQ
    participant WK as Serviço de inferência
    U->>FE: arrasta o patch
    FE->>FE: exibe skeleton (otimista)
    FE->>BE: POST /api/analyses (multipart)
    BE->>BE: valida tipo, tamanho, dimensões (RN01) e calcula SHA-256
    BE->>RD: GET cache:sha256:{hash}:{versão}
    RD-->>BE: (vazio)
    BE->>PG: INSERT analyses (QUEUED)
    BE->>MQ: publish inference.request (com model_version)
    MQ-->>BE: confirmação do broker (publisher confirm)
    BE-->>FE: 202 {analysisId}
    Note over FE,BE: um único canal SSE por usuário (GET /api/events), multiplexado por analysisId
    FE->>BE: GET /api/events (SSE)
    BE->>RD: SUBSCRIBE user:{id}
    BE->>PG: SELECT status das análises pendentes (assina antes de ler: evita perder evento)
    MQ->>WK: entrega job
    WK->>MQ: publish inference.started
    WK->>WK: pré-processa → classifica + Grad-CAM (uma passagem) → escore fora do padrão
    WK->>MQ: publish inference.completed (versão e SHA-256 do modelo que rodou)
    MQ->>BE: entrega resultado
    BE->>BE: confere versão/SHA-256 com model_versions
    BE->>PG: UPDATE analyses (DONE, probabilidades, mapa, versão, tempos)
    BE->>RD: SET cache + PUBLISH user:{id}
    BE->>MQ: ack
    RD-->>BE: mensagem
    BE-->>FE: event: completed
    FE-->>U: barras de confiança + Grad-CAM interativo
```

### SQ2 — Enviar *patch* já analisado (resultado em cache) — RN05

```mermaid
sequenceDiagram
    autonumber
    actor U as Estudante
    participant FE as Frontend
    participant BE as Orquestração
    participant RD as Redis
    participant PG as PostgreSQL
    U->>FE: envia imagem repetida
    FE->>BE: POST /api/analyses
    BE->>RD: GET cache:sha256:{hash}:{versão}
    RD-->>BE: resultado
    BE->>PG: INSERT analyses (DONE, cache_hit = true, sem job_id)
    BE-->>FE: 200 {analysisId, resultado}
    FE-->>U: resultado imediato (< 150 ms)
```

### SQ3 — Falha no processamento e reenvio — RF14, RNF05

As novas tentativas são feitas por filas de espera com tempo de vida (1 s, 5 s e 25 s), que devolvem a mensagem à fila principal. Na última tentativa, o próprio serviço de inferência publica o resultado com `status: FAILED`, porque o RabbitMQ não gera eventos de domínio. Uma rotina do backend marca como falha as análises paradas há mais de 5 minutos (serviço fora do ar).

```mermaid
sequenceDiagram
    autonumber
    actor U as Estudante
    participant FE as Frontend
    participant BE as Orquestração
    participant MQ as RabbitMQ
    participant WK as Serviço de inferência
    MQ->>WK: entrega job (tentativa 1)
    WK->>WK: erro
    loop tentativas 2 e 3
        WK->>MQ: republica em inference.request.retry.n (espera 1 s / 5 s)
        WK->>MQ: ack da mensagem original
        MQ->>WK: reentrega após a espera
        WK->>WK: erro
    end
    WK->>MQ: publish inference.completed (status FAILED, error)
    WK->>MQ: nack sem reenfileirar → inference.dlq (auditoria)
    MQ->>BE: entrega resultado FAILED
    BE->>BE: Analise.falhar(motivo)
    BE-->>FE: event: failed
    FE-->>U: "Não foi possível analisar. Tentar novamente?"
    U->>FE: clica em reenviar
    FE->>BE: POST /api/analyses/{id}/retry
    BE->>BE: cria nova Analise (reenvioDe = id)
    BE->>MQ: publish inference.request (novo job_id)
    BE-->>FE: 201 {novaAnaliseId}
```

### SQ4 — Consultar e reabrir análise do histórico — UC10, RF06, RN06

```mermaid
sequenceDiagram
    autonumber
    actor U as Estudante
    participant FE as Frontend
    participant BE as Orquestração
    participant PG as PostgreSQL
    U->>FE: abre Histórico e filtra por classe
    FE->>BE: GET /api/analyses?class=TUM&cursor=...
    BE->>PG: SELECT ... WHERE user_id = :usuario (RN06)
    PG-->>BE: página de análises
    BE-->>FE: lista paginada
    U->>FE: seleciona uma análise
    FE->>BE: GET /api/analyses/{id}
    BE->>BE: Usuario.podeVerAnalise()
    alt pertence ao usuário
        BE-->>FE: análise com resultado e versão do modelo
        FE-->>U: mesma visualização da análise original
    else pertence a outro usuário
        BE-->>FE: 404 (não revela existência)
    end
```

### SQ5 — Praticar no modo quiz — UC09, RF09, RF16, RN07

```mermaid
sequenceDiagram
    autonumber
    actor U as Estudante
    participant FE as Frontend
    participant BE as Orquestração
    participant PG as PostgreSQL
    U->>FE: ativa modo quiz e escolhe amostra
    FE->>BE: GET /api/samples/{id}?quiz=true
    BE-->>FE: imagem SEM classe verdadeira (RN07)
    U->>FE: responde "STR"
    FE->>BE: POST /api/quiz/attempts {amostra, resposta}
    BE->>PG: INSERT quiz_attempts
    BE-->>FE: {correta: MUS, acertou: false, critériosDiferenciais}
    FE-->>U: erro explicado (MUS × STR) + sugestão do modelo
```
