import { initTracking, trackApplicationCompleted, trackThankYouPage } from '../tracking.js';
const app = document.getElementById('app');
let data;
let index = 0;
const answersByStepId = {};
let lastProgressValue = 0;
let trackingConfig = {};

let leadSubmissionPending = false;
const THANK_YOU_STORAGE_KEY = 'funnelThankYouPayload';
let funnelClosedState = null;

function sanitizeForQuery(value) {
  if (Array.isArray(value) || (value && typeof value === 'object')) return JSON.stringify(value);
  return String(value ?? '');
}

async function triggerLeadWebhook(payload) {
  const leadWebhook = data?.final?.leadWebhook || {};
  const webhookUrl = leadWebhook.url?.trim();
  if (!webhookUrl) return;

  const webhookMethod = (leadWebhook.method || 'POST').toUpperCase();

  try {
    if (webhookMethod === 'GET') {
      const url = new URL(webhookUrl);
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, sanitizeForQuery(value));
      });

      await fetch(url.toString(), {
        method: 'GET',
        keepalive: true,
      });
      return;
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn('Lead-Webhook konnte nicht ausgelöst werden', error);
  }
}


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

function getProgress() {
  const total = data.steps.length + 1;
  const active = Math.min(index + 1, total);
  return { total, active, value: Math.round((active / total) * 100) };
}

function stepHeader() {
  const p = getProgress();
  return `
    <div class="progressWrap">
      <div class="progressMeta">
        <span>Schritt ${p.active} von ${p.total}</span>
        <strong>${p.value}%</strong>
      </div>
      <div class="progressTrack"><div class="progressBar" style="width:${p.value}%"></div></div>
    </div>
  `;
}

function renderBelowNavText(step) {
  const text = step?.belowNavText?.trim();
  if (!text) return '';

  const align = step?.belowNavTextAlign === 'left' ? 'left' : 'center';
  return `<p class="belowNavText ${align}">${text}</p>`;
}

function hasStepValue(step) {
  const value = getStepAnswer(step);
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function getStepAnswer(step) {
  return answersByStepId[step.id];
}

function setStepAnswer(step, value) {
  answersByStepId[step.id] = value;
}

function normalizeChoiceOption(option) {
  if (typeof option === 'string') {
    return {
      label: option,
      closeFunnel: false,
      closeTitle: '',
      closeMessage: '',
      closeWebhookUrl: '',
      closeWebhookMethod: '',
    };
  }

  const label = option?.label || option?.value || '';
  return {
    label,
    closeFunnel: Boolean(option?.closeFunnel),
    closeTitle: option?.closeTitle || '',
    closeMessage: option?.closeMessage || '',
    closeWebhookUrl: option?.closeWebhookUrl || '',
    closeWebhookMethod: option?.closeWebhookMethod || '',
  };
}

function findNormalizedOption(step, selectedLabel) {
  return (step.options || [])
    .map(normalizeChoiceOption)
    .find((option) => option.label === selectedLabel);
}

function buildAnswersByFieldKey() {
  const grouped = {};

  data.steps.forEach((step) => {
    if (!(step.id in answersByStepId)) return;

    const value = answersByStepId[step.id];
    if (!(step.fieldKey in grouped)) {
      grouped[step.fieldKey] = value;
      return;
    }

    if (!Array.isArray(grouped[step.fieldKey])) {
      grouped[step.fieldKey] = [grouped[step.fieldKey]];
    }
    grouped[step.fieldKey].push(value);
  });

  return grouped;
}

function getAnswersList() {
  return data.steps
    .filter((step) => step.id in answersByStepId)
    .map((step) => ({
      stepId: step.id,
      fieldKey: step.fieldKey,
      question: step.question,
      answer: answersByStepId[step.id],
    }));
}

function renderChoice(options, key, mode = 'single') {
  const multiple = mode === 'multiple';
  const showIndicator = mode !== 'yesNo';
  const current = answersByStepId[key] || (multiple ? [] : '');
  const normalizedOptions = options.map(normalizeChoiceOption);
  return `
    <div class="choiceGrid ${mode}">
      ${
        normalizedOptions
          .map((opt) => {
            const active = multiple ? current.includes(opt.label) : current === opt.label;
            const icon = mode === 'yesNo' ? (opt.label === 'Ja' ? '✓' : '✕') : '';
            return `<button type="button" class="choiceBtn ${active ? 'active' : ''}" data-choice="${opt.label}">${
              icon ? `<span class="choiceIcon" aria-hidden="true">${icon}</span>` : ''
            }${
              showIndicator
                ? '<span class="choiceIndicator" aria-hidden="true"><span class="choiceDot"></span></span>'
                : ''
            }<span class="choiceLabel">${opt.label}</span></button>`;
          })
          .join('')
      }
    </div>
  `;
}

function syncNextButton(step) {
  const nextBtn = app.querySelector('#next');
  if (!nextBtn) return;
  nextBtn.classList.toggle('isHidden', !hasStepValue(step));
}

async function triggerStepWebhook(step) {
  const webhookUrl = step?.webhookUrl?.trim();
  if (!webhookUrl) return;
  const webhookMethod = (step?.webhookMethod || 'POST').toUpperCase();

  const payload = {
    stepId: step.id,
    fieldKey: step.fieldKey,
    answer: getStepAnswer(step),
    answersByStepId,
    answersByFieldKey: buildAnswersByFieldKey(),
    answersList: getAnswersList(),
    triggeredAt: new Date().toISOString(),
  };

  try {
    if (webhookMethod === 'GET') {
      const url = new URL(webhookUrl);
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, sanitizeForQuery(value));
      });
      await fetch(url.toString(), {
        method: 'GET',
        keepalive: true,
      });
      return;
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn(`Webhook konnte nicht ausgelöst werden (step: ${step.id})`, error);
  }
}

