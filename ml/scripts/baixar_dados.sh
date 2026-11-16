#!/usr/bin/env bash
# Baixa os datasets de Kather et al. (Zenodo, doi:10.5281/zenodo.1214456) para a pasta indicada.
#   NCT-CRC-HE-100K  (~11,7 GB)  -> treino e validação
#   CRC-VAL-HE-7K    (~0,8 GB)   -> teste independente (pacientes diferentes)
# Uso: bash ml/scripts/baixar_dados.sh /caminho/dados
set -euo pipefail
DESTINO="${1:-dados}"
BASE="https://zenodo.org/records/1214456/files"
mkdir -p "$DESTINO"
cd "$DESTINO"
for ARQ in CRC-VAL-HE-7K.zip NCT-CRC-HE-100K.zip; do
  if [ ! -d "${ARQ%.zip}" ]; then
    wget -c --progress=dot:giga "$BASE/$ARQ?download=1" -O "$ARQ"
    sha256sum "$ARQ" | tee -a checksums.sha256   # registra o hash do arquivo baixado (rastreabilidade)
    unzip -q "$ARQ"
    rm "$ARQ"
  fi
done
for D in NCT-CRC-HE-100K CRC-VAL-HE-7K; do
  echo "$D:"; for C in ADI BACK DEB LYM MUC MUS NORM STR TUM; do printf "  %-5s %6s\n" "$C" "$(ls "$D/$C" | wc -l)"; done
done
