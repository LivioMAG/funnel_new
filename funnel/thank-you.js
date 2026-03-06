import { initTracking, trackThankYouPage } from '../tracking.js';

const app = document.getElementById('thank-you-app');
const THANK_YOU_STORAGE_KEY = 'funnelThankYouPayload';
const load = (p) => fetch(p, { cache: 'no-store' }).then((r) => r.json());

function applyTheme(cfg) {
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
    '--secondary': t.secondaryColor,
    '--font': ty.fontFamily,
    '--base': ty.baseSize,
    '--h1': ty.h1Size,
    '--h2': ty.h2Size,
  };
  Object.entries(map).forEach(([k, v]) => v && document.documentElement.style.setProperty(k, v));
}

function readThankYouPayload() {
  try {
    const raw = sessionStorage.getItem(THANK_YOU_STORAGE_KEY);
    if (!raw) return {};
    sessionStorage.removeItem(THANK_YOU_STORAGE_KEY);
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Danke-Seiten-Payload konnte nicht gelesen werden.', error);
    return {};
  }
}

function renderThankYouPage(funnel, payload) {
  const thankYou = funnel?.final?.thankYou || {};
  const title = thankYou.title || 'Vielen Dank für deine Anfrage!';
  const message = thankYou.message || 'Wir haben deine Daten erhalten und melden uns zeitnah bei dir.';
  const image = funnel?.hero?.image || '../assets/ref2.jpg';

  app.innerHTML = `
    <section class="screen">
      <article class="questionCard">
        <h2>${title}</h2>
        <p class="muted">${message}</p>
      </article>
      <img class="heroImage" src="${image}" alt="Danke" />
    </section>
  `;

  trackThankYouPage(
    {
      email: payload?.contact?.email,
      phone: payload?.contact?.phone,
      leadCreated: true,
      submittedAt: payload?.submittedAt,
    },
    funnel?.trackingConfig || {}
  );
}

(async () => {
  const [config, funnel] = await Promise.all([load('../config.json'), load('./funnel.json')]);
  applyTheme(config);
  initTracking(config.tracking);

  const payload = readThankYouPayload();
  renderThankYouPage({ ...funnel, trackingConfig: config.tracking || {} }, payload);
})();
