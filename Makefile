COMPOSE = docker compose -f infra/docker-compose.yml

.PHONY: env up app down logs verificar fumaca docs

env:            ## cria infra/.env a partir do exemplo (se ainda não existir)
	@test -f infra/.env || cp infra/.env.example infra/.env

up: env         ## sobe Postgres, Redis e RabbitMQ e espera ficarem saudáveis
	$(COMPOSE) up -d --wait

app: env        ## sobe tudo: infraestrutura, web (porta 3000), consumidor e serviço de inferência
	$(COMPOSE) --profile app up -d --build --wait

down:           ## derruba o ambiente (mantém os volumes)
	$(COMPOSE) --profile app down

logs:
	$(COMPOSE) logs -f --tail=100

verificar: up   ## testes de ponta a ponta do ambiente
	$(COMPOSE) --profile teste run --rm verificador

fumaca: app     ## teste de fumaça: cadastro, termo, análise ponta a ponta e cache
	$(COMPOSE) --profile teste run --rm -e WEB_URL=http://web:3000 verificador \
	  sh -c "pip install -q --root-user-action=ignore pytest==8.3.3 && python -m pytest -q -s -p no:cacheprovider tests/fumaca"

docs:           ## regenera diagramas e PDFs
	python3 -I tools/diagramas.py
	python3 -I tools/md2pdf.py todos
