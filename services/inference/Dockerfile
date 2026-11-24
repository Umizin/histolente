# Serviço de inferência do HistoLente — construir a partir da raiz do repositório:
#   docker build -f services/inference/Dockerfile -t histolente-inference .
FROM python:3.12.7-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 torchvision==0.20.1
COPY services/inference/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
WORKDIR /srv
COPY ml/histolente_ml /srv/histolente_ml
COPY services/inference/app /srv/app
RUN useradd --system --uid 10001 inferencia && mkdir -p /models && chown inferencia /models
USER inferencia
ENV MODEL_DIR=/models
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=10 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/readyz').status==200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
