-- Modelo físico — HistoLente
-- PostgreSQL 16. Acesso exclusivo do Backend de Orquestração (o serviço de inferência NÃO acessa este banco — RNF06).
-- Dicionário de dados: docs/projeto/03-modelagem-de-dados.md

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

-- Tipos enumerados ---------------------------------------------------------
CREATE TYPE tissue_class     AS ENUM ('ADI','BACK','DEB','LYM','MUC','MUS','NORM','STR','TUM');
CREATE TYPE user_role        AS ENUM ('STUDENT','PROFESSOR','ADMIN');
CREATE TYPE analysis_status  AS ENUM ('QUEUED','PROCESSING','DONE','FAILED');
CREATE TYPE image_source     AS ENUM ('UPLOAD','SAMPLE_GALLERY');
CREATE TYPE consent_document AS ENUM ('TERMS','TCLE');

-- Usuários -----------------------------------------------------------------
CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         citext      NOT NULL UNIQUE,
    name          text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
    role          user_role   NOT NULL DEFAULT 'STUDENT',
    password_hash text        NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);

-- Versões do modelo --------------------------------------------------------
CREATE TABLE model_versions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    version     text        NOT NULL UNIQUE,
    file_sha256 char(64)    NOT NULL CHECK (file_sha256 ~ '^[0-9a-f]{64}$'),
    backbone    text        NOT NULL,
    metrics     jsonb,
    trained_at  timestamptz,
    active      boolean     NOT NULL DEFAULT false
);
-- no máximo uma versão ativa (RF12)
CREATE UNIQUE INDEX model_versions_one_active ON model_versions (active) WHERE active;

-- Imagens ------------------------------------------------------------------
CREATE TABLE images (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sha256             char(64)     NOT NULL UNIQUE CHECK (sha256 ~ '^[0-9a-f]{64}$'),
    mime_type          text         NOT NULL CHECK (mime_type IN ('image/png','image/jpeg')),
    width              integer      NOT NULL CHECK (width > 0),
    height             integer      NOT NULL CHECK (height > 0),
    size_bytes         integer      NOT NULL CHECK (size_bytes BETWEEN 1 AND 5242880),
    storage_key        text         NOT NULL,
    source             image_source NOT NULL DEFAULT 'UPLOAD',
    ground_truth_class tissue_class,
    created_at         timestamptz  NOT NULL DEFAULT now(),
    UNIQUE (id, source),                       -- permite FK composta: quiz só com imagens da galeria
    CONSTRAINT gallery_has_ground_truth
        CHECK ((source = 'SAMPLE_GALLERY') = (ground_truth_class IS NOT NULL))
);

-- Lotes --------------------------------------------------------------------
CREATE TABLE batches (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label      text        NOT NULL CHECK (char_length(label) BETWEEN 1 AND 120),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Soma das probabilidades (RF03): 1 ± 1e-4
CREATE FUNCTION prob_sum(j jsonb) RETURNS numeric
    LANGUAGE sql IMMUTABLE AS $$ SELECT coalesce(sum(value::numeric), 0) FROM jsonb_each_text(j) $$;

-- Análises -----------------------------------------------------------------
CREATE TABLE analyses (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_id            uuid            NOT NULL REFERENCES images(id),
    model_version_id    uuid            NOT NULL REFERENCES model_versions(id),
    batch_id            uuid            REFERENCES batches(id) ON DELETE SET NULL,
    job_id              uuid            UNIQUE,                   -- idempotência do consumidor; nulo em resultado de cache
    retry_of            uuid            REFERENCES analyses(id),  -- reenvio cria nova análise (RF14)
    status              analysis_status NOT NULL DEFAULT 'QUEUED',
    predicted_class     tissue_class,
    probabilities       jsonb,
    heatmap_storage_key text,
    gradcam_target_class tissue_class,                            -- classe do mapa (padrão: a sugerida; HU09)
    cache_hit           boolean         NOT NULL DEFAULT false,
    out_of_distribution boolean         NOT NULL DEFAULT false,
    ood_score           real,                                     -- escore do RF17, gravado para recalibrar o limiar
    ood_method          text,
    ood_threshold       real,
    ood_reasons         text[]          NOT NULL DEFAULT '{}',    -- pouco_tecido | baixa_confianca | coloracao
    color_adjusted      jsonb,                                    -- coloração fora do padrão: sugestão com a cor normalizada (informativa)
    worker_ms           integer CHECK (worker_ms >= 0),
    e2e_ms              integer CHECK (e2e_ms >= 0),
    error               text,
    created_at          timestamptz     NOT NULL DEFAULT now(),
    completed_at        timestamptz,
    CONSTRAINT done_has_result CHECK (
        status <> 'DONE'
        OR (predicted_class IS NOT NULL AND probabilities IS NOT NULL AND completed_at IS NOT NULL)
    ),
    CONSTRAINT probabilities_nine_classes CHECK (
        probabilities IS NULL
        OR (probabilities ?& ARRAY['ADI','BACK','DEB','LYM','MUC','MUS','NORM','STR','TUM'])
    ),
    CONSTRAINT failed_has_error CHECK (status <> 'FAILED' OR error IS NOT NULL),
    CONSTRAINT job_or_cache CHECK (cache_hit OR job_id IS NOT NULL),
    CONSTRAINT probabilities_sum_one CHECK (probabilities IS NULL OR abs(prob_sum(probabilities) - 1) <= 0.0001)
);
CREATE INDEX analyses_user_created ON analyses (user_id, created_at DESC);   -- histórico (RF06)
CREATE INDEX analyses_user_class   ON analyses (user_id, predicted_class);  -- filtro por classe
CREATE INDEX analyses_batch        ON analyses (batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX analyses_pending      ON analyses (status) WHERE status IN ('QUEUED','PROCESSING');

-- Consentimentos -----------------------------------------------------------
CREATE TABLE consents (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid             REFERENCES users(id) ON DELETE SET NULL,  -- vínculo direto some com a conta...
    subject_ref char(64)         NOT NULL CHECK (subject_ref ~ '^[0-9a-f]{64}$'), -- ...mas o pseudônimo (HMAC-SHA256 do e-mail) prova o consentimento
    document    consent_document NOT NULL,
    version     text             NOT NULL,
    accepted_at timestamptz      NOT NULL DEFAULT now(),
    UNIQUE (subject_ref, document, version)
);

-- Tentativas do quiz -------------------------------------------------------
CREATE TABLE quiz_attempts (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_id   uuid         NOT NULL,
    image_source image_source NOT NULL DEFAULT 'SAMPLE_GALLERY' CHECK (image_source = 'SAMPLE_GALLERY'),
    answer     tissue_class NOT NULL,
    correct    boolean      NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    FOREIGN KEY (image_id, image_source) REFERENCES images (id, source)
);
CREATE INDEX quiz_attempts_user ON quiz_attempts (user_id, created_at DESC); -- progresso (RF16)

COMMIT;
