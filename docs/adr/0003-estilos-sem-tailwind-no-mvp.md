# ADR 0003 — Estilos em CSS próprio no MVP

- **Data:** 24/11/2026
- **Status:** aceita (revisar na Sprint 4)

## Contexto
O guia de estilo previa Tailwind CSS e shadcn/ui. O protótipo validado com os usuários (Sprint 0) já tinha o guia implementado em CSS puro, com os mesmos tokens.

## Decisão
O MVP reaproveita o CSS do protótipo (`apps/web/src/app/globals.css`), com os tokens do guia de estilo como variáveis CSS. Tailwind e shadcn/ui ficam para quando houver componentes novos que se beneficiem deles.

## Consequências
- A interface entregue é a mesma que os usuários avaliaram, sem retrabalho visual.
- Sem dependência de build de CSS; menos pacotes.
- O texto da monografia e do projeto deixa de afirmar Tailwind/shadcn como implementados até a revisão desta decisão.
