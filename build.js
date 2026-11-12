#!/usr/bin/env node
'use strict';

// Builds the whole site from content/ into dist/. Uses only what ships with Node:
// there is nothing to install.
//
//   node build.js              build with drafts and yellow preview notes (for review)
//   node build.js --production build exactly what the live site will show
//   node build.js --portable   build into preview/ with links that work when opened from a folder
//   node build.js --check      print what is still unfinished, without building
//
// netlify.toml runs the --production build for the live site, so drafts and notes never reach it.

const fs = require('fs');
const path = require('path');
const { load, isText, STORY_PARTS } = require('./lib/content');
const { makeUrl } = require('./lib/html');
const layout = require('./templates/layout');
const home = require('./templates/home');
const work = require('./templates/work');
const projectPage = require('./templates/project');
const studio = require('./templates/studio');
const processPage = require('./templates/process');
const contact = require('./templates/contact');
const { sent, notFound } = require('./templates/simple');

const ROOT = __dirname;
const args = new Set(process.argv.slice(2));
const production = process.env.CONTEXT === 'production' || args.has('--production');
const portable = args.has('--portable');
const checkOnly = args.has('--check');
const OUT = path.join(ROOT, portable ? 'preview' : 'dist');

const data = load(ROOT);
const { site, people } = data;

data.warnings.forEach((w) => console.warn(`Note: ${w}`));
if (data.errors.length) {
  console.error(`\nThe site was not built. ${data.errors.length} thing${data.errors.length === 1 ? '' : 's'} to fix:\n`);
  data.errors.forEach((e) => console.error(`  - ${e}`));
  console.error('');
  process.exit(1);
}

const showNotes = !production;
const visible = production ? data.projects.filter((p) => p.status === 'published') : data.projects;

// ---------------------------------------------------------------- unfinished items

function openItems() {
  const items = [];
  data.projects.forEach((p) => {
    if (p.status === 'draft') items.push(`${p.title}: marked "draft", so it is hidden from the live site`);
    if (isText(p.reviewNote)) items.push(`${p.title}: review note still attached ("${p.reviewNote}")`);
    if (!p.year) items.push(`${p.title}: year is missing`);
    if (!isText(p.client)) items.push(`${p.title}: client is missing`);
    if (!isText(p.role)) items.push(`${p.title}: role is missing`);
    if (!p.hasStory) items.push(`${p.title}: has a description but no four-part story yet`);
    else STORY_PARTS.forEach(([key, label]) => {
      if (!Array.isArray(p.story[key]) || !p.story[key].length) items.push(`${p.title}: story part "${label}" is empty`);
    });
  });
  site.hero.forEach((slide) => {
    const p = data.projects.find((x) => x.slug === slide.project);
    if (p && p.status === 'draft') items.push(`Home photographs: "${p.title}" is a draft, so its photograph is left out of the live home page`);
  });
  people.forEach((person) => {
    if (!isText(person.photo)) items.push(`${person.name}: photograph is missing`);
    if (!Array.isArray(person.bio) || !person.bio.length) items.push(`${person.name}: biography is missing`);
  });
  if (site.work && isText(site.work.introNote)) items.push(`Work: the introduction has a review note ("${site.work.introNote}")`);
  const pr = site.process || {};
  if (isText(pr.introNote)) items.push(`Process: the introduction has a review note ("${pr.introNote}")`);
  if (!pr.dialogue || !Array.isArray(pr.dialogue.text) || !pr.dialogue.text.length) items.push('Process: the Dialogue text is missing');
  if (pr.dialogue && isText(pr.dialogue.reviewNote)) items.push(`Process: Dialogue text has a review note ("${pr.dialogue.reviewNote}")`);
  if (isText(pr.stepsNote)) items.push(`Process: the steps have a review note ("${pr.stepsNote}")`);
  (pr.steps || []).forEach((step) => { if (!isText(step.text)) items.push(`Process: step "${step.title}" has no description`); });
  const services = pr.services || {};
  if (isText(services.reviewNote)) items.push(`Process: the services have a review note ("${services.reviewNote}")`);
  (services.items || []).forEach((service) => { if (!isText(service.text)) items.push(`Process: service "${service.name}" has no description`); });
  return [...new Set(items)];
}

if (checkOnly) {
  const items = openItems();
  console.log(`\n${data.projects.length} project${data.projects.length === 1 ? '' : 's'}, ${data.projects.filter((p) => p.status === 'published').length} published.`);
  if (!items.length) console.log('Nothing is unfinished.\n');
  else {
    console.log(`${items.length} unfinished item${items.length === 1 ? '' : 's'}:\n`);
    items.forEach((item) => console.log(`  - ${item}`));
    console.log('');
  }
  process.exit(0);
}