async function triggerStepDropoutWebhook(step, selectedOption, reason = 'single_choice_disqualifier') {
  const fallbackDropoutWebhook = data?.final?.dropoutWebhook || {};
  const webhookUrl =
    selectedOption?.closeWebhookUrl?.trim() ||
    step?.dropoutWebhookUrl?.trim() ||
    fallbackDropoutWebhook.url?.trim();
  if (!webhookUrl) return;

  const webhookMethod = (
    selectedOption?.closeWebhookMethod ||
    step?.dropoutWebhookMethod ||
    fallbackDropoutWebhook.method ||
    'POST'
  ).toUpperCase();

  const payload = {
    event: 'funnel_closed',
    reason,
    stepId: step.id,
    fieldKey: step.fieldKey,
    question: step.question,
    selectedOption: selectedOption.label,
    answer: getStepAnswer(step),
    answersByStepId,
    answersByFieldKey: buildAnswersByFieldKey(),
    answersList: getAnswersList(),
    triggeredAt: new Date().toISOString(),
  };

  try {
    if (webhookMethod === 'GET') {
      const url = new URL(webhookUrl);
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, sanitizeForQuery(value));
      });
      await fetch(url.toString(), {
        method: 'GET',
        keepalive: true,
      });
      return;
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn(`Dropout-Webhook konnte nicht ausgelöst werden (step: ${step.id})`, error);
  }
}

function closeFunnel(step, selectedOption) {
  const defaultClosed = data?.final?.closedFunnel || {};
  funnelClosedState = {
    stepId: step.id,
    selectedOption: selectedOption.label,
    selectedOptionConfig: selectedOption,
    webhookSent: false,
    title:
      selectedOption?.closeTitle?.trim() ||
      defaultClosed?.title ||
      'Sorry, wir passen leider nicht zusammen.',
    message:
      selectedOption?.closeMessage?.trim() ||
      defaultClosed?.message ||
      'Danke für deine Ehrlichkeit. Mit dieser Auswahl können wir dich aktuell nicht weiter im Funnel berücksichtigen.',
  };
}

function renderStepAsset(step) {
  const asset = step?.asset?.trim();
  if (!asset) return '';
  return `<img class="heroImage" src="${asset}" alt="Funnel Visual für ${step.title}" />`;
}

