'use strict';

// Loads everything in content/ and checks it. Problems are collected as plain-language
// messages so the person (or Claude) editing the site can see exactly what to fix.

const fs = require('fs');
const path = require('path');
const { jpegSize, variants } = require('./images');

const TYPES = ['Campus', 'Civic', 'Preservation', 'Residential'];
const STORY_PARTS = [
  ['problem', 'The problem'],
  ['research', 'Research'],
  ['response', 'Response'],
  ['result', 'Result'],
];

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isTextList = (v) => Array.isArray(v) && v.every(isText);

function readJson(root, relPath, errors) {
  const file = path.join(root, relPath);
  if (!fs.existsSync(file)) {
    errors.push(`${relPath}: file is missing`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`${relPath}: not valid JSON (${e.message})`);
    return null;
  }
}

function loadProject(root, slug, errors, warnings) {
  const relDir = `content/projects/${slug}`;
  const where = `${relDir}/project.json`;
  const need = (ok, message) => { if (!ok) errors.push(`${where}: ${message}`); };

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`${relDir}: folder name must be lowercase words joined by hyphens, like "courthouse-square"`);
  }
  const p = readJson(root, where, errors);
  if (!p) return null;

  p.slug = slug;
  p.url = `/work/${slug}/`;

  need(isText(p.title), '"title" is required');
  need(isText(p.location), '"location" is required, for example "Lexington, Virginia"');
  need(TYPES.includes(p.type), `"type" must be one of: ${TYPES.join(', ')}`);
  need(['draft', 'published'].includes(p.status), '"status" must be "draft" or "published"');
  need(isText(p.summary), '"summary" is required: one sentence describing the project');
  if (isText(p.summary) && p.summary.length > 220) {
    errors.push(`${where}: "summary" is ${p.summary.length} characters; keep it under 220`);
  }

  const published = p.status === 'published';
  p.year = p.year == null ? '' : String(p.year).trim();
  if (p.year) need(/^\d{4}$/.test(p.year), '"year" must be four digits, for example "2026"');
  if (published) {
    need(/^\d{4}$/.test(p.year), '"year" is required before a project is published');
    need(!isText(p.reviewNote), 'remove "reviewNote" before publishing: it marks text that still needs the firm\'s review');
  }

  p.story = p.story && typeof p.story === 'object' ? p.story : {};
  for (const [key] of STORY_PARTS) {
    if (p.story[key] != null) need(isTextList(p.story[key]), `"story.${key}" must be a list of paragraphs`);
  }
  if (p.description != null) need(isTextList(p.description), '"description" must be a list of paragraphs');
  p.hasStory = STORY_PARTS.some(([key]) => Array.isArray(p.story[key]) && p.story[key].length > 0);
  need(p.hasStory || (Array.isArray(p.description) && p.description.length > 0),
    'add a "story" (problem, research, response, result) or a "description"');

  p.collaborators = Array.isArray(p.collaborators) ? p.collaborators.filter(isText) : [];
  p.legacyUrls = Array.isArray(p.legacyUrls) ? p.legacyUrls.filter(isText) : [];
  p.featured = p.featured === true;
  p.order = Number.isFinite(p.order) ? p.order : 999;

  // Photos, and drawings (plans and sketches) that sit in the same folder and are prepared the same way.
  p.photos = Array.isArray(p.photos) ? p.photos : [];
  p.drawings = Array.isArray(p.drawings) ? p.drawings : [];
  need(p.photos.length > 0, 'at least one photo is required');
  const photosDir = path.join(root, relDir, 'photos');
  const hasDir = fs.existsSync(photosDir);
  const used = new Set();
  const checkImages = (list, kind) => {
    for (const image of list) {
      if (!isText(image.file)) {
        errors.push(`${where}: every ${kind} needs a "file", for example "01"`);
        continue;
      }
      need(isText(image.alt), `${kind} ${image.file}: "alt" is required. Describe what the ${kind === 'photo' ? 'photograph' : 'drawing'} shows.`);
      if (isText(image.alt) && image.alt.length > 200) {
        errors.push(`${where}: ${kind} ${image.file}: "alt" is ${image.alt.length} characters; keep it under 200`);
      }
      const found = hasDir ? variants(photosDir, image.file) : [];
      if (!found.length) {
        errors.push(`${where}: ${kind} ${image.file}: no files named like photos/${image.file}-1280.jpg were found`);
        continue;
      }
      try {
        const size = jpegSize(path.join(photosDir, found[found.length - 1].name));
        image.width = size.width;
        image.height = size.height;
      } catch (e) {
        errors.push(`${where}: ${kind} ${image.file}: ${e.message}`);
        continue;
      }
      image.variants = found;
      found.forEach((v) => used.add(v.name));
      if (found[found.length - 1].width < 1280) {
        warnings.push(`${where}: ${kind} ${image.file} is only ${found[found.length - 1].width} pixels wide; 2560 is the target`);
      }
    }
  };
  checkImages(p.photos, 'photo');
  checkImages(p.drawings, 'drawing');
  if (hasDir) {
    for (const name of fs.readdirSync(photosDir)) {
      if (name.endsWith('.jpg') && !used.has(name)) {
        warnings.push(`${relDir}/photos/${name}: not listed in project.json, so it will not appear`);
      }
    }
  }
  p.photos = p.photos.filter((photo) => photo.variants);
  p.drawings = p.drawings.filter((d) => d.variants);
  p.cover = isText(p.cover) ? p.cover : (p.photos[0] && p.photos[0].file);
  p.coverPhoto = p.photos.find((photo) => photo.file === p.cover) || null;
  if (p.photos.length) need(!!p.coverPhoto, `"cover" is "${p.cover}", which is not one of the photos`);

  return p;
}

