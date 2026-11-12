'use strict';

const { esc, paragraphs, toCome, reviewNote } = require('../lib/html');
const { sectionLabel } = require('./parts');

// The Client, Site, Design team diagram: three points, with an arrow in each direction along every side.
const DIALOGUE_SVG = `<svg class="dialogue-drawing" viewBox="0 0 400 350" role="img" aria-labelledby="dialogue-title">
      <title id="dialogue-title">A triangle joining the client, the site and the design team, with arrows in both directions along each side</title>
      <defs>
        <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path class="dg-head" d="M1 1.5 L9 5 L1 8.5"/>
        </marker>
      </defs>
      <path class="dg-line" d="M186 82 L98 248" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <path class="dg-line" d="M214 82 L302 248" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <path class="dg-line" d="M118 270 L282 270" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <circle class="dg-node" cx="200" cy="62" r="6"/>
      <circle class="dg-node" cx="86" cy="270" r="6"/>
      <circle class="dg-node" cx="314" cy="270" r="6"/>
      <text class="dg-label" x="200" y="36" text-anchor="middle">Client</text>
      <text class="dg-label" x="86" y="306" text-anchor="middle">Site</text>
      <text class="dg-label" x="314" y="306" text-anchor="middle">Design team</text>
      <text class="dg-center" x="200" y="212" text-anchor="middle">Dialogue</text>
    </svg>`;

// Process: what is distinctive about the firm, the Dialogue diagram, the steps of a commission,
// and the ways to engage the firm.
module.exports = function process(ctx) {
  const { site } = ctx;
  const p = site.process || {};
  const dialogue = p.dialogue || {};
  const steps = Array.isArray(p.steps) ? p.steps : [];
  const services = p.services || {};
  const items = Array.isArray(services.items) ? services.items : [];
  const paras = Array.isArray(p.intro) ? p.intro : [];

  // The first paragraph is the lead, set large beside the heading; the rest follow in the text column.
  const lead = `<div class="page-lead">
    ${reviewNote(ctx, p.introNote)}
    <p>${paras.length ? esc(paras[0]) : toCome(ctx, 'what is distinctive about the firm, in its own words')}</p>
  </div>`;
  const intro = paras.length > 1 ? `<section class="process-intro">
  ${paragraphs(paras.slice(1))}
</section>` : '';

  const dialogueBlock = `<section class="approach">
  ${sectionLabel('Client, site, design team')}
  <div class="dialogue">
    ${DIALOGUE_SVG}
    <div class="dialogue-text">
      ${reviewNote(ctx, dialogue.reviewNote)}
      ${Array.isArray(dialogue.text) && dialogue.text.length ? paragraphs(dialogue.text) : `<p>${toCome(ctx, 'the Client, Site, Design team dialogue in the firm\'s words')}</p>`}
    </div>
  </div>
</section>` ;

  const stepsBlock = steps.length ? `<section class="approach">
  ${sectionLabel('How a project proceeds')}
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
  ${sectionLabel('Ways to engage the firm')}
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
    description: `How ${site.name} works: a practice of three that knows its place, the dialogue among client, site and design team, the steps of a project, and the ways to engage the firm.`,
    body: `<div class="page-head has-lead">
  <h1>Process</h1>
  ${lead}
</div>
${intro}
${dialogueBlock}
${stepsBlock}
${servicesBlock}`,
  };
};
