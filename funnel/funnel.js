const app = document.getElementById('app');
let data, index = 0, answers = {};
const load = (p) => fetch(p, { cache: 'no-store' }).then((r) => r.json());

function applyTheme(cfg) {
  const t = cfg.theme || {}, ty = cfg.typography || {};
  const map = {'--primary':t.primaryColor,'--text':t.textColor,'--bg':t.backgroundColor,'--card':t.cardBackgroundColor,'--muted':t.mutedTextColor,'--border':t.borderColor,'--btnText':t.primaryButtonTextColor,'--font':ty.fontFamily,'--base':ty.baseSize,'--h1':ty.h1Size};
  Object.entries(map).forEach(([k,v]) => v && document.documentElement.style.setProperty(k,v));
}

function render() {
  const steps = data.steps;
  if (index < steps.length) {
    const s = steps[index];
    const field = s.type === 'textarea'
      ? `<textarea id="value" placeholder="${s.placeholder || ''}">${answers[s.fieldKey] || ''}</textarea>`
      : s.type === 'singleChoice'
      ? `<select id="value"><option value="">Bitte wählen</option>${(s.options || []).map((o) => `<option ${answers[s.fieldKey]===o?'selected':''}>${o}</option>`).join('')}</select>`
      : `<input id="value" value="${answers[s.fieldKey] || ''}" placeholder="${s.placeholder || ''}" />`;
    app.innerHTML = `<h1>${s.title}</h1><p>${s.question}</p><p class="muted">${data.introText}</p><label>Antwort</label>${field}<div class="actions"><button class="btn ghost" ${index===0?'disabled':''} id="back">Zurück</button><button class="btn primary" id="next">Weiter</button></div>`;
    document.getElementById('back').onclick = () => { if (index > 0) { index--; render(); } };
    document.getElementById('next').onclick = () => {
      const v = document.getElementById('value').value.trim();
      if (!v) return alert('Bitte Feld ausfüllen');
      answers[s.fieldKey] = v;
      index++;
      render();
    };
    return;
  }
  const f = data.final;
  app.innerHTML = `<h1>${f.title}</h1><p>${f.description}</p><label>${f.nameLabel}</label><input id="name" /><label>${f.emailLabel}</label><input id="email" type="email" /><div class="actions"><button class="btn primary" id="submit">${f.submitText}</button></div>`;
  document.getElementById('submit').onclick = () => {
    app.innerHTML = `<h1>${f.thankYouTitle}</h1><p>${f.thankYouText}</p><pre>${JSON.stringify(answers, null, 2)}</pre><a class="btn primary" href="../index.html">Zur Startseite</a>`;
  };
}

(async () => {
  const [cfg, funnel] = await Promise.all([load('../config.json'), load('./funnel.json')]);
  applyTheme(cfg);
  data = funnel;
  render();
})();