function attachChoiceHandlers(step) {
  const buttons = app.querySelectorAll('[data-choice]');
  let autoAdvancePending = false;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (autoAdvancePending) return;
      const value = btn.dataset.choice;
      if (step.type === 'multipleChoice') {
        const selected = new Set(getStepAnswer(step) || []);
        selected.has(value) ? selected.delete(value) : selected.add(value);
        setStepAnswer(step, Array.from(selected));
        btn.classList.toggle('active', selected.has(value));
        syncNextButton(step);
        return;
      }

      buttons.forEach((button) => {
        button.classList.toggle('active', button === btn);
      });
      btn.classList.add('flash');
      setStepAnswer(step, value);
      autoAdvancePending = true;
      setTimeout(async () => {
        const selectedOption = findNormalizedOption(step, value) || normalizeChoiceOption(value);
        await triggerStepWebhook(step);
        if (step.type === 'singleChoice' && selectedOption.closeFunnel) {
          closeFunnel(step, selectedOption);
          render();
          return;
        }
        index += 1;
        render();
      }, 500);
    });
  });
}

function validateContact(form) {
  const required = ['name', 'email', 'phone', 'birthDate'];
  for (const field of required) {
    if (!form[field]?.trim()) return false;
  }
  return true;
}

function redirectToThankYouPage(payload) {
  const thankYouPayload = {
    contact: payload.contact || {},
    submittedAt: payload.submittedAt || new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(THANK_YOU_STORAGE_KEY, JSON.stringify(thankYouPayload));
  } catch (error) {
    console.warn('Danke-Seiten-Payload konnte nicht gespeichert werden.', error);
  }

  trackThankYouPage(
    {
      email: payload.contact?.email,
      phone: payload.contact?.phone,
      leadCreated: true,
    },
    trackingConfig
  );

  window.location.href = './thank-you.html';
}

function renderStep() {
  const step = data.steps[index];
  const helper = step.helperText ? `<p class="helper">${step.helperText}</p>` : '';

  let field = '';
  if (step.type === 'textarea') {
    field = `<textarea id="value" placeholder="${step.placeholder || ''}">${getStepAnswer(step) || ''}</textarea>`;
  } else if (step.type === 'text') {
    field = `<input id="value" value="${getStepAnswer(step) || ''}" placeholder="${step.placeholder || ''}" />`;
  } else if (step.type === 'singleChoice') {
    field = renderChoice(step.options || [], step.id, 'single');
  } else if (step.type === 'multipleChoice') {
    field = renderChoice(step.options || [], step.id, 'multiple');
  } else if (step.type === 'yesNo') {
    field = renderChoice(['Ja', 'Nein'], step.id, 'yesNo');
  }

  const showNext = ['textarea', 'text', 'multipleChoice'].includes(step.type);
  app.innerHTML = `
    <section class="screen">
      ${stepHeader()}
      <article class="questionCard">
        <h2>${step.question}</h2>
        ${helper}
        ${field}
      </article>
      <div class="actions">
        <button class="btn ghost" id="back" ${index === 0 ? 'disabled' : ''}>Zurück</button>
        ${showNext ? `<button class="btn primary ${hasStepValue(step) ? '' : 'isHidden'}" id="next">Weiter</button>` : ''}
      </div>
      ${renderBelowNavText(step)}
      ${renderStepAsset(step)}
    </section>
  `;

  attachChoiceHandlers(step);

  app.querySelector('#back')?.addEventListener('click', () => {
    if (index > 0) {
      index -= 1;
      render();
    }
  });

  app.querySelector('#next')?.addEventListener('click', async () => {
    let value = app.querySelector('#value')?.value?.trim();
    if (step.type === 'multipleChoice') value = getStepAnswer(step) || [];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      alert('Bitte beantworte die Frage, bevor du fortfährst.');
      return;
    }
    setStepAnswer(step, value);
    await triggerStepWebhook(step);
    index += 1;
    render();
  });

  if (['textarea', 'text'].includes(step.type)) {
    app.querySelector('#value')?.addEventListener('input', (event) => {
      setStepAnswer(step, event.target.value);
      syncNextButton(step);
    });
  }
}

