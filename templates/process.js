'use strict';

const { esc, paragraphs, toCome, reviewNote } = require('../lib/html');

// The Client, Site, Design team diagram, drawn in thin lines.
const DIALOGUE_SVG = `<svg class="dialogue-drawing" viewBox="0 0 360 320" role="img" aria-labelledby="dialogue-title">
      <title id="dialogue-title">A triangle joining the client, the site and the design team</title>
      <path class="dg-line" d="M180 84 L84 244 L276 244 Z"/>
      <circle class="dg-node" cx="180" cy="84" r="5"/>
      <circle class="dg-node" cx="84" cy="244" r="5"/>
      <circle class="dg-node" cx="276" cy="244" r="5"/>
      <text class="dg-label" x="180" y="66" text-anchor="middle">Client</text>
      <text class="dg-label" x="84" y="270" text-anchor="middle">Site</text>
      <text class="dg-label" x="276" y="270" text-anchor="middle">Design team</text>
      <text class="dg-center" x="180" y="200" text-anchor="middle">Dialogue</text>
    </svg>`;

// Process: what is distinctive about the firm, the Dialogue diagram, the steps of a job, and the ways to work with ABL.
module.exports = function process(ctx) {
  const { site } = ctx;
  const p = site.process || {};
  const dialogue = p.dialogue || {};
  const steps = Array.isArray(p.steps) ? p.steps : [];
  const services = p.services || {};
  const items = Array.isArray(services.items) ? services.items : [];

  const intro = `<section class="process-intro">
  ${reviewNote(ctx, p.introNote)}
  ${Array.isArray(p.intro) && p.intro.length ? paragraphs(p.intro) : `<p>${toCome(ctx, 'what is distinctive about the firm, in its own words')}</p>`}
</section>`;

  const dialogueBlock = `<section class="approach">
  <h2>Client, site, design team</h2>
  <div class="dialogue">
    ${DIALOGUE_SVG}
    <div class="dialogue-text">
      ${reviewNote(ctx, dialogue.reviewNote)}
      ${Array.isArray(dialogue.text) && dialogue.text.length ? paragraphs(dialogue.text) : `<p>${toCome(ctx, 'the Client, Site, Design team dialogue in the firm\'s words')}</p>`}
    </div>
  </div>
</section>`;

  const stepsBlock = steps.length ? `<section class="approach">
  <h2>How a project goes</h2>
  ${reviewNote(ctx, p.stepsNote)}
  ${p.stepsIntro ? `<p class="steps-intro">${esc(p.stepsIntro)}</p>` : ''}
  <ol class="process">
    ${steps.map((step) => `<li>
      <h3>${esc(step.title)}</h3>
      <p>${step.text ? esc(step.text) : toCome(ctx, 'what happens at this step')}</p>
    </li>`).join('\n    ')}
  </ol>
</section>` : '';

  const servicesBlock = items.length ? `<section class="approach services">
  <h2>Ways to work with us</h2>
  ${reviewNote(ctx, services.reviewNote)}
  ${services.intro ? `<p class="services-intro">${esc(services.intro)}</p>` : ''}
  <dl>
    ${items.map((s) => `<div>
      <dt>${esc(s.name)}</dt>
      <dd>${s.text ? esc(s.text) : toCome(ctx, 'what this service includes')}</dd>
    </div>`).join('\n    ')}
  </dl>
</section>` : '';

  return {
    title: 'Process',
    description: `How ${site.name} works: a small firm that knows its place, the dialogue among client, site and design team, the steps of a project, and the ways to work with the studio.`,
    body: `<div class="page-head">
  <h1>Process</h1>
</div>
${intro}
${dialogueBlock}
${stepsBlock}
${servicesBlock}`,
  };
};
