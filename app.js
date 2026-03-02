const state = {
  currentStep: 0,
  selected: {}
};

const el = {
  brand: document.getElementById('brand'),
  progressLabel: document.getElementById('progress-label'),
  progressFill: document.getElementById('progress-fill'),
  title: document.getElementById('title'),
  subtitle: document.getElementById('subtitle'),
  options: document.getElementById('options'),
  nextBtn: document.getElementById('next-btn'),
  footerNote: document.getElementById('footer-note')
};

const textWithTokens = (template, values) =>
  template.replace(/\{(\w+)\}/g, (_, token) => values[token] ?? '');

const render = (content) => {
  const { steps, meta } = content;
  const total = steps.length;
  const step = steps[state.currentStep];

  if (!step) {
    el.title.textContent = meta.completionTitle;
    el.subtitle.textContent = meta.completionSubtitle;
    el.options.innerHTML = '';
    el.nextBtn.hidden = true;
    el.progressLabel.textContent = textWithTokens(meta.progressLabel, {
      current: total,
      total
    });
    el.progressFill.style.width = '100%';
    return;
  }

  el.brand.textContent = meta.brand;
  el.footerNote.textContent = meta.footerNote;
  el.title.textContent = step.title;
  el.subtitle.textContent = step.subtitle;

  const currentDisplay = state.currentStep + 1;
  el.progressLabel.textContent = textWithTokens(meta.progressLabel, {
    current: currentDisplay,
    total
  });
  el.progressFill.style.width = `${(currentDisplay / total) * 100}%`;

  el.options.innerHTML = '';
  step.options.forEach((optionValue) => {
    const button = document.createElement('button');
    button.className = 'option';
    button.type = 'button';
    button.textContent = optionValue;

    if (state.selected[step.id] === optionValue) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      state.selected[step.id] = optionValue;
      render(content);
    });

    el.options.appendChild(button);
  });

  const isLastStep = state.currentStep === total - 1;
  el.nextBtn.textContent = isLastStep ? meta.submitButton : meta.nextButton;
  el.nextBtn.disabled = !state.selected[step.id];
  el.nextBtn.hidden = false;
};

const init = async () => {
  const response = await fetch('./content.json');
  const content = await response.json();

  el.nextBtn.addEventListener('click', () => {
    state.currentStep += 1;
    render(content);
  });

  render(content);
};

init();
