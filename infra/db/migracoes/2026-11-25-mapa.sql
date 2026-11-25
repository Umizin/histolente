-- Medidas da região de maior influência do mapa Grad-CAM (leitura "Como ler este mapa").
-- O schema.sql só roda na criação do banco; em bancos existentes, aplicar:
--   docker compose -f infra/docker-compose.yml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < infra/db/migracoes/2026-11-25-mapa.sql
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS gradcam_summary jsonb;
