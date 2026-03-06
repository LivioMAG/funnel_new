const app = document.getElementById('app');
let data;
let index = 0;
const answers = {};
let lastProgressValue = 0;

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

function stepHeader(title) {
  const p = getProgress();
  return `
    <div class="progressWrap">
      <div class="progressMeta">
        <span>Schritt ${p.active} von ${p.total}</span>
        <strong>${p.value}%</strong>
      </div>
      <div class="progressTrack"><div class="progressBar" style="width:${p.value}%"></div></div>
    </div>
    <h1>${title}</h1>
    <p class="muted">${data.introText}</p>
  `;
}

function hasStepValue(step) {
  const value = answers[step.fieldKey];
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function renderChoice(options, key, mode = 'single') {
  const multiple = mode === 'multiple';
  const showIndicator = mode !== 'yesNo';
  const current = answers[key] || (multiple ? [] : '');
  return `
    <div class="choiceGrid ${mode}">
      ${
        options
          .map((opt) => {
            const active = multiple ? current.includes(opt) : current === opt;
            const icon = mode === 'yesNo' ? (opt === 'Ja' ? '✓' : '✕') : '';
            return `<button type="button" class="choiceBtn ${active ? 'active' : ''}" data-choice="${opt}">${
              icon ? `<span class="choiceIcon" aria-hidden="true">${icon}</span>` : ''
            }${
              showIndicator
                ? '<span class="choiceIndicator" aria-hidden="true"><span class="choiceDot"></span></span>'
                : ''
            }<span class="choiceLabel">${opt}</span></button>`;
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

  const payload = {
    stepId: step.id,
    fieldKey: step.fieldKey,
    answer: answers[step.fieldKey],
    answers,
    triggeredAt: new Date().toISOString(),
  };

  try {
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

function attachChoiceHandlers(step) {
  const buttons = app.querySelectorAll('[data-choice]');
  let autoAdvancePending = false;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (autoAdvancePending) return;
      const value = btn.dataset.choice;
      if (step.type === 'multipleChoice') {
        const selected = new Set(answers[step.fieldKey] || []);
        selected.has(value) ? selected.delete(value) : selected.add(value);
        answers[step.fieldKey] = Array.from(selected);
        btn.classList.toggle('active', selected.has(value));
        syncNextButton(step);
        return;
      }

      buttons.forEach((button) => {
        button.classList.toggle('active', button === btn);
      });
      btn.classList.add('flash');
      answers[step.fieldKey] = value;
      autoAdvancePending = true;
      setTimeout(async () => {
        await triggerStepWebhook(step);
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

function openSummaryModal(payload) {
  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.innerHTML = `
    <div class="modalCard">
      <h2>${data.final.summaryTitle}</h2>
      <p class="muted">Vielen Dank! Wir haben folgende Daten erfasst:</p>
      <pre>${JSON.stringify(payload, null, 2)}</pre>
      <button class="btn primary" id="closeSummary">Schliessen</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#closeSummary').addEventListener('click', () => modal.remove());
}

function renderStep() {
  const step = data.steps[index];
  const helper = step.helperText ? `<p class="helper">${step.helperText}</p>` : '';

  let field = '';
  if (step.type === 'textarea') {
    field = `<textarea id="value" placeholder="${step.placeholder || ''}">${answers[step.fieldKey] || ''}</textarea>`;
  } else if (step.type === 'text') {
    field = `<input id="value" value="${answers[step.fieldKey] || ''}" placeholder="${step.placeholder || ''}" />`;
  } else if (step.type === 'singleChoice') {
    field = renderChoice(step.options || [], step.fieldKey, 'single');
  } else if (step.type === 'multipleChoice') {
    field = renderChoice(step.options || [], step.fieldKey, 'multiple');
  } else if (step.type === 'yesNo') {
    field = renderChoice(['Ja', 'Nein'], step.fieldKey, 'yesNo');
  }

  const showNext = ['textarea', 'text', 'multipleChoice'].includes(step.type);
  app.innerHTML = `
    <section class="screen">
      ${stepHeader(step.title)}
      <article class="questionCard">
        <h2>${step.question}</h2>
        ${helper}
        ${field}
      </article>
      <div class="actions">
        <button class="btn ghost" id="back" ${index === 0 ? 'disabled' : ''}>Zurück</button>
        ${showNext ? `<button class="btn primary ${hasStepValue(step) ? '' : 'isHidden'}" id="next">Weiter</button>` : ''}
      </div>
      <img class="heroImage" src="${data.hero.image}" alt="Funnel Visual" />
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
    if (step.type === 'multipleChoice') value = answers[step.fieldKey] || [];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      alert('Bitte beantworte die Frage, bevor du fortfährst.');
      return;
    }
    answers[step.fieldKey] = value;
    await triggerStepWebhook(step);
    index += 1;
    render();
  });

  if (['textarea', 'text'].includes(step.type)) {
    app.querySelector('#value')?.addEventListener('input', (event) => {
      answers[step.fieldKey] = event.target.value;
      syncNextButton(step);
    });
  }
}

function renderFinal() {
  const f = data.final;
  app.innerHTML = `
    <section class="screen">
      ${stepHeader(f.title)}
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

  app.querySelector('#submit').addEventListener('click', () => {
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
      answers,
      contact,
      submittedAt: new Date().toISOString(),
    };
    openSummaryModal(payload);
  });
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
  data = funnel;
  render();
})();
