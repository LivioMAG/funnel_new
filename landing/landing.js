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
  return `<li class="list-item">${icon}<span class="item-content"><span class="item-title">${html(title)}</span>${desc}</span></li>`;
}

function renderSection(s) {
  if (s.enabled === false) return '';
  if (s.type === 'logo') return `<section class="card logo ${alignClass(s.align)}"><img src="${html(s.src)}" alt="${html(s.alt || 'Logo')}" /></section>`;
  if (s.type === 'heading') return `<section class="card ${alignClass(s.align)}"><p class="kicker">${html(s.kicker || '')}</p><h1>${html(s.title || '')}</h1><p>${html(s.subtitle || '')}</p></section>`;
  if (s.type === 'text') {
    const textAlign = alignClass(s.align || 'left');
    return `<section class="card ${textAlign}"><h2>${html(s.title || '')}</h2><p>${html(s.body || '')}</p></section>`;
  }
  if (s.type === 'list') {
    const cols = s.columns === 2 ? 'cols-2' : '';
    const sectionAlign = alignClass(s.align);
    const itemAlign = alignClass(s.itemAlign || s.align);
    const weightClass = s.id === 'job-facts' ? 'normal-weight' : '';
    const items = (s.items || []).map(renderListItem).join('');
    return `<section class="card ${sectionAlign} ${weightClass}"><h2>${html(s.title || '')}</h2><ul class="grid list-reset ${cols} ${itemAlign}">${items}</ul></section>`;
  }
  if (s.type === 'assets') {
    const items = (s.assets || []).map((a) => `<figure><img src="${html(a.src)}" alt="${html(a.alt || '')}" /><figcaption>${html(a.caption || '')}</figcaption></figure>`).join('');
    return `<section class="card ${alignClass(s.align)}"><h2>${html(s.title || '')}</h2><div class="grid cols-2">${items}</div></section>`;
  }
  if (s.type === 'slider') {
    const imgs = (s.assets || []).map((a, i) => `<img class="slider-image ${i === 0 ? 'active' : ''}" src="${html(a.src)}" alt="${html(a.alt || '')}" data-index="${i}" />`).join('');
    const dots = (s.assets || []).map((_, i) => `<button type="button" class="slider-dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Bild ${i + 1} anzeigen"></button>`).join('');
    return `<section class="card slider ${alignClass(s.align)}" data-autoplay="${Number(s.autoplayMs || 4000)}"><div class="slider-stage">${imgs}</div><div class="slider-dots" role="tablist" aria-label="Slider Navigation">${dots}</div></section>`;
  }
  if (s.type === 'cta') {
    const isSecondary = s.buttonVariant === 'secondary';
    const classes = ['btn'];
    if (isSecondary) classes.push('secondary');
    if (!isSecondary) classes.push('full-width', 'animated-border');
    if (s.animate !== false) classes.push('animated-shimmer');
    const label = html(s.buttonText || 'Weiter');
    const content = isSecondary
      ? label
      : `<span class="btn-core"><span class="btn-label">${label}</span><span class="btn-boost" aria-hidden="true">➜</span></span><span class="btn-spark spark-1" aria-hidden="true">✦</span><span class="btn-spark spark-2" aria-hidden="true">✦</span><span class="btn-spark spark-3" aria-hidden="true">✦</span>`;
    return `<section class="cta-row ${alignClass(s.align)}"><a class="${classes.join(' ')}" href="${html(s.href || '../funnel/index.html')}">${content}</a></section>`;
  }
  return '';
}

(async () => {
  const [config, data] = await Promise.all([load('../config.json'), load('./landing.json')]);
  applyTheme(config);
  app.innerHTML = (data.sections || []).map(renderSection).join('');
  document.querySelectorAll('.slider').forEach((slider) => {
    const imgs = [...slider.querySelectorAll('.slider-image')];
    const dots = [...slider.querySelectorAll('.slider-dot')];
    if (imgs.length < 2) return;
    let i = 0;
    let isAnimating = false;
    const dotsEl = slider.querySelector('.slider-dots');
    const animClasses = ['enter-from-left', 'enter-from-right', 'exit-to-left', 'exit-to-right'];
    dotsEl?.style.setProperty('--dot-count', String(dots.length));

    const show = (nextIndex, forcedDirection = 0) => {
      if (isAnimating) return;
      const target = (nextIndex + imgs.length) % imgs.length;
      if (target === i) return;

      const current = imgs[i];
      const next = imgs[target];
      const direction = forcedDirection || (target > i ? 1 : -1);
      isAnimating = true;

      current.classList.remove(...animClasses);
      next.classList.remove(...animClasses, 'active');
      next.classList.add(direction > 0 ? 'enter-from-left' : 'enter-from-right');
      next.getBoundingClientRect();

      current.classList.add(direction > 0 ? 'exit-to-right' : 'exit-to-left');
      next.classList.add('active');
      next.classList.remove('enter-from-left', 'enter-from-right');

      dots[i]?.classList.remove('active');
      dots[target]?.classList.add('active');
      dotsEl?.style.setProperty('--active-index', String(target));

      const finish = () => {
        current.classList.remove('active', ...animClasses);
        next.classList.remove(...animClasses);
        i = target;
        isAnimating = false;
      };

      next.addEventListener('transitionend', finish, { once: true });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number(dot.dataset.slide);
        const direction = target > i ? 1 : -1;
        show(target, direction);
      });
    });

    const autoplayMs = Number(slider.dataset.autoplay);
    if (Number.isFinite(autoplayMs) && autoplayMs > 0) {
      setInterval(() => show(i + 1, 1), autoplayMs);
    }
  });
})();
