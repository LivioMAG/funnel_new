const FALLBACK_CONFIG = {
  theme: {
    primaryColor: '#2F6FED',
    primaryButtonTextColor: '#FFFFFF',
    secondaryColor: '#111827',
    backgroundColor: '#F7F8FA',
    cardBackgroundColor: '#FFFFFF',
    successColor: '#16A34A',
    dangerColor: '#DC2626',
    textColor: '#0F172A',
    mutedTextColor: '#475569',
    borderColor: '#DBE2EA'
  },
  landing: {
    companyName: 'Musterfirma AG',
    jobTitle: 'Sales Development Representative (m/w/d)',
    shortPitch:
      'Du liebst ehrliche Gespräche und willst sichtbar etwas bewegen? Bei uns baust du echte Kundenbeziehungen auf statt nur Leads abzuhaken. Du arbeitest mit klaren Zielen, smarten Tools und einem Team, das dich stärkt. Wenn du Wirkung statt Stillstand suchst, passt das hier.',
    aboutTitle: 'Über uns',
    aboutText:
      'Wir sind ein wachsendes B2B-Team mit Fokus auf nachhaltiges Wachstum. Bei uns zählen klare Kommunikation, schnelle Entscheidungen und Verantwortung ab Tag eins.',
    expectationsTitle: 'Was wir von dir erwarten',
    expectationsBullets: [
      'Du gehst aktiv auf Menschen zu und hörst genauso gut zu, wie du argumentierst.',
      'Du denkst in Lösungen, nicht in Ausreden, und bleibst freundlich verbindlich.',
      'Du willst lernen, Feedback nutzen und jeden Monat spürbar besser werden.'
    ],
    benefitsTitle: 'Was du bekommst',
    benefitsBullets: [
      'Onboarding mit klarer Struktur und persönlichem Sparring.',
      'Flexibles Arbeitsmodell mit modernem Setup.',
      'Faire Vergütung plus Entwicklungspfad in Richtung Account Executive.'
    ],
    primaryCtaText: 'Jetzt bewerben',
    secondaryCtaEnabled: true,
    secondaryCtaText: 'Passt das zu mir?',
    secondaryCtaInfo:
      'Wenn du Freude an Kommunikation, Zielklarheit und Tempo hast, ist die Chance sehr hoch: ja.',
    infoButtons: [
      {
        text: 'Warum bei uns arbeiten?',
        href: './extended1.html',
        variant: 'secondary'
      },
      {
        text: 'Wer sind wir?',
        href: './extended2.html',
        variant: 'secondary'
      }
    ]
  },
  extendedPages: {
    extended1: {
      pageTitle: 'Warum bei uns arbeiten',
      heroTitle: 'Warum du bei uns arbeiten solltest',
      heroText:
        'Wir verbinden Leistung mit echter Entwicklung: Du bekommst Verantwortung, Vertrauen und ein Team, das gemeinsam wachsen will.',
      buttons: [
        { text: 'Jetzt zur Bewerbung', href: '#funnel-start', variant: 'primary' },
        { text: 'Zur Landingpage', href: './landing.html', variant: 'ghost' }
      ],
      sections: [
        {
          title: 'Deine Vorteile bei uns',
          list: [
            'Verantwortung ab Tag 1 statt endloser Beobachterrolle.',
            'Klare Ziele, transparente KPIs und ehrliches Feedback.',
            'Modernes Setup mit Tools, die dir wirklich Arbeit abnehmen.',
            'Persönliche Entwicklung durch Sparring, Training und Lernbudget.'
          ]
        },
        {
          title: 'So arbeiten wir',
          text:
            'Offen, direkt und respektvoll. Wir feiern Ergebnisse, lernen aus Fehlern und treffen Entscheidungen schnell.'
        }
      ]
    },
    extended2: {
      pageTitle: 'Wer sind wir',
      heroKicker: 'Wer sind wir?',
      heroTitle: 'Wir bauen Teams, die Wirkung schaffen',
      heroText:
        'Wir sind ein ambitioniertes Team aus Vertrieb, Operations und Produkt. Uns verbindet der Anspruch, Kund:innen wirklich weiterzubringen und dabei selbst jeden Monat besser zu werden.',
      buttons: [
        { text: 'Jetzt bewerben', href: '#funnel-start', variant: 'primary' },
        { text: 'Zur Landingpage', href: './landing.html', variant: 'ghost' }
      ],
      sections: [
        {
          title: 'Wofür wir stehen',
          cards: [
            {
              title: 'Verantwortung statt Bürokratie',
              text: 'Wir vertrauen Menschen früh Verantwortung an und messen uns an Ergebnissen, nicht an langen Abstimmungsschleifen.'
            },
            {
              title: 'Klarheit in der Zusammenarbeit',
              text: 'Ziele, Rollen und Prioritäten sind transparent. So kann jede:r fokussiert arbeiten und schnell Entscheidungen treffen.'
            },
            {
              title: 'Wachstum mit Substanz',
              text: 'Wir investieren in Skills, Feedback und ein sauberes Setup – damit aus Performance langfristiger Erfolg wird.'
            }
          ]
        },
        {
          title: 'Kurz & konkret',
          list: [
            'B2B-Fokus mit klarer Positionierung',
            'Moderne Tool-Landschaft und strukturierte Prozesse',
            'Feedback-Kultur mit echtem Sparring'
          ]
        }
      ]
    }
  },
  funnel: {
    introText:
      'Der Bewerbungsprozess dauert ca. 2 Minuten. Je klarer deine Antworten, desto besser können wir dich einordnen.',
    choiceImageAsset: 'dummy.jpg',
    steps: [],
    final: {
      title: 'Fast geschafft',
      nameLabel: 'Dein Name',
      emailLabel: 'E-Mail-Adresse',
      submitText: 'Jetzt bewerben',
      successToast: 'Danke! Bewerbung wurde erfasst (Demo).',
      thankYouTitle: 'Danke für deine Bewerbung!',
      thankYouText:
        'Wir haben deine Angaben erhalten und melden uns in Kürze bei dir mit den nächsten Schritten.',
      thankYouButtonText: 'Zur Startseite'
    },
    nav: {
      backText: 'Zurück',
      nextText: 'Weiter',
      stepLabel: 'Schritt {current} von {total}'
    },
    validation: {
      requiredText: 'Bitte fülle dieses Feld aus.',
      emailText: 'Bitte gib eine gültige E-Mail-Adresse ein.'
    }
  }
};

