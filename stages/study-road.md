---
title:
  pt: "Estrada de estudos (roadmap v2)"
  en: "Study road (roadmap v2)"
kind: project
---
<!-- pt -->
## Motivação

O roadmap v1 era o formato tradicional: um mapa estático com 39 tópicos definidos de antemão. Bonito, mas rígido. Na prática o próximo passo muda conforme eu estudo, e um mapa fechado envelhece rápido.

A v2 troca o plano completo por uma estrada que vai sendo construída. Só o que já estudei fica desenhado, a etapa atual fica marcada e o resto é neblina. A próxima etapa é decidida enquanto estudo a atual.

## Como funciona

Tudo vem de markdown: `road.md` guarda a estrada inteira com datas, uma etapa por linha, e cada etapa tem seu arquivo com motivação e notas. A distância entre etapas é proporcional aos dias, e as pausas aparecem sozinhas a partir das datas.

## O que pratiquei

Um sistema pequeno de ponta a ponta: conteúdo em markdown, build em Node que valida as datas e gera uma página única, e publicação automática no GitHub Pages a cada push.

<!-- en -->
## Motivation

Roadmap v1 was the traditional format: a static map with 39 topics defined upfront. Nice to look at, but rigid. In practice the next step changes as I study, and a closed map goes stale fast.

V2 swaps the full plan for a road that gets built as I go. Only what I've studied is drawn, the current stage is marked and the rest is fog. The next stage is decided while I study the current one.

## How it works

Everything comes from markdown: `road.md` holds the whole road with dates, one stage per line, and each stage has its own file with motivation and notes. Distance between stages is proportional to days, and breaks appear on their own from the dates.

## What I practiced

A small end-to-end system: markdown content, a Node build that validates dates and emits a single page, and automatic publishing to GitHub Pages on every push.
