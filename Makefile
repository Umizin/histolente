COMPOSE = docker compose -f infra/docker-compose.yml

.PHONY: env up down logs verificar docs

env:            ## cria infra/.env a partir do exemplo (se ainda não existir)
	@test -f infra/.env || cp infra/.env.example infra/.env

up: env         ## sobe Postgres, Redis e RabbitMQ e espera ficarem saudáveis
	$(COMPOSE) up -d --wait

down:           ## derruba o ambiente (mantém os volumes)
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=100

verificar: up   ## testes de ponta a ponta do ambiente
	$(COMPOSE) --profile teste run --rm verificador

docs:           ## regenera diagramas e PDFs
	python3 -I tools/diagramas.py
	python3 -I tools/md2pdf.py todos