const state = {
  config: null,
  landingSections: [],
  view: 'landing',
  stepIndex: 0,
  answers: {}
};

const app = document.getElementById('app');
const toast = document.getElementById('toast');
const pageMode = document.body.dataset.page ?? 'funnel';

const getFunnelStartHref = () => {
  const currentUrl = new URL(window.location.href);
  const basePath = currentUrl.pathname.replace(/[^/]*$/, '');
  return `${basePath}index.html#funnel-start`;
};

const interpolate = (template, values) =>
  template.replace(/\{(\w+)\}/g, (_, token) => values[token] ?? '');

const setThemeVariables = (theme) => {
  const root = document.documentElement.style;
  root.setProperty('--primary-color', theme.primaryColor);
  root.setProperty('--primary-button-text-color', theme.primaryButtonTextColor);
  root.setProperty('--secondary-color', theme.secondaryColor);
  root.setProperty('--background-color', theme.backgroundColor);
  root.setProperty('--card-background-color', theme.cardBackgroundColor);
  root.setProperty('--success-color', theme.successColor);
  root.setProperty('--danger-color', theme.dangerColor);
  root.setProperty('--text-color', theme.textColor);
  root.setProperty('--muted-text-color', theme.mutedTextColor);
  root.setProperty('--border-color', theme.borderColor);
  root.setProperty('--focus-ring', `${theme.primaryColor}59`);
};

