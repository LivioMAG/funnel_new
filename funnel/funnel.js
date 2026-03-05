const app = document.getElementById('app');
let data;
let index = 0;
const answers = {};

const load = (p) => fetch(p, { cache: 'no-store' }).then((r) => r.json());
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

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

function appHeader(title) {
  const p = getProgress();
  return `
    <header class="appHeader">
      <span class="badge">${escapeHtml(data.hero.badge)}</span>
      <h1>${escapeHtml(title)}</h1>
      <p class="muted">${escapeHtml(data.introText)}</p>
      <div class="progressWrap">
        <div class="progressMeta">
          <span>Schritt ${p.active} von ${p.total}</span>
          <strong>${p.value}%</strong>
        </div>
        <div class="progressTrack"><div class="progressBar" style="width:${p.value}%"></div></div>
      </div>
    </header>
  `;
}

function renderChoice(options, key, multiple = false) {
  const current = answers[key] || (multiple ? [] : '');
  return `
    <div class="choiceGrid ${multiple ? 'multiple' : ''}">
      ${options
        .map((opt) => {
          const active = multiple ? current.includes(opt) : current === opt;
          return `<button type="button" class="choiceBtn ${active ? 'active' : ''}" data-choice="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
        })
        .join('')}
    </div>
  `;
}

function attachChoiceHandlers(step) {
  const buttons = app.querySelectorAll('[data-choice]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.choice;
      if (step.type === 'multipleChoice') {
        const selected = new Set(answers[step.fieldKey] || []);
        selected.has(value) ? selected.delete(value) : selected.add(value);
        answers[step.fieldKey] = Array.from(selected);
        render();
        return;
      }
      answers[step.fieldKey] = value;
      index += 1;
      render();
    });
  });
}

function validateContact(form) {
  const required = ['name', 'email', 'phone', 'birthDate'];
  return required.every((field) => form[field]?.trim());
}

function summaryRows(contact) {
  const answerRows = data.steps
    .map((step) => {
      const value = answers[step.fieldKey];
      if (!value || (Array.isArray(value) && value.length === 0)) return '';
      const formatted = Array.isArray(value) ? value.join(', ') : value;
      return `<li><strong>${escapeHtml(step.question)}:</strong><span>${escapeHtml(formatted)}</span></li>`;
    })
    .join('');

  return `${answerRows}
    <li><strong>${escapeHtml(data.final.nameLabel)}:</strong><span>${escapeHtml(contact.name)}</span></li>
    <li><strong>${escapeHtml(data.final.emailLabel)}:</strong><span>${escapeHtml(contact.email)}</span></li>
    <li><strong>${escapeHtml(data.final.phoneLabel)}:</strong><span>${escapeHtml(contact.phone)}</span></li>
    <li><strong>${escapeHtml(data.final.birthDateLabel)}:</strong><span>${escapeHtml(contact.birthDate)}</span></li>`;
}

function openSummaryModal(contact) {
  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.innerHTML = `
    <div class="modalCard">
      <h2>${escapeHtml(data.final.summaryTitle)}</h2>
      <p class="muted">Vielen Dank! Das wurde für dich erfasst:</p>
      <ul class="summaryList">${summaryRows(contact)}</ul>
      <button class="btn primary" id="closeSummary">Schliessen</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#closeSummary')?.addEventListener('click', () => modal.remove());
}

function renderStep() {
  const step = data.steps[index];
  const helper = step.helperText ? `<p class="helper">${escapeHtml(step.helperText)}</p>` : '';

  let field = '';
  if (step.type === 'textarea') {
    field = `<textarea id="value" placeholder="${escapeHtml(step.placeholder || '')}">${escapeHtml(answers[step.fieldKey] || '')}</textarea>`;
  } else if (step.type === 'text') {
    field = `<input id="value" value="${escapeHtml(answers[step.fieldKey] || '')}" placeholder="${escapeHtml(step.placeholder || '')}" />`;
  } else if (step.type === 'singleChoice') {
    field = renderChoice(step.options || [], step.fieldKey);
  } else if (step.type === 'multipleChoice') {
    field = renderChoice(step.options || [], step.fieldKey, true);
  } else if (step.type === 'yesNo') {
    field = renderChoice(['Ja', 'Nein'], step.fieldKey);
  }

  const showNext = ['textarea', 'text', 'multipleChoice'].includes(step.type);
  app.innerHTML = `
    <section class="screen">
      ${appHeader(step.title)}
      <article class="questionCard">
        <h2>${escapeHtml(step.question)}</h2>
        ${helper}
        ${field}
      </article>
      <div class="actions">
        <button class="btn ghost" id="back" ${index === 0 ? 'disabled' : ''}>Zurück</button>
        ${showNext ? '<button class="btn primary" id="next">Weiter</button>' : ''}
      </div>
      <img class="heroImage" src="${escapeHtml(data.hero.image)}" alt="Funnel Visual" />
    </section>
  `;

  attachChoiceHandlers(step);

  app.querySelector('#back')?.addEventListener('click', () => {
    if (index > 0) {
      index -= 1;
      render();
    }
  });

  app.querySelector('#next')?.addEventListener('click', () => {
    let value = app.querySelector('#value')?.value?.trim();
    if (step.type === 'multipleChoice') value = answers[step.fieldKey] || [];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      alert('Bitte beantworte die Frage, bevor du fortfährst.');
      return;
    }
    answers[step.fieldKey] = value;
    index += 1;
    render();
  });
}

function renderFinal() {
  const f = data.final;
  app.innerHTML = `
    <section class="screen">
      ${appHeader(f.title)}
      <article class="questionCard">
        <h2>${escapeHtml(f.description)}</h2>
        <div class="formGrid">
          <label>${escapeHtml(f.nameLabel)}<input id="name" /></label>
          <label>${escapeHtml(f.emailLabel)}<input id="email" type="email" /></label>
          <label>${escapeHtml(f.phoneLabel)}<input id="phone" type="tel" /></label>
          <label>${escapeHtml(f.birthDateLabel)}<input id="birthDate" type="date" /></label>
        </div>
      </article>
      <div class="actions single">
        <button class="btn primary" id="submit">${escapeHtml(f.submitText)}</button>
      </div>
      <img class="heroImage" src="${escapeHtml(data.hero.image)}" alt="Funnel Visual" />
    </section>
  `;

  app.querySelector('#submit')?.addEventListener('click', () => {
    const contact = {
      name: app.querySelector('#name')?.value || '',
      email: app.querySelector('#email')?.value || '',
      phone: app.querySelector('#phone')?.value || '',
      birthDate: app.querySelector('#birthDate')?.value || '',
    };

    if (!validateContact(contact)) {
      alert('Bitte fülle alle Kontaktfelder aus.');
      return;
    }

    openSummaryModal(contact);
  });
}

function render() {
  if (!data) return;
  if (index < data.steps.length) {
    renderStep();
    return;
  }
  renderFinal();
}

(async () => {
  const [cfg, funnel] = await Promise.all([load('../config.json'), load('./funnel.json')]);
  applyTheme(cfg);
  data = funnel;
  render();
})();