function renderFinal() {
  const f = data.final;
  app.innerHTML = `
    <section class="screen">
      ${stepHeader()}
      <article class="questionCard">
        <h2>${f.description}</h2>
        <div class="formGrid">
          <label>${f.nameLabel}<input id="name" /></label>
          <label>${f.emailLabel}<input id="email" type="email" /></label>
          <label>${f.phoneLabel}<input id="phone" type="tel" /></label>
          <label>${f.birthDateLabel}<input id="birthDate" type="date" /></label>
        </div>
      </article>
      <div class="actions single">
        <button class="btn primary" id="submit">${f.submitText}</button>
      </div>
      <img class="heroImage" src="${data.hero.image}" alt="Funnel Visual" />
    </section>
  `;

  app.querySelector('#submit').addEventListener('click', async () => {
    if (leadSubmissionPending) return;

    const contact = {
      name: app.querySelector('#name').value,
      email: app.querySelector('#email').value,
      phone: app.querySelector('#phone').value,
      birthDate: app.querySelector('#birthDate').value,
    };

    if (!validateContact(contact)) {
      alert('Bitte fülle alle Kontaktfelder aus.');
      return;
    }

    const payload = {
      answersByStepId,
      answersByFieldKey: buildAnswersByFieldKey(),
      answersList: getAnswersList(),
      contact,
      submittedAt: new Date().toISOString(),
    };

    leadSubmissionPending = true;
    const submitBtn = app.querySelector('#submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';
    }

    await triggerLeadWebhook(payload);

    trackApplicationCompleted(
      {
        email: contact.email,
        phone: contact.phone,
      },
      trackingConfig
    );

    redirectToThankYouPage(payload);
  });
}

async function triggerClosedFunnelWebhookIfNeeded() {
  if (!funnelClosedState || funnelClosedState.webhookSent) return;

  const step = data.steps.find((entry) => entry.id === funnelClosedState.stepId);
  if (!step) return;

  funnelClosedState.webhookSent = true;
  await triggerStepDropoutWebhook(step, funnelClosedState.selectedOptionConfig, 'single_choice_disqualifier');
}

function renderClosedFunnel() {
  void triggerClosedFunnelWebhookIfNeeded();

  const fallbackImage = data?.hero?.image || '';
  const image = data?.final?.closedFunnel?.image?.trim() || fallbackImage;
  const title = funnelClosedState?.title || 'Sorry, wir passen leider nicht zusammen.';
  const message =
    funnelClosedState?.message ||
    'Danke für dein Interesse. Aktuell können wir dich an dieser Stelle leider nicht weiter im Prozess führen.';

  app.innerHTML = `
    <section class="screen">
      ${stepHeader()}
      <article class="questionCard">
        <h2>${title}</h2>
        <p class="muted">${message}</p>
      </article>
      ${image ? `<img class="heroImage" src="${image}" alt="Funnel geschlossen" />` : ''}
    </section>
  `;
}


function animateProgressBar() {
  const p = getProgress();
  const bar = app.querySelector('.progressBar');
  if (!bar) return;

  const from = Math.min(lastProgressValue, p.value);
  bar.style.width = `${from}%`;
  requestAnimationFrame(() => {
    bar.style.width = `${p.value}%`;
  });
  lastProgressValue = p.value;
}
function render() {
  if (!data) return;
  if (funnelClosedState) {
    renderClosedFunnel();
    animateProgressBar();
    return;
  }
  if (index < data.steps.length) {
    renderStep();
    animateProgressBar();
    return;
  }
  renderFinal();
  animateProgressBar();
}

(async () => {
  const [cfg, funnel] = await Promise.all([load('../config.json'), load('./funnel.json')]);
  applyTheme(cfg);
  trackingConfig = cfg.tracking || {};
  initTracking(trackingConfig);
  data = funnel;
  render();
})();
