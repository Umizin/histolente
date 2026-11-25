-- Motivos de "fora do padrão" e sugestão com a cor ajustada (RF17, risco R01; ADR 0005).
-- O schema.sql só roda na criação do banco; em bancos existentes, aplicar:
--   docker compose -f infra/docker-compose.yml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < infra/db/migracoes/2026-11-25-cor.sql
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS ood_reasons text[] NOT NULL DEFAULT '{}';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS color_adjusted jsonb;
