// Lê road.md (a estrada, uma linha por trecho) e stages/*.md (o detalhe de cada etapa)
// e gera dist/index.html (página autocontida) + dist/road.json.
// Reads road.md (the road, one line per stretch) and stages/*.md (each stage's details)
// and emits dist/index.html (self-contained page) + dist/road.json.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const STAGES = path.join(ROOT, "stages");
const DIST = path.join(ROOT, "dist");
const CHECK_ONLY = process.argv.includes("--check");
const KINDS = ["book", "video", "article", "guide", "course", "project", "talk"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

function splitLang(body) {
  const parts = body.split(/<!--\s*(pt|en)\s*-->/);
  if (parts.length === 1) return { pt: body.trim(), en: body.trim() };
  const out = { pt: "", en: "" };
  for (let i = 1; i < parts.length; i += 2) out[parts[i]] = parts[i + 1].trim();
  return { pt: out.pt || out.en, en: out.en || out.pt };
}

/* ---------- stages/*.md ---------- */
const stages = new Map();
for (const f of fs.readdirSync(STAGES).sort()) {
  if (!f.endsWith(".md") || f.startsWith("_")) continue;
  const slug = f.replace(/\.md$/, "");
  const where = `stages/${f}`;
  const { data, content } = matter(fs.readFileSync(path.join(STAGES, f), "utf8"));
  const title = typeof data.title === "string" ? { pt: data.title, en: data.title } : (data.title ?? {});
  if (!title.pt && !title.en) err(where, "falta title / missing title");
  if (data.kind && !KINDS.includes(data.kind)) err(where, `kind "${data.kind}" desconhecido (use: ${KINDS.join(", ")})`);
  for (const l of data.links ?? []) if (!l?.url) err(where, "link sem url / link without url");
  const body = splitLang(content);
  stages.set(slug, {
    id: slug, kind: data.kind ?? "book", author: data.author ?? null, links: data.links ?? [],
    title: { pt: title.pt ?? title.en, en: title.en ?? title.pt },
    html: { pt: marked.parse(body.pt), en: marked.parse(body.en) }
  });
}

/* ---------- road.md ---------- */
const roadFile = path.join(ROOT, "road.md");
const roadRaw = fs.readFileSync(roadFile, "utf8");
const road = matter(roadRaw);
const lineOffset = roadRaw.slice(0, roadRaw.indexOf(road.content)).split("\n").length - 1;
const stretches = [];   // etapas datadas, em ordem
const queue = [];       // próximos, sem data
let section = null;
road.content.split("\n").forEach((raw, i) => {
  const where = `road.md:${i + 1 + lineOffset}`;
  const h = raw.match(/^##\s+(.*)$/);
  if (h) { section = /estrada|road/i.test(h[1]) ? "road" : /pr[oó]xim|next|fila|queue/i.test(h[1]) ? "next" : null; return; }
  if (!section || !/^([-*]|\d+\.)\s+/.test(raw)) return;          // só itens de lista sem recuo
  const item = raw.replace(/^([-*]|\d+\.)\s+/, "").trim();
  if (section === "next") {
    const m = item.match(/\[\[([a-z0-9-]+)\]\]/);
    if (!m) return err(where, `item da fila sem [[etapa]]: "${item}"`);
    queue.push({ slug: m[1], where });
    return;
  }
  const m = item.match(/^(\S+)\s*(?:→|->)\s*(\d{4}-\d{2}-\d{2})?\s*(?:·|\|)?\s*(.*)$/);
  if (!m) return err(where, `não entendi a linha: "${item}" (formato: início → fim · [[etapa]])`);
  const [, from, to = null, rest] = m;
  if (!DATE.test(from)) return err(where, `data de início inválida "${from}" (use AAAA-MM-DD)`);
  if (to && to < from) err(where, `fim (${to}) antes do início (${from})`);
  const link = rest.match(/\[\[([a-z0-9-]+)\]\]/);
  if (link) stretches.push({ type: "stage", slug: link[1], from, to, where });
  else err(where, `esperava [[etapa]] depois das datas: "${rest}"`);
});

// ordem, sobreposição e trecho aberto
stretches.forEach((s, i) => {
  const prev = stretches[i - 1];
  if (prev && s.from < prev.from) err(s.where, "fora de ordem: as linhas da estrada vão da mais antiga para a mais nova");
  if (prev && prev.to && s.from <= prev.to) err(s.where, `começa em ${s.from}, mas o trecho anterior só termina em ${prev.to}`);
  if (!s.to && i !== stretches.length - 1) err(s.where, "só o último trecho pode ficar sem data de fim");
});

const seen = new Set();
const log = [];
for (const s of stretches.filter(x => x.type === "stage")) {
  const st = stages.get(s.slug);
  if (!st) { err(s.where, `etapa [[${s.slug}]] não existe em stages/`); continue; }
  if (seen.has(s.slug)) err(s.where, `[[${s.slug}]] aparece duas vezes na estrada`);
  seen.add(s.slug);
  log.push({ ...st, started: s.from, finished: s.to, status: s.to ? "done" : "in-progress", order: 999 });
}
queue.forEach((q, i) => {
  const st = stages.get(q.slug);
  if (!st) return err(q.where, `etapa [[${q.slug}]] não existe em stages/`);
  if (seen.has(q.slug)) return err(q.where, `[[${q.slug}]] já está na estrada; tire da fila`);
  seen.add(q.slug);
  log.push({ ...st, started: null, finished: null, status: "planned", order: i + 1 });
});
for (const slug of stages.keys()) if (!seen.has(slug)) warnings.push(`stages/${slug}.md não aparece no road.md (fica fora do mapa)`);


if (warnings.length) console.warn("! " + warnings.join("\n! "));
if (errors.length) {
  console.error(`\n✖ ${errors.length} problema(s):\n  ` + errors.join("\n  "));
  process.exit(1);
}
const data = {
  generatedAt: new Date().toISOString().slice(0, 10),
  site: { author: road.data.author ?? null },
  log
};
console.log(`✔ ${log.filter(x => x.started).length} etapas na estrada, ${queue.length} na fila`);
if (CHECK_ONLY) process.exit(0);

const tpl = fs.readFileSync(path.join(ROOT, "src", "template.html"), "utf8");
if (!tpl.includes("/*__DATA__*/null")) { console.error("✖ src/template.html sem o marcador /*__DATA__*/null"); process.exit(1); }
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, "index.html"), tpl.replace("/*__DATA__*/null", JSON.stringify(data).replace(/</g, "\\u003c")));
fs.writeFileSync(path.join(DIST, "road.json"), JSON.stringify(data, null, 2));
console.log("✔ dist/index.html e dist/road.json gerados");
