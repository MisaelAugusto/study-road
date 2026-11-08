# Estrada de estudos

Meu diário de estudos de engenharia, desenhado como uma estrada que vai sendo construída.

## Como funciona

- **`road.md`** é a estrada inteira: uma linha por etapa de estudo (`[[etapa]]`), com datas. Embaixo fica a fila de próximos, sem data.
- **`stages/<etapa>.md`** guarda o detalhe de cada etapa: título, tipo, autor, links e as notas em PT e EN. Datas nunca entram aqui.

O mapa calcula tudo a partir disso: distância entre etapas proporcional aos dias, etapas concluídas, a atual e o que está na neblina. Pausas também são calculadas: qualquer intervalo entre o fim de uma etapa e o começo da próxima. Uma pausa aberta conta os dias até ontem e cresce sozinha até você começar a próxima etapa.

## Rotina

Começar uma etapa: mova a linha dela da fila para a estrada com a data de início.

    - 2026-11-21 → · [[trunk-based]]

Terminar: coloque a data de fim e escreva as notas em `stages/trunk-based.md`.

    - 2026-11-21 → 2026-12-05 · [[trunk-based]]

Nova etapa: copie `stages/_template.md` para `stages/<nome>.md` e coloque `[[nome]]` na fila.

## Comandos

    npm install
    npm run check   # só valida road.md e stages/
    npm run build   # gera dist/index.html

O build para com uma mensagem clara se houver data inválida, etapas sobrepostas, etapa inexistente ou mais de uma etapa aberta. Ao dar push na `main`, o GitHub Actions publica o `dist/` no GitHub Pages.
