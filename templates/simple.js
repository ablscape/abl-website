'use strict';

// Two small pages: the confirmation after the form is sent, and "page not found".

function sent(ctx) {
  return {
    title: 'Inquiry sent',
    body: `<div class="page-head">
  <h1>Inquiry sent</h1>
</div>
<section class="plain">
  <p>Thank you. Your inquiry has reached the studio.</p>
  <p><a href="${ctx.u('/work/')}">See the work</a></p>
</section>`,
  };
}

function notFound(ctx) {
  return {
    title: 'Page not found',
    body: `<div class="page-head">
  <h1>Page not found</h1>
</div>
<section class="plain">
  <p>That address does not match a page on this site. The project you want may have moved.</p>
  <p><a href="${ctx.u('/work/')}">See all work</a></p>
</section>`,
  };
}

module.exports = { sent, notFound };