const createList = (items) =>
  `<ul class="list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

/**
 * @typedef {'heading' | 'text' | 'list' | 'assets' | 'image' | 'slider' | 'spacer' | 'cta'} SectionType
 *
 * @typedef {{
 *  type: 'heading',
 *  id: string,
 *  enabled: boolean,
 *  kicker?: string,
 *  title: string,
 *  subtitle?: string,
 *  align?: 'left' | 'center',
 *  size?: 'xl' | 'lg' | 'md'
 * }} HeadingSection
 *
 * @typedef {{
 *  type: 'text',
 *  id: string,
 *  enabled: boolean,
 *  title?: string,
 *  body: string,
 *  maxWidth?: 'sm' | 'md' | 'lg'
 * }} TextSection
 *
 * @typedef {{ title: string, text?: string, icon?: string }} ListItem
 *
 * @typedef {{
 *  type: 'list',
 *  id: string,
 *  enabled: boolean,
 *  title: string,
 *  subtitle?: string,
 *  layout?: 'grid' | 'stack',
 *  columns?: 1 | 2 | 3,
 *  items: ListItem[]
 * }} ListSection
 *
 * @typedef {{ src: string, alt: string, caption?: string }} AssetItem
 *
 * @typedef {{
 *  type: 'assets',
 *  id: string,
 *  enabled: boolean,
 *  title?: string,
 *  variant?: 'single' | 'gallery' | 'logos',
 *  assets: AssetItem[]
 * }} AssetsSection
 *
 * @typedef {{
 *  type: 'image',
 *  id: string,
 *  enabled: boolean,
 *  src: string,
 *  alt: string
 * }} ImageSection
 *
 * @typedef {{
 *  type: 'slider',
 *  id: string,
 *  enabled: boolean,
 *  autoplayMs?: number,
 *  assets: AssetItem[]
 * }} SliderSection
 *
 * @typedef {{
 *  type: 'spacer',
 *  id: string,
 *  enabled: boolean,
 *  size?: 'sm' | 'md' | 'lg'
 * }} SpacerSection
 *
 * @typedef {{
 *  type: 'cta',
 *  id: string,
 *  enabled: boolean,
 *  buttonText: string,
 *  action: 'start-funnel' | 'show-info' | 'link',
 *  buttonVariant?: 'primary' | 'secondary' | 'ghost',
 *  href?: string,
 *  infoText?: string,
 *  align?: 'left' | 'center'
 * }} CtaSection
 *
 * @typedef {HeadingSection | TextSection | ListSection | AssetsSection | ImageSection | SliderSection | SpacerSection | CtaSection} LandingSection
 */

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const getFallbackLandingSections = (landing) => [
  {
    type: 'heading',
    id: 'hero',
    enabled: true,
    kicker: landing.companyName,
    title: landing.jobTitle,
    subtitle: landing.shortPitch,
    align: 'left',
    size: 'xl'
  },
  { type: 'text', id: 'about', enabled: true, title: landing.aboutTitle, body: landing.aboutText, maxWidth: 'lg' },
  {
    type: 'list',
    id: 'expectations',
    enabled: true,
    title: landing.expectationsTitle,
    layout: 'stack',
    columns: 1,
    items: (landing.expectationsBullets ?? []).map((item) => ({ title: item }))
  },
  {
    type: 'list',
    id: 'benefits',
    enabled: true,
    title: landing.benefitsTitle,
    layout: 'stack',
    columns: 1,
    items: (landing.benefitsBullets ?? []).map((item) => ({ title: item }))
  },
  {
    type: 'cta',
    id: 'cta-primary',
    enabled: true,
    buttonText: landing.primaryCtaText,
    buttonVariant: 'primary',
    action: 'start-funnel',
    align: 'left'
  },
  ...(Array.isArray(landing.infoButtons)
    ? landing.infoButtons.map((button, index) => ({
        type: 'cta',
        id: `cta-info-${index + 1}`,
        enabled: true,
        buttonText: String(button.text ?? 'Mehr erfahren'),
        buttonVariant: button.variant === 'ghost' ? 'ghost' : 'secondary',
        action: 'link',
        href: String(button.href ?? '#'),
        align: 'left'
      }))
    : []),
  ...(landing.secondaryCtaEnabled
    ? [
        {
          type: 'cta',
          id: 'cta-secondary',
          enabled: true,
          buttonText: landing.secondaryCtaText,
          buttonVariant: 'secondary',
          action: 'show-info',
          infoText: landing.secondaryCtaInfo,
          align: 'left'
        }
      ]
    : [])
];

function HeadingSection(section, headingLevel = 'h2') {
  const alignmentClass = section.align === 'center' ? 'landing-align-center' : '';
  const headingClass = section.size === 'md' ? 'section-title' : 'hero-title';
  const variantClass = typeof section.variant === 'string' ? `landing-heading-${escapeHtml(section.variant)}` : '';

  const titleMarkup = escapeHtml(section.title).replaceAll('\n', '<br />');

  return `
    <article class="card stack ${alignmentClass} ${variantClass}" data-section-id="${escapeHtml(section.id)}">
      ${section.kicker ? `<p class="copy">${escapeHtml(section.kicker)}</p>` : ''}
      <${headingLevel} class="${headingClass}">${titleMarkup}</${headingLevel}>
      ${section.subtitle ? `<p class="hero-copy">${escapeHtml(section.subtitle)}</p>` : ''}
    </article>
  `;
}

function TextSection(section) {
  const maxWidthClass = section.maxWidth ? `text-max-${section.maxWidth}` : '';
  return `
    <article class="card stack ${maxWidthClass}" data-section-id="${escapeHtml(section.id)}">
      ${section.title ? `<h2 class="section-title">${escapeHtml(section.title)}</h2>` : ''}
      <p class="copy">${escapeHtml(section.body).replaceAll('\n', '<br />')}</p>
    </article>
  `;
}

function ListSection(section) {
  const layout = section.layout === 'grid' ? 'landing-list-grid' : 'landing-list-stack';
  const columns = [1, 2, 3].includes(section.columns) ? section.columns : 1;
  const titleMarkup = section.title ? `<h2 class="section-title">${escapeHtml(section.title)}</h2>` : '';
  const subtitleMarkup = section.subtitle ? `<p class="copy">${escapeHtml(section.subtitle)}</p>` : '';

  return `
    <article class="card stack" data-section-id="${escapeHtml(section.id)}">
      ${titleMarkup}
      ${subtitleMarkup}
      <ul class="list ${layout} landing-list-columns-${columns}">
        ${(Array.isArray(section.items) ? section.items : [])
          .map(
            (item) => `
              <li>
                <strong>${item.icon ? `${escapeHtml(item.icon)} ` : ''}${escapeHtml(item.value ?? item.title)}</strong>
                ${item.key ? `<p class="copy">${escapeHtml(item.key)}</p>` : item.text ? `<p class="copy">${escapeHtml(item.text)}</p>` : ''}
              </li>
            `
          )
          .join('')}
      </ul>
    </article>
  `;
}

function AssetsSection(section) {
  const variant = section.variant ?? 'gallery';
  const variantClass = variant === 'single' ? 'landing-assets-single' : variant === 'logos' ? 'landing-assets-logos' : 'landing-assets-gallery';
  return `
    <article class="card stack" data-section-id="${escapeHtml(section.id)}">
      ${section.title ? `<h2 class="section-title">${escapeHtml(section.title)}</h2>` : ''}
      <div class="${variantClass}">
        ${(Array.isArray(section.assets) ? section.assets : [])
          .map(
            (asset) => `
              <figure class="landing-asset-item">
                <img src="${escapeHtml(asset.src)}" alt="${escapeHtml(asset.alt)}" loading="lazy" />
                ${asset.caption ? `<figcaption class="copy">${escapeHtml(asset.caption)}</figcaption>` : ''}
              </figure>
            `
          )
          .join('')}
      </div>
    </article>
  `;
}

function ImageSection(section) {
  return `
    <article class="card landing-image-only" data-section-id="${escapeHtml(section.id)}">
      <img src="${escapeHtml(section.src)}" alt="${escapeHtml(section.alt ?? '')}" loading="lazy" />
    </article>
  `;
}

function SliderSection(section) {
  const autoplayMs = Math.max(2000, Number(section.autoplayMs) || 5000);

  return `
    <article class="card stack landing-slider" data-section-id="${escapeHtml(section.id)}" data-slider-autoplay-ms="${autoplayMs}">
      <div class="landing-slider-track-wrap">
        <div class="landing-slider-track">
          ${(Array.isArray(section.assets) ? section.assets : [])
            .map(
              (asset, index) => `
                <figure class="landing-slider-slide ${index === 0 ? 'is-active' : ''}" data-slide-index="${index}" aria-hidden="${
                  index === 0 ? 'false' : 'true'
                }">
                  <img src="${escapeHtml(asset.src)}" alt="${escapeHtml(asset.alt)}" loading="lazy" />
                </figure>
              `
            )
            .join('')}
        </div>
      </div>
      <div class="landing-slider-dots" role="tablist" aria-label="Bild-Slider Navigation">
        ${(Array.isArray(section.assets) ? section.assets : [])
          .map(
            (asset, index) => `
              <button
                type="button"
                class="landing-slider-dot ${index === 0 ? 'is-active' : ''}"
                data-slider-dot-index="${index}"
                role="tab"
                aria-selected="${index === 0 ? 'true' : 'false'}"
                aria-label="Bild ${index + 1}: ${escapeHtml(asset.alt)}"
              ></button>
            `
          )
          .join('')}
      </div>
    </article>
  `;
}

function SpacerSection(section) {
  const spacerSize = section.size === 'sm' || section.size === 'lg' ? section.size : 'md';
  return `<div class="landing-spacer landing-spacer-${spacerSize}" data-section-id="${escapeHtml(section.id)}" aria-hidden="true"></div>`;
}

function LandingSection(section, headingLevel = 'h2') {
  if (!section || section.enabled === false || typeof section.type !== 'string' || !section.id) {
    return '';
  }

  if (section.type === 'heading' && section.title) return HeadingSection(section, headingLevel);
  if (section.type === 'text' && section.body) return TextSection(section);
  if (section.type === 'list' && Array.isArray(section.items) && section.items.length > 0) return ListSection(section);
  if (section.type === 'assets' && Array.isArray(section.assets)) return AssetsSection(section);
  if (section.type === 'image' && section.src) return ImageSection(section);
  if (section.type === 'slider' && Array.isArray(section.assets) && section.assets.length > 0) return SliderSection(section);
  if (section.type === 'spacer') return SpacerSection(section);
  if (section.type === 'cta' && section.buttonText && section.action) return CtaSection(section);

  return '';
}

function CtaSection(section) {
  const variantClass =
    section.buttonVariant === 'ghost' ? 'btn-ghost' : section.buttonVariant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  const alignmentClass = section.align === 'center' ? 'landing-align-center' : '';
  const inverseClass = section.buttonStyle === 'inverse' ? 'btn-inverse' : '';
  const animatedClass = section.animate === true ? 'btn-animated' : '';
  const buttonLabel = escapeHtml(section.buttonText);
  const action = escapeHtml(section.action);
  const buttonClasses = ['btn', variantClass, inverseClass, animatedClass].filter(Boolean).join(' ');

  const buttonMarkup =
    section.action === 'link'
      ? `<a class="${buttonClasses}" href="${escapeHtml(section.href ?? '#')}">${buttonLabel}</a>`
      : `<button type="button" class="${buttonClasses}" data-cta-action="${action}" data-cta-info="${escapeHtml(section.infoText ?? '')}">${buttonLabel}</button>`;

  return `
    <article class="card stack ${alignmentClass}" data-section-id="${escapeHtml(section.id)}">
      <div class="actions">
        ${buttonMarkup}
      </div>
    </article>
  `;
}

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2800);
};

const normalizeOption = (option) => {
  if (typeof option === 'string') {
    return { value: option, text: option, icon: '' };
  }

  if (option && typeof option === 'object') {
    const text = String(option.text ?? option.label ?? option.value ?? '').trim();
    return {
      value: String(option.value ?? text),
      text,
      icon: option.icon ? String(option.icon) : ''
    };
  }

  const fallbackText = String(option ?? '').trim();
  return { value: fallbackText, text: fallbackText, icon: '' };
};

function renderLanding() {
  const sections = Array.isArray(state.landingSections) ? state.landingSections : [];
  const enabledSections = sections.filter((section) => section && section.enabled !== false);
  const firstHeadingId = enabledSections.find((section) => section.type === 'heading')?.id;

  const sectionsMarkup = enabledSections
    .map((section) => LandingSection(section, section.id === firstHeadingId ? 'h1' : 'h2'))
    .join('');

  app.innerHTML = `
    <section class="container stack landing-sections">
      ${sectionsMarkup}
    </section>
  `;

  document.querySelectorAll('[data-cta-action]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.ctaAction === 'show-info') {
        showToast(button.dataset.ctaInfo || state.config.landing.secondaryCtaInfo);
        return;
      }

      if (button.dataset.ctaAction === 'start-funnel') {
        if (pageMode === 'landing-only') {
          window.location.href = getFunnelStartHref();
          return;
        }

        state.view = 'funnel';
        state.stepIndex = 0;
        renderQuestionStep(state.stepIndex);
      }
    });
  });

  initLandingSliders();
}

function initLandingSliders() {
  const sliderElements = document.querySelectorAll('.landing-slider');

  sliderElements.forEach((sliderElement) => {
    const slides = Array.from(sliderElement.querySelectorAll('.landing-slider-slide'));
    const dots = Array.from(sliderElement.querySelectorAll('.landing-slider-dot'));

    if (slides.length <= 1 || dots.length !== slides.length) {
      return;
    }

    const autoplayMs = Math.max(2000, Number(sliderElement.dataset.sliderAutoplayMs) || 5000);
    let activeIndex = 0;
    let timerId;

    const setActiveSlide = (nextIndex) => {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const startAutoplay = () => {
      window.clearInterval(timerId);
      timerId = window.setInterval(() => {
        setActiveSlide(activeIndex + 1);
      }, autoplayMs);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setActiveSlide(index);
        startAutoplay();
      });
    });

    sliderElement.addEventListener('mouseenter', () => window.clearInterval(timerId));
    sliderElement.addEventListener('mouseleave', startAutoplay);
    sliderElement.addEventListener('focusin', () => window.clearInterval(timerId));
    sliderElement.addEventListener('focusout', startAutoplay);

    startAutoplay();
  });
}

async function loadLandingSections() {
  try {
    const response = await fetch('./src/content/landingpage.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data?.sections)) throw new Error('sections array fehlt');
    return data.sections;
  } catch (error) {
    console.warn('landingpage.json konnte nicht geladen werden, verwende Fallback aus config.landing.', error);
    return getFallbackLandingSections(state.config?.landing ?? FALLBACK_CONFIG.landing);
  }
}

function getPageButtonHref(href) {
  if (href === '#funnel-start') {
    return getFunnelStartHref();
  }

  return href;
}

function renderExtendedPage(pageId) {
  const pageConfig = state.config?.extendedPages?.[pageId];
  if (!pageConfig) {
    app.innerHTML = '<section class="container"><article class="card">Seite nicht gefunden.</article></section>';
    return;
  }

  if (pageConfig.pageTitle) {
    document.title = pageConfig.pageTitle;
  }

  const buttonsMarkup = Array.isArray(pageConfig.buttons)
    ? pageConfig.buttons
        .map((button) => {
          const variant = button.variant === 'ghost' ? 'btn-ghost' : button.variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
          return `<a class="btn ${variant}" href="${getPageButtonHref(String(button.href ?? '#'))}">${button.text ?? 'Weiter'}</a>`;
        })
        .join('')
    : '';

  const sectionsMarkup = Array.isArray(pageConfig.sections)
    ? pageConfig.sections
        .map((section) => {
          const cardsMarkup = Array.isArray(section.cards)
            ? `<div class="who-values-grid">${section.cards
                .map(
                  (card) => `
                    <article class="who-value-card">
                      <h3>${card.title ?? ''}</h3>
                      <p>${card.text ?? ''}</p>
                    </article>
                  `
                )
                .join('')}</div>`
            : '';

          const listMarkup = Array.isArray(section.list) ? createList(section.list) : '';
          const textMarkup = section.text ? `<p class="copy">${section.text}</p>` : '';

          return `
            <article class="card stack">
              ${section.title ? `<h2 class="section-title">${section.title}</h2>` : ''}
              ${textMarkup}
              ${listMarkup}
              ${cardsMarkup}
            </article>
          `;
        })
        .join('')
    : '';

  app.innerHTML = `
    <section class="container stack">
      <article class="card stack">
        ${pageConfig.heroKicker ? `<p class="eyebrow">${pageConfig.heroKicker}</p>` : ''}
        <h1 class="hero-title">${pageConfig.heroTitle ?? ''}</h1>
        <p class="hero-copy">${pageConfig.heroText ?? ''}</p>
        ${buttonsMarkup ? `<div class="actions">${buttonsMarkup}</div>` : ''}
      </article>
      ${sectionsMarkup}
    </section>
  `;
}

function renderQuestionInput(step) {
  const value = state.answers[step.fieldKey] ?? (step.type === 'multiChoice' ? [] : '');

  if (step.type === 'text') {
    return `
      <div class="field">
        <label for="field-input">${step.question}</label>
        <input id="field-input" name="${step.fieldKey}" type="text" placeholder="${step.placeholder ?? ''}" value="${value}" />
      </div>
    `;
  }

  if (step.type === 'textarea') {
    return `
      <div class="field">
        <label for="field-input">${step.question}</label>
        <textarea id="field-input" name="${step.fieldKey}" placeholder="${step.placeholder ?? ''}">${value}</textarea>
      </div>
    `;
  }

  const options =
    step.type === 'yesNo'
      ? ['Ja', 'Nein']
      : Array.isArray(step.options)
        ? step.options
        : [];


  const isMultiChoice = step.type === 'multiChoice';

  const styledChoiceStep = ['singleChoice', 'yesNo', 'multiChoice'].includes(step.type);
  const singleChoiceClass = styledChoiceStep ? ' single-choice-mobile single-choice-options' : '';

  const choicesMarkup = `
    <div class="choice-grid${singleChoiceClass}">
      ${options
        .map(
          (option) => {
            const normalizedOption = normalizeOption(option);
            return `
            <button
              type="button"
              class="choice-btn ${
                isMultiChoice
                  ? Array.isArray(value) && value.includes(normalizedOption.value)
                    ? 'active'
                    : ''
                  : value === normalizedOption.value
                    ? 'active'
                    : ''
              }"
              data-choice="${normalizedOption.value}"
            >
              ${
                styledChoiceStep
                  ? `${
                      isMultiChoice
                        ? '<span class="choice-checkbox" aria-hidden="true"></span>'
                        : `<span class="choice-icon" aria-hidden="true">${normalizedOption.icon}</span>`
                    }<span class="choice-text">${normalizedOption.text}</span>`
                  : normalizedOption.text
              }
            </button>
          `
          }
        )
        .join('')}
    </div>
  `;

  if (['singleChoice', 'yesNo', 'multiChoice'].includes(step.type)) {
    return choicesMarkup;
  }

  return `
    <fieldset class="field">
      <legend>${step.question}</legend>
      ${choicesMarkup}
    </fieldset>
  `;
}

function validateStep(step) {
  const currentValue = state.answers[step.fieldKey];
  if (!step.required) return { valid: true, message: '' };

  if (step.type === 'multiChoice') {
    const hasValue = Array.isArray(currentValue) && currentValue.length > 0;
    if (!hasValue) {
      return { valid: false, message: state.config.funnel.validation.requiredText };
    }
    return { valid: true, message: '' };
  }

  const empty = !String(currentValue ?? '').trim();
  if (empty) {
    return { valid: false, message: state.config.funnel.validation.requiredText };
  }
  return { valid: true, message: '' };
}

function attachStepEvents(step, totalSteps) {
  let isChoiceAdvancing = false;

  const input = document.getElementById('field-input');
  if (input) {
    input.addEventListener('input', (event) => {
      state.answers[step.fieldKey] = event.target.value;
      document.getElementById('error-text').textContent = '';
    });
  }

  document.querySelectorAll('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.dataset.choice;

      if (step.type === 'multiChoice') {
        const selectedChoices = Array.isArray(state.answers[step.fieldKey])
          ? state.answers[step.fieldKey]
          : [];

        state.answers[step.fieldKey] = selectedChoices.includes(choice)
          ? selectedChoices.filter((item) => item !== choice)
          : [...selectedChoices, choice];
      } else {
        state.answers[step.fieldKey] = choice;

        const hasAutoAdvanceAnimation = ['singleChoice', 'yesNo'].includes(step.type);

        if (hasAutoAdvanceAnimation) {
          if (isChoiceAdvancing) {
            return;
          }

          isChoiceAdvancing = true;
          document
            .querySelectorAll('.single-choice-options .choice-btn')
            .forEach((choiceButton) => choiceButton.classList.remove('choice-btn-confirm'));
          button.classList.add('choice-btn-confirm');
        }

        const proceedToNext = () => {
          if (state.stepIndex < totalSteps - 1) {
            state.stepIndex += 1;
            renderQuestionStep(state.stepIndex);
            return;
          }

          state.view = 'final';
          renderFinalForm();
        };

        if (hasAutoAdvanceAnimation) {
          window.setTimeout(proceedToNext, 760);
          return;
        }

        proceedToNext();
        return;
      }

      renderQuestionStep(state.stepIndex);
    });
  });

  const nextButton = document.getElementById('next-btn');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const result = validateStep(step);
      if (!result.valid) {
        document.getElementById('error-text').textContent = result.message;
        return;
      }

      if (state.stepIndex < totalSteps - 1) {
        state.stepIndex += 1;
        renderQuestionStep(state.stepIndex);
        return;
      }

      state.view = 'final';
      renderFinalForm();
    });
  }

  const backButton = document.getElementById('back-btn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (state.stepIndex === 0) {
        state.view = 'landing';
        renderLanding();
        return;
      }

      state.stepIndex -= 1;
      renderQuestionStep(state.stepIndex);
    });
  }
}

function renderQuestionStep(index) {
  const { funnel } = state.config;
  const total = funnel.steps.length;
  const step = funnel.steps[index];
  const progress = ((index + 1) / total) * 100;
  const isStyledChoiceStep = ['singleChoice', 'yesNo', 'multiChoice'].includes(step.type);
  const needsManualNavigation = step.type === 'multiChoice';
  const stepImageAsset = step.imageAsset ?? funnel.choiceImageAsset ?? funnel.singleChoiceImageAsset;

  app.innerHTML = isStyledChoiceStep
    ? `
      <section class="container">
        <article class="card single-choice-layout">
          <div class="single-choice-logo">
            <div class="single-choice-logo-mark">Renggli Holzbau</div>
          </div>
          <div class="single-choice-step-bar">${interpolate(funnel.nav.stepLabel, { current: index + 1, total })}</div>
          <div class="single-choice-content">
            <h2 class="section-title single-choice-question">${step.question}</h2>
            ${renderQuestionInput(step)}
            ${step.helperText ? `<p class="helper">${step.helperText}</p>` : ''}
            <p class="error" id="error-text"></p>
            ${
              needsManualNavigation
                ? `
                  <div class="nav-actions single-choice-nav-actions">
                    <button type="button" class="btn btn-primary" id="next-btn">${funnel.nav.nextText}</button>
                  </div>
                `
                : ''
            }
          </div>
          <div class="single-choice-image-wrap">
            ${
              stepImageAsset
                ? `<img class="single-choice-image" src="./${stepImageAsset}" alt="" loading="lazy" />`
                : '<div class="single-choice-image-placeholder" aria-hidden="true">Bild Platzhalter</div>'
            }
          </div>
        </article>
      </section>
    `
    : `
      <section class="container">
        <article class="card stack">
          <p class="copy">${funnel.introText}</p>
          <div class="progress-wrap">
            <span class="progress-label">${interpolate(funnel.nav.stepLabel, { current: index + 1, total })}</span>
            <div class="progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${index + 1}">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
          </div>

          <h2 class="section-title">${step.title}</h2>
          ${renderQuestionInput(step)}
          ${step.helperText ? `<p class="helper">${step.helperText}</p>` : ''}
          <p class="error" id="error-text"></p>

          <div class="nav-actions">
            <button type="button" class="btn btn-ghost" id="back-btn">${funnel.nav.backText}</button>
            <button type="button" class="btn btn-primary" id="next-btn">${funnel.nav.nextText}</button>
          </div>
        </article>
      </section>
    `;

  attachStepEvents(step, total);
}

function validateFinalForm() {
  const { validation } = state.config.funnel;
  const name = String(state.answers.name ?? '').trim();
  const email = String(state.answers.email ?? '').trim();

  if (!name || !email) return validation.requiredText;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isEmailValid) return validation.emailText;

  return '';
}

function renderFinalForm() {
  const { final, nav, steps } = state.config.funnel;

  app.innerHTML = `
    <section class="container">
      <article class="card stack">
        <span class="progress-label">${interpolate(nav.stepLabel, { current: steps.length + 1, total: steps.length + 1 })}</span>
        <h2 class="section-title">${final.title}</h2>
        <p class="copy">${final.description ?? ''}</p>

        <div class="field">
          <label for="full-name">${final.nameLabel}</label>
          <input id="full-name" type="text" placeholder="${final.namePlaceholder ?? ''}" value="${state.answers.name ?? ''}" />
        </div>

        <div class="field">
          <label for="email">${final.emailLabel}</label>
          <input id="email" type="email" placeholder="${final.emailPlaceholder ?? ''}" value="${state.answers.email ?? ''}" />
        </div>

        <p class="error" id="final-error"></p>

        <div class="nav-actions">
          <button type="button" class="btn btn-ghost" id="back-to-step">${nav.backText}</button>
          <button type="button" class="btn btn-primary" id="submit-btn">${final.submitText}</button>
        </div>
      </article>
    </section>
  `;

  document.getElementById('full-name').addEventListener('input', (event) => {
    state.answers.name = event.target.value;
  });

  document.getElementById('email').addEventListener('input', (event) => {
    state.answers.email = event.target.value;
  });

  document.getElementById('back-to-step').addEventListener('click', () => {
    state.view = 'funnel';
    state.stepIndex = Math.max(0, state.config.funnel.steps.length - 1);
    renderQuestionStep(state.stepIndex);
  });

  document.getElementById('submit-btn').addEventListener('click', () => {
    const errorMessage = validateFinalForm();
    if (errorMessage) {
      document.getElementById('final-error').textContent = errorMessage;
      return;
    }

    const payload = {
      submittedAt: new Date().toISOString(),
      position: state.config.landing.jobTitle,
      ...state.answers
    };

    console.log('Recruiting Funnel Submission:', payload);
    showToast(final.successToast);
    state.answers = {};
    state.view = 'thankyou';
    renderThankYou();
  });
}

function renderThankYou() {
  const { final } = state.config.funnel;

  app.innerHTML = `
    <section class="container">
      <article class="card stack">
        <h2 class="section-title">${final.thankYouTitle ?? 'Danke für deine Bewerbung!'}</h2>
        <p class="copy">${
          final.thankYouText ??
          'Wir haben deine Angaben erhalten und melden uns in Kürze bei dir mit den nächsten Schritten.'
        }</p>
        <div class="actions">
          <button type="button" class="btn btn-primary" id="back-home-btn">${
            final.thankYouButtonText ?? 'Zur Startseite'
          }</button>
        </div>
      </article>
    </section>
  `;

  document.getElementById('back-home-btn').addEventListener('click', () => {
    state.view = 'landing';
    renderLanding();
  });
}

async function loadConfig() {
  // Primär: JSON-Datei laden. Falls local file/CORS blockiert, wird die Fallback-Konstante verwendet.
  try {
    const response = await fetch('./config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('config.json konnte nicht geladen werden, verwende FALLBACK_CONFIG.', error);
    return FALLBACK_CONFIG;
  }
}

async function init() {
  state.config = await loadConfig();
  state.landingSections = await loadLandingSections();
  setThemeVariables(state.config.theme);

  if (pageMode.startsWith('extended:')) {
    renderExtendedPage(pageMode.replace('extended:', ''));
    return;
  }

  const shouldStartInFunnel = pageMode === 'funnel' && window.location.hash === '#funnel-start';
  if (shouldStartInFunnel) {
    state.view = 'funnel';
    state.stepIndex = 0;
    renderQuestionStep(state.stepIndex);
    return;
  }

  renderLanding();
}

init();
