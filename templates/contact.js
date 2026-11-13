'use strict';

const { esc } = require('../lib/html');
const { pageHead } = require('./parts');
const { telHref } = require('./layout');

// Contact: where the studio is, and one form that also screens new inquiries. Services are on the Process page.
module.exports = function contact(ctx) {
  const { site, u } = ctx;
  const c = site.contact;
  const types = Array.isArray(c.projectTypes) ? c.projectTypes : [];
  return {
    title: 'Contact',
    bodyClass: c.backdrop ? 'has-ground' : '',
    description: `Contact ${site.name} at ${site.address.join(', ')}, or send a project inquiry.`,
    body: `${pageHead(ctx, site.contact && site.contact.backdrop, `<div class="page-head">
  <h1>Contact</h1>
</div>`)}
<div class="contact-grid">
  <div class="contact-details">
    <address>
      <p>${site.address.map(esc).join('<br>')}</p>
      <p><a href="${telHref(site.phone)}">${esc(site.phone)}</a></p>
      ${site.emails.map((e) => `<p>${esc(e.label)}<br><a href="mailto:${esc(e.address)}">${esc(e.address)}</a></p>`).join('\n      ')}
    </address>
    <p class="contact-pointer">Before writing, it may help to read <a class="text-link" href="${u('/process/')}">how a project proceeds</a>.</p>
  </div>
  <form class="inquiry" name="inquiry" method="POST" action="${u('/contact/sent/')}" data-netlify="true" netlify-honeypot="website">
    <h2>Tell us about your project</h2>
    <p class="trap"><label>Leave this field empty <input name="website" tabindex="-1" autocomplete="off"></label></p>
    <p><label for="f-name">Name</label><input id="f-name" name="name" type="text" autocomplete="name" required></p>
    <p><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></p>
    <p><label for="f-org">Organization <span class="optional">optional</span></label><input id="f-org" name="organization" type="text" autocomplete="organization"></p>
    <p><label for="f-type">Kind of project</label>
      <select id="f-type" name="project-type" required>
        <option value="">Choose one</option>
        ${types.map((t) => `<option>${esc(t)}</option>`).join('\n        ')}
      </select></p>
    <p><label for="f-place">Where is it?</label><input id="f-place" name="location" type="text" required></p>
    <p><label for="f-need">What do you need?</label><textarea id="f-need" name="scope" rows="5" required></textarea></p>
    <p><label for="f-when">When do you hope to start? <span class="optional">optional</span></label><input id="f-when" name="timeline" type="text"></p>
    <p><label for="f-budget">Approximate budget, if known <span class="optional">optional</span></label><input id="f-budget" name="budget" type="text"></p>
    <p><button type="submit">Send inquiry</button></p>
  </form>
</div>`,
  };
};
