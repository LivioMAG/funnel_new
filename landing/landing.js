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

function renderSection(s) {
  if (s.enabled === false) return '';
  if (s.type === 'logo') return `<section class="card logo"><img src="${html(s.src)}" alt="${html(s.alt || 'Logo')}" /></section>`;
  if (s.type === 'heading') return `<section class="card"><p class="kicker">${html(s.kicker || '')}</p><h1>${html(s.title || '')}</h1><p>${html(s.subtitle || '')}</p></section>`;
  if (s.type === 'text') return `<section class="card"><h2>${html(s.title || '')}</h2><p>${html(s.body || '')}</p></section>`;
  if (s.type === 'list') {
    const cols = s.columns === 2 ? 'cols-2' : '';
    const items = (s.items || []).map((i) => `<li>${html(i.title || i.value || i.text || '')}</li>`).join('');
    return `<section class="card"><h2>${html(s.title || '')}</h2><ul class="grid ${cols}">${items}</ul></section>`;
  }
  if (s.type === 'assets') {
    const items = (s.assets || []).map((a) => `<figure><img src="${html(a.src)}" alt="${html(a.alt || '')}" /><figcaption>${html(a.caption || '')}</figcaption></figure>`).join('');
    return `<section class="card"><h2>${html(s.title || '')}</h2><div class="grid cols-2">${items}</div></section>`;
  }
  if (s.type === 'slider') {
    const imgs = (s.assets || []).map((a, i) => `<img class="${i === 0 ? 'active' : ''}" src="${html(a.src)}" alt="${html(a.alt || '')}" />`).join('');
    return `<section class="card slider" data-autoplay="${Number(s.autoplayMs || 4000)}">${imgs}</section>`;
  }
  if (s.type === 'cta') return `<section><a class="btn ${s.buttonVariant === 'secondary' ? 'secondary' : ''}" href="${html(s.href || '../funnel/index.html')}">${html(s.buttonText || 'Weiter')}</a></section>`;
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