function load(root) {
  const errors = [];
  const warnings = [];

  const site = readJson(root, 'content/site.json', errors) || {};
  const people = readJson(root, 'content/people.json', errors) || [];

  for (const key of ['name', 'url', 'description', 'statement', 'phone']) {
    if (!isText(site[key])) errors.push(`content/site.json: "${key}" is required`);
  }
  if (!Array.isArray(site.address) || !site.address.length) errors.push('content/site.json: "address" must be a list of lines');
  site.emails = Array.isArray(site.emails) ? site.emails : [];
  site.hero = Array.isArray(site.hero) ? site.hero : [];
  site.studio = site.studio || {};
  site.contact = site.contact || {};

  if (!Array.isArray(people)) errors.push('content/people.json: must be a list of people');
  (Array.isArray(people) ? people : []).forEach((person, i) => {
    if (!isText(person.name)) errors.push(`content/people.json: person ${i + 1} needs a "name"`);
    if (person.bio != null && !isTextList(person.bio)) errors.push(`content/people.json: ${person.name || 'person ' + (i + 1)}: "bio" must be a list of paragraphs`);
    if (isText(person.photo) && !fs.existsSync(path.join(root, 'static/assets/img/people', person.photo))) {
      errors.push(`content/people.json: ${person.name}: photo static/assets/img/people/${person.photo} was not found`);
    }
  });

  const projectsDir = path.join(root, 'content/projects');
  const slugs = fs.existsSync(projectsDir)
    ? fs.readdirSync(projectsDir).filter((name) => fs.statSync(path.join(projectsDir, name)).isDirectory()).sort()
    : [];
  const projects = slugs.map((slug) => loadProject(root, slug, errors, warnings)).filter(Boolean);
  projects.sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title));

  if (site.backdrop && site.backdrop.project) {
    const project = projects.find((p) => p.slug === site.backdrop.project);
    if (!project) errors.push(`content/site.json: backdrop names project "${site.backdrop.project}", which does not exist`);
    else if (!project.drawings.find((d) => d.file === site.backdrop.file)) errors.push(`content/site.json: backdrop names drawing "${site.backdrop.file}", which is not in ${project.slug}`);
  }
  site.hero.forEach((slide, i) => {
    const project = projects.find((p) => p.slug === slide.project);
    if (!project) {
      errors.push(`content/site.json: hero ${i + 1} names project "${slide.project}", which does not exist`);
      return;
    }
    const photo = project.photos.find((ph) => ph.file === slide.photo);
    if (!photo) errors.push(`content/site.json: hero ${i + 1} names photo "${slide.photo}", which is not in ${project.slug}`);
  });

  return { site, people: Array.isArray(people) ? people : [], projects, errors, warnings };
}

module.exports = { load, TYPES, STORY_PARTS, isText };
