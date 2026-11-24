# Ambiente reprodutível do pipeline de treino e avaliação (CPU).
#   docker build -t histolente-ml ml
#   docker run --rm --shm-size=2g -v "$PWD:/repo" -v /caminho/dados:/dados:ro -w /repo/ml histolente-ml python -m histolente_ml ...
#   (--shm-size: os workers do DataLoader trocam lotes por memória compartilhada; o padrão de 64 MB não basta)
FROM python:3.12.7-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 torchvision==0.20.1
COPY requirements.txt requirements-dev.txt /tmp/
RUN pip install -r /tmp/requirements.txt -r /tmp/requirements-dev.txt
RUN useradd -u 1000 -m ml
USER ml
WORKDIR /repo/ml