// ---------------------------------------------------------------- build

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(path.join(ROOT, 'static'), OUT);

visible.forEach((p) => {
  const to = path.join(OUT, 'work', p.slug, 'photos');
  fs.mkdirSync(to, { recursive: true });
  p.photos.concat(p.drawings).forEach((image) => image.variants.forEach((v) => {
    fs.copyFileSync(path.join(ROOT, 'content/projects', p.slug, 'photos', v.name), path.join(to, v.name));
  }));
});

const pages = [];
function write(pagePath, section, render) {
  const ctx = { site, people, projects: visible, showNotes, pagePath, section, u: makeUrl(pagePath, portable) };
  const html = layout(ctx, render(ctx));
  const file = pagePath.endsWith('/') ? path.join(OUT, pagePath, 'index.html') : path.join(OUT, pagePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  pages.push(pagePath);
}

write('/', '/', home);
write('/work/', '/work/', work);
visible.forEach((p, i) => write(p.url, '/work/', (ctx) => projectPage(ctx, p, visible[(i + 1) % visible.length])));
write('/people/', '/people/', studio);
write('/process/', '/process/', processPage);
write('/contact/', '/contact/', contact);
write('/contact/sent/', '/contact/', sent);
write('/404.html', '', notFound);

// Addresses from the old site keep working: each one forwards to its new page, or to Work.
const legacyFile = path.join(ROOT, 'content/legacy-urls.json');
const legacy = fs.existsSync(legacyFile) ? JSON.parse(fs.readFileSync(legacyFile, 'utf8')) : { pages: {}, projects: [] };
const redirects = [];
Object.entries(legacy.pages || {}).forEach(([from, to]) => redirects.push(`/${from}  ${to}  301`));
const mapped = new Map();
visible.forEach((p) => p.legacyUrls.forEach((old) => mapped.set(old, p.url)));
const oldProjectPages = new Set([...(legacy.projects || []), ...mapped.keys()]);
[...oldProjectPages].sort().forEach((old) => redirects.push(`/${old}  ${mapped.get(old) || '/work/'}  301`));
fs.writeFileSync(path.join(OUT, '_redirects'), redirects.join('\n') + '\n');

const base = site.url.replace(/\/$/, '');
const listed = pages.filter((p) => p.endsWith('/') && p !== '/contact/sent/');
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);

// Every link and image in the built pages must point at a file that exists.
function brokenLinks() {
  const broken = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); return; }
    if (!entry.name.endsWith('.html')) return;
    const html = fs.readFileSync(full, 'utf8');
    const targets = [];
    html.replace(/\s(?:href|src|action)="([^"]*)"/g, (m, target) => { targets.push(target); return m; });
    html.replace(/\ssrcset="([^"]*)"/g, (m, set) => { set.split(',').forEach((part) => targets.push(part.trim().split(/\s+/)[0])); return m; });
    targets.forEach((target) => {
      if (!target || /^(https?:|mailto:|tel:|data:|#)/.test(target)) return;
      const clean = target.split('#')[0].split('?')[0];
      if (!clean) return;
      let file = clean.startsWith('/') ? path.join(OUT, clean) : path.join(path.dirname(full), clean);
      if (clean.endsWith('/')) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) broken.push(`${path.relative(OUT, full)} points to ${target}, which does not exist`);
    });
  });
  walk(OUT);
  return broken;
}
const broken = brokenLinks();
if (broken.length) {
  console.error(`\nThe site was built, but ${broken.length} link${broken.length === 1 ? '' : 's'} or image${broken.length === 1 ? '' : 's'} lead nowhere:\n`);
  broken.forEach((b) => console.error(`  - ${b}`));
  console.error('');
  process.exit(1);
}

const drafts = data.projects.filter((p) => p.status === 'draft').length;
console.log(`Built ${pages.length} pages into ${path.relative(ROOT, OUT)}/ (${production ? 'live-site view' : 'preview view'}).`);
console.log(`${visible.length} project${visible.length === 1 ? '' : 's'} shown${production && drafts ? `, ${drafts} draft${drafts === 1 ? '' : 's'} hidden` : ''}.`);
if (!production) {
  const open = openItems().length;
  if (open) console.log(`${open} unfinished item${open === 1 ? '' : 's'}. Run "node build.js --check" to list them.`);
}
