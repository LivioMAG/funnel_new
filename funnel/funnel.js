const app = document.getElementById('app');
let data;
let index = 0;
const answers = {};

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

function renderChoice(options, key, multiple = false) {
  const current = answers[key] || (multiple ? [] : '');
  return `
    <div class="choiceGrid ${multiple ? 'multiple' : ''}">
      ${
        options
          .map((opt) => {
            const active = multiple ? current.includes(opt) : current === opt;
            return `<button type="button" class="choiceBtn ${active ? 'active' : ''}" data-choice="${opt}">${opt}</button>`;
          })
          .join('')
      }
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
    field = renderChoice(step.options || [], step.fieldKey);
  } else if (step.type === 'multipleChoice') {
    field = renderChoice(step.options || [], step.fieldKey, true);
  } else if (step.type === 'yesNo') {
    field = renderChoice(['Ja', 'Nein'], step.fieldKey);
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
        ${showNext ? '<button class="btn primary" id="next">Weiter</button>' : ''}
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

function renderHero() {
  const h = data.hero;
  app.innerHTML = `
    <section class="screen heroScreen">
      <span class="badge">${h.badge}</span>
      <h1>${h.title}</h1>
      <p class="muted">${h.description}</p>
      <img class="heroImage" src="${h.image}" alt="Funnel Start" />
      <button class="btn primary large" id="start">Funnel starten</button>
    </section>
  `;
  app.querySelector('#start').addEventListener('click', () => render());
}

function render() {
  if (!data) return;
  if (!app.dataset.started) {
    app.dataset.started = '1';
    renderHero();
    return;
  }
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
