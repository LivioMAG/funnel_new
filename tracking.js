const TRACKING_GLOBAL = '__funnelTrackingInitialized';

function ensureFacebookPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return;
  if (!window.fbq) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

function ensureGoogleTag(measurementId) {
  if (!measurementId || typeof window === 'undefined') return;
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }
  window.gtag('config', measurementId);
}

function ensureTikTokPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return;
  if (!window.ttq) {
    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
      ttq.setAndDefer = function (target, method) {
        target[method] = function () {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i += 1) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (instanceName) {
        const instance = ttq._i[instanceName] || [];
        for (let i = 0; i < ttq.methods.length; i += 1) {
          ttq.setAndDefer(instance, ttq.methods[i]);
        }
        return instance;
      };
      ttq.load = function (id) {
        const src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = src;
        ttq._t = ttq._t || {};
        ttq._t[id] = Number(new Date());
        ttq._o = ttq._o || {};
        ttq._o[id] = {};
        const script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `${src}?sdkid=${encodeURIComponent(id)}&lib=${t}`;
        const firstScript = d.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      };
      ttq.page();
    })(window, document, 'ttq');
  }
  window.ttq.load(pixelId);
  window.ttq.page();
}

function normalizeTrackingConfig(tracking) {
  return {
    facebook: tracking?.facebook || {},
    google: tracking?.google || {},
    tiktok: tracking?.tiktok || {},
  };
}

export function initTracking(trackingConfig = {}) {
  if (typeof window === 'undefined') return;
  const tracking = normalizeTrackingConfig(trackingConfig);

  if (window[TRACKING_GLOBAL]) return;
  window[TRACKING_GLOBAL] = true;

  if (tracking.facebook.enabled !== false) ensureFacebookPixel(tracking.facebook.pixelId);
  if (tracking.google.enabled !== false) ensureGoogleTag(tracking.google.measurementId);
  if (tracking.tiktok.enabled !== false) ensureTikTokPixel(tracking.tiktok.pixelId);
}

export function trackApplicationCompleted(payload = {}, trackingConfig = {}) {
  const tracking = normalizeTrackingConfig(trackingConfig);

  if (tracking.facebook.enabled !== false && typeof window.fbq === 'function') {
    const fbEvent = tracking.facebook.completedEvent || 'Lead';
    window.fbq('track', fbEvent, {
      content_name: 'Funnel abgeschlossen',
      status: 'completed',
      ...payload,
    });
  }

  if (tracking.google.enabled !== false && typeof window.gtag === 'function') {
    const googleEvent = tracking.google.completedEvent || 'generate_lead';
    const googlePayload = {
      event_category: 'funnel',
      event_label: 'contact_submitted',
      ...payload,
    };

    if (tracking.google.conversionId && tracking.google.conversionLabel) {
      googlePayload.send_to = `${tracking.google.conversionId}/${tracking.google.conversionLabel}`;
    }

    window.gtag('event', googleEvent, googlePayload);
  }

  if (tracking.tiktok.enabled !== false && window.ttq && typeof window.ttq.track === 'function') {
    const tiktokEvent = tracking.tiktok.completedEvent || 'SubmitForm';
    window.ttq.track(tiktokEvent, {
      content_name: 'Funnel abgeschlossen',
      status: 'completed',
      ...payload,
    });
  }
}

export function trackThankYouPage(payload = {}, trackingConfig = {}) {
  const tracking = normalizeTrackingConfig(trackingConfig);

  if (tracking.facebook.enabled !== false && typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'ThankYouPageView', {
      page_name: 'thank_you',
      ...payload,
    });
  }

  if (tracking.google.enabled !== false && typeof window.gtag === 'function') {
    window.gtag('event', 'thank_you_page_view', {
      event_category: 'funnel',
      event_label: 'thank_you',
      ...payload,
    });
  }

  if (tracking.tiktok.enabled !== false && window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('ViewContent', {
      content_name: 'Danke-Seite',
      ...payload,
    });
  }
}
