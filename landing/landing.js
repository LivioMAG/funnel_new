const app = document.getElementById('app');
const load = (p) => fetch(p, { cache: 'no-store' }).then((r) => r.json());

const applyTheme = (cfg) => {
  const t = cfg.theme || {};
  const ty = cfg.typography || {};
  const map = {
    '--primary': t.primaryColor,
    '--text': t.textColor,
    '--bg': t.backgroundColor,
    '--card': t.cardBackgroundColor,
    '--muted': t.mutedTextColor,
    '--border': t.borderColor,
    '--btnText': t.primaryButtonTextColor,
    '--font': ty.fontFamily,
    '--base': ty.baseSize,
    '--h1': ty.h1Size,
    '--h2': ty.h2Size
  };
  Object.entries(map).forEach(([k, v]) => v && document.documentElement.style.setProperty(k, v));
};

const html = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

const alignClass = (align) => ({ left: 'align-left', center: 'align-center', right: 'align-right' }[align] || '');

function renderListItem(i) {
  const icon = i.icon ? `<span class="item-icon">${html(i.icon)}</span>` : '';
  const title = i.title || i.value || i.text || '';
  const desc = i.title && i.text ? `<span>${html(i.text)}</span>` : '';
  return `<li class="list-item">${icon}<span class="item-title">${html(title)}</span>${desc}</li>`;
}

function renderSection(s) {
  if (s.enabled === false) return '';
  if (s.type === 'logo') return `<section class="card logo ${alignClass(s.align)}"><img src="${html(s.src)}" alt="${html(s.alt || 'Logo')}" /></section>`;
  if (s.type === 'heading') return `<section class="card ${alignClass(s.align)}"><p class="kicker">${html(s.kicker || '')}</p><h1>${html(s.title || '')}</h1><p>${html(s.subtitle || '')}</p></section>`;
  if (s.type === 'text') return `<section class="card ${alignClass(s.align)}"><h2>${html(s.title || '')}</h2><p>${html(s.body || '')}</p></section>`;
  if (s.type === 'list') {
    const cols = s.columns === 2 ? 'cols-2' : '';
    const sectionAlign = alignClass(s.align);
    const itemAlign = alignClass(s.itemAlign || s.align);
    const items = (s.items || []).map(renderListItem).join('');
    return `<section class="card ${sectionAlign}"><h2>${html(s.title || '')}</h2><ul class="grid list-reset ${cols} ${itemAlign}">${items}</ul></section>`;
  }
  if (s.type === 'assets') {
    const items = (s.assets || []).map((a) => `<figure><img src="${html(a.src)}" alt="${html(a.alt || '')}" /><figcaption>${html(a.caption || '')}</figcaption></figure>`).join('');
    return `<section class="card ${alignClass(s.align)}"><h2>${html(s.title || '')}</h2><div class="grid cols-2">${items}</div></section>`;
  }
  if (s.type === 'slider') {
    const imgs = (s.assets || []).map((a, i) => `<img class="${i === 0 ? 'active' : ''}" src="${html(a.src)}" alt="${html(a.alt || '')}" />`).join('');
    return `<section class="card slider ${alignClass(s.align)}" data-autoplay="${Number(s.autoplayMs || 4000)}">${imgs}</section>`;
  }
  if (s.type === 'cta') return `<section class="${alignClass(s.align)}"><a class="btn ${s.buttonVariant === 'secondary' ? 'secondary' : ''}" href="${html(s.href || '../funnel/index.html')}">${html(s.buttonText || 'Weiter')}</a></section>`;
  return '';
}

(async () => {
  const [config, data] = await Promise.all([load('../config.json'), load('./landing.json')]);
  applyTheme(config);
  app.innerHTML = (data.sections || []).map(renderSection).join('');
  document.querySelectorAll('.slider').forEach((slider) => {
    const imgs = [...slider.querySelectorAll('img')];
    if (imgs.length < 2) return;
    let i = 0;
    setInterval(() => {
      imgs[i].classList.remove('active');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('active');
    }, Number(slider.dataset.autoplay));
  });
})();
