"""Pipeline de treino e avaliação do classificador do HistoLente (EN01)."""

CLASSES: tuple[str, ...] = ("ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM")
"""Ordem canônica = ordem alfabética do ImageFolder = índice de saída do modelo. Não alterar."""

NOMES_PT: dict[str, str] = {
    "ADI": "Tecido adiposo",
    "BACK": "Fundo",
    "DEB": "Detritos / necrose",
    "LYM": "Linfócitos",
    "MUC": "Muco",
    "MUS": "Músculo liso",
    "NORM": "Mucosa colônica normal",
    "STR": "Estroma associado ao câncer",
    "TUM": "Epitélio de adenocarcinoma",
}
