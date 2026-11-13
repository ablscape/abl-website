'use strict';

const { esc, markSvg } = require('../lib/html');

const NAV = [
  ['Work', '/work/'],
  ['People', '/people/'],
  ['Process', '/process/'],
  ['Contact', '/contact/'],
];

function telHref(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return 'tel:+1' + digits;
}

// The frame around every page: head, the header with the links at the left and the logo at the right,
// the "abl" mark that travels with the page once the header has scrolled away, and the footer.
module.exports = function layout(ctx, page) {
  const { site, u } = ctx;
  const title = page.title ? `${page.title} | ${site.name}` : site.name;
  const description = page.description || site.description;
  const base = site.url.replace(/\/$/, '');
  const links = (withCurrent) => NAV.map(([label, href]) => {
    const current = withCurrent && ctx.section === href ? ' aria-current="page"' : '';
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
<script>
document.documentElement.className = 'js';
// A page reached by a link opens at its top, wherever the last page was left, and whatever the browser or the
// window showing the site does with the old position. Going back or forward keeps the browser's own place, and
// so does a link to a named place on a page.
(function () {
  var byLink = false;
  try { byLink = window.sessionStorage.getItem('abl-by-link') === '1'; window.sessionStorage.removeItem('abl-by-link'); } catch (e) { /* storage is optional */ }
  document.addEventListener('click', function (event) {
    var a = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!a || a.target === '_blank' || a.origin !== window.location.origin) return;
    if (a.pathname === window.location.pathname && a.hash) return;
    try { window.sessionStorage.setItem('abl-by-link', '1'); } catch (e) { /* storage is optional */ }
  }, true);
  var entry = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
  if (!byLink && entry && entry.type === 'back_forward') return;
  var touched = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
    window.addEventListener(type, function () { touched = true; }, { capture: true, passive: true });
  });
  var toTop = function () {
    if (touched) return;
    var name = '';
    try { name = decodeURIComponent((window.location.hash || '').slice(1)); } catch (e) { /* not a name */ }
    if (name && document.getElementById(name)) return;
    if (window.pageYOffset > 0) window.scrollTo(0, 0);
  };
  toTop();
  document.addEventListener('DOMContentLoaded', toTop);
  window.addEventListener('load', function () { toTop(); window.setTimeout(toTop, 350); window.setTimeout(toTop, 1200); });
  window.addEventListener('pageshow', function (event) { if (!event.persisted) toTop(); });
})();
</script>
</head>
<body${page.bodyClass ? ` class="${esc(page.bodyClass)}"` : ''}>
<a class="skip-link" href="#main">Skip to content</a>
${ctx.showNotes ? '<p class="preview-bar">Preview build. Gray notes mark text and photographs still to come. They never appear on the live site. <button class="notes-toggle" type="button" data-notes-toggle hidden>Hide notes</button></p>\n' : ''}<header class="site-header">
  <nav class="site-nav" aria-label="Main">
      ${links(true)}
  </nav>
  <a class="logo" href="${u('/')}"><img src="${u('/assets/img/logo.svg')}" width="232" height="40" alt="${esc(site.name)}"></a>
</header>
<a class="travel-mark" href="${u('/')}" aria-label="${esc(site.name)}, home" data-travel-mark>${markSvg()}</a>
<main id="main">
${page.body}
</main>
<footer class="site-footer">
  <a class="footer-mark" href="${u('/')}" aria-label="${esc(site.name)}, home">${markSvg()}</a>
  <div class="footer-cols">
    <p><span class="footer-name">${esc(site.name)}</span><br>${site.address.map(esc).join('<br>')}</p>
    <p><a href="${telHref(site.phone)}">${esc(site.phone)}</a>${site.emails.map((e) => `<br><a href="mailto:${esc(e.address)}">${esc(e.address)}</a>`).join('')}</p>
    <nav class="footer-nav" aria-label="Footer">
      ${links(false)}
    </nav>
  </div>
</footer>
<script src="${u('/assets/js/site.js')}" defer></script>
</body>
</html>
`;
};

module.exports.telHref = telHref;
