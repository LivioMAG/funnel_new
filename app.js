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
      'Wenn du Freude an Kommunikation, Zielklarheit und Tempo hast, ist die Chance sehr hoch: ja.'
  },
  funnel: {
    introText:
      'Der Bewerbungsprozess dauert ca. 2 Minuten. Je klarer deine Antworten, desto besser können wir dich einordnen.',
    singleChoiceImageAsset: 'dummy.jpg',
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
  view: 'landing',
  stepIndex: 0,
  answers: {}
};

const app = document.getElementById('app');
const toast = document.getElementById('toast');

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
  const { landing } = state.config;

  app.innerHTML = `
    <section class="container stack">
      <article class="card stack">
        <p class="copy">${landing.companyName}</p>
        <h1 class="hero-title">${landing.jobTitle}</h1>
        <p class="hero-copy">${landing.shortPitch}</p>
        <div class="actions">
          <button type="button" class="btn btn-primary" id="start-funnel">${landing.primaryCtaText}</button>
          ${
            landing.secondaryCtaEnabled
              ? `<button type="button" class="btn btn-secondary" id="secondary-cta">${landing.secondaryCtaText}</button>`
              : ''
          }
        </div>
      </article>

      <article class="card stack">
        <h2 class="section-title">${landing.aboutTitle}</h2>
        <p class="copy">${landing.aboutText}</p>
      </article>

      <article class="card stack">
        <h2 class="section-title">${landing.expectationsTitle}</h2>
        ${createList(landing.expectationsBullets)}
      </article>

      <article class="card stack">
        <h2 class="section-title">${landing.benefitsTitle}</h2>
        ${createList(landing.benefitsBullets)}
      </article>
    </section>
  `;

  document.getElementById('start-funnel').addEventListener('click', () => {
    state.view = 'funnel';
    state.stepIndex = 0;
    renderQuestionStep(state.stepIndex);
  });

  const secondaryCta = document.getElementById('secondary-cta');
  if (secondaryCta) {
    secondaryCta.addEventListener('click', () => showToast(landing.secondaryCtaInfo));
  }
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
  let isSingleChoiceAdvancing = false;

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

        if (step.type === 'singleChoice') {
          if (isSingleChoiceAdvancing) {
            return;
          }

          isSingleChoiceAdvancing = true;
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

        if (step.type === 'singleChoice') {
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
              funnel.singleChoiceImageAsset
                ? `<img class="single-choice-image" src="./${funnel.singleChoiceImageAsset}" alt="" loading="lazy" />`
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
  setThemeVariables(state.config.theme);
  renderLanding();
}

init();
