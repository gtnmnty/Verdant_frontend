const fs = require('fs');
const path = require('path');

const appDir = 'c:/Users/Zhimo/Documents/Projects/Software/Java/Verdant/frontend/app';

const pages = [
  'page.tsx',
  'about/page.tsx',
  'account/page.tsx',
  'appointments/page.tsx',
  'auth/page.tsx',
  'book/page.tsx',
  'cart/page.tsx',
  'change-password/page.tsx',
  'checkout/page.tsx',
  'collections/page.tsx',
  'help-support/page.tsx',
  'journal/page.tsx',
  'notifications/page.tsx',
  'orders/page.tsx',
  'services/page.tsx'
];

pages.forEach(p => {
  const file = path.join(appDir, p);
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Let's ensure responsive padding down to <150px
  // 12px at small width, up to 10vw, clamped.
  const paddingClass = "w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]";

  if (p === 'page.tsx') {
    content = content.replace(
      'className="w-full px-[10vw]',
      `className="${paddingClass}`
    );
  } else if (p === 'about/page.tsx') {
    content = content.replace(
      '<>\r\n',
      `<div className="${paddingClass}">\r\n`
    ).replace(
      '<>\n',
      `<div className="${paddingClass}">\n`
    ).replace(
      '</>\r\n',
      '</div>\r\n'
    ).replace(
      '</>\n',
      '</div>\n'
    );
  } else if (p === 'auth/page.tsx') {
      content = content.replace(
        '<AuthShell>',
        `<div className="${paddingClass}"><AuthShell>`
      ).replace(
        '</AuthShell>',
        '</AuthShell></div>'
      );
  } else if (p === 'book/page.tsx') {
      content = content.replace(
        'className="pb-16"',
        `className="pb-16 ${paddingClass}"`
      );
  } else if (p === 'collections/page.tsx' || p === 'services/page.tsx') {
      content = content.replace(
        'className="pb-20"',
        `className="pb-20 ${paddingClass}"`
      );
  } else if (p === 'help-support/page.tsx') {
      content = content.replace(
        'className="pb-[clamp(2rem,5vw,4rem)]"',
        `className="pb-[clamp(2rem,5vw,4rem)] ${paddingClass}"`
      );
  } else {
      content = content.replace(
        /return <([A-Za-z]+)\s*\/>;/,
        `return <div className="${paddingClass}"><$1/></div>;`
      );
  }

  fs.writeFileSync(file, content);
});
console.log("Done");
