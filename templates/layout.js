'use strict';

const { esc } = require('../lib/html');

const NAV = [
  ['Work', '/work/'],
  ['Studio', '/studio/'],
  ['Contact', '/contact/'],
];

function telHref(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return 'tel:+1' + digits;
}

// The frame around every page: head, header with the three links, footer.
module.exports = function layout(ctx, page) {
  const { site, u } = ctx;
  const title = page.title ? `${page.title} | ${site.name}` : site.name;
  const description = page.description || site.description;
  const base = site.url.replace(/\/$/, '');
  const nav = NAV.map(([label, href]) => {
    const current = ctx.section === href ? ' aria-current="page"' : '';
    return `<a href="${u(href)}"${current}>${label}</a>`;
  }).join('\n      ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(base + ctx.pagePath)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${page.image ? `<meta property="og:image" content="${esc(base + page.image)}">\n` : ''}<link rel="icon" href="${u('/favicon.ico')}" sizes="any">
<link rel="stylesheet" href="${u('/assets/css/site.css')}">
</head>
<body${page.bodyClass ? ` class="${esc(page.bodyClass)}"` : ''}>
<a class="skip-link" href="#main">Skip to content</a>
${ctx.showNotes ? '<p class="preview-bar">Preview build. Yellow notes mark text and photographs still to come. They never appear on the live site.</p>\n' : ''}<header class="site-header">
  <a class="logo" href="${u('/')}"><img src="${u('/assets/img/logo.jpg')}" width="230" height="39" alt="${esc(site.name)}"></a>
  <nav class="site-nav" aria-label="Main">
      ${nav}
  </nav>
</header>
<main id="main">
${page.body}
</main>
<footer class="site-footer">
  <p class="footer-name">${esc(site.name)}</p>
  <p>${site.address.map(esc).join('<br>')}</p>
  <p><a href="${telHref(site.phone)}">${esc(site.phone)}</a></p>
</footer>
<script src="${u('/assets/js/site.js')}" defer></script>
</body>
</html>
`;
};

module.exports.telHref = telHref;
