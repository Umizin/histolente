# Pipeline de treino e avaliação (EN01)

## Protocolo
| Etapa | Dados | Observação |
|---|---|---|
| Treino | NCT-CRC-HE-100K, 85% de cada classe | divisão estratificada, semente 42, salva em `splits/*.csv` |
| Validação (escolha de época / early stopping) | NCT-CRC-HE-100K, 15% de cada classe | o 100K não identifica o paciente; por isso este número é otimista e **não** é reportado como desempenho |
| **Teste final** | CRC-VAL-HE-7K | pacientes diferentes; usado uma única vez, no fim (evita vazamento — risco R02) |

**Aumento de dados** (só no treino): espelhamentos, rotações de 90° e variação leve de brilho, contraste e saturação. Ficam de fora, de propósito, recortes com mudança de escala, distorções elásticas e mudanças grandes de matiz, porque alteram a morfologia ou a coloração H&E.

**Métricas** (`metricas.json`):
- accuracy, balanced accuracy, F1 macro e ponderado, kappa, ROC-AUC (um contra todos), ECE (calibração);
- precisão, sensibilidade e F1 por classe;
- matriz de confusão 9×9 (com figura);
- IC 95% por bootstrap (1.000 reamostragens);
- em destaque, a **sensibilidade da classe TUM** e a confusão NORM × TUM, pedidos da elicitação.

## Uso
Dados: `bash scripts/baixar_dados.sh /caminho/dados`. Para treinar com GPU, use [`notebooks/treino_colab.ipynb`](notebooks/treino_colab.ipynb).

```bash
cd ml
python -m histolente_ml dividir  --raiz DADOS/NCT-CRC-HE-100K --saida splits
python -m histolente_ml treinar  --raiz DADOS/NCT-CRC-HE-100K --splits splits --backbone resnet18 --saida runs/resnet18
python -m histolente_ml avaliar  --modelo runs/resnet18/melhor.pt --backbone resnet18 --raiz DADOS/CRC-VAL-HE-7K --saida reports/resnet18
python -m histolente_ml exportar --modelo runs/resnet18/melhor.pt --backbone resnet18 --versao 0.1.0 \
                                 --treino runs/resnet18/treino.json --metricas reports/resnet18/metricas.json
python -m histolente_ml latencia --backbone resnet18 --modelo models/resnet18-nct-0.1.0.pt   # máquina de referência, ociosa
```

Backbones disponíveis: `resnet18`, `resnet50`, `efficientnet_b0`, `densenet121`.

## Testes
```bash
pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 torchvision==0.20.1
pip install -r requirements.txt -r requirements-dev.txt
pytest -q
```
Os testes usam um conjunto sintético gerado na hora. Os números que eles produzem **não** são desempenho do modelo.

## Resultados
`[[RESULTADO A COLETAR]]`: depois do treino no Colab, copie `metricas.json`, `matriz_confusao.png` e `treino.json` de cada backbone para `reports/<backbone>/`.
