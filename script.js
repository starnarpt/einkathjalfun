const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

// Re-align cross-page anchor links after images and fonts have settled.
// This keeps the sticky header from covering the requested section.
const alignHashTarget = () => {
  if (!window.location.hash) return;
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (!target) return;
  target.scrollIntoView({ block: 'start', behavior: 'auto' });
};

window.addEventListener('load', () => {
  window.setTimeout(alignHashTarget, 80);
});

const packageSelect = document.querySelector('#package-select');
document.querySelectorAll('.package-button').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('[data-package]');
    if (card && packageSelect) packageSelect.value = card.dataset.package;
  });
});

document.querySelectorAll('.training-options').forEach((group) => {
  group.querySelectorAll('.training-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      group.querySelectorAll('.training-tab').forEach((item) => {
      item.classList.toggle('active', item === tab);
      item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
      });
      group.querySelectorAll('.frequency-grid').forEach((panel) => {
        const active = panel.id === tab.dataset.target;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    });
  });
});

const personalTraining = document.querySelector('#einka-val');
personalTraining?.querySelectorAll('.commitment-button').forEach((button) => {
  button.addEventListener('click', () => {
    const months = button.dataset.months;
    personalTraining.querySelectorAll('.commitment-button').forEach((item) => {
      item.classList.toggle('active', item === button);
    });
    personalTraining.querySelectorAll('.frequency-grid article').forEach((card) => {
      const price = card.getAttribute(`data-price-${months}`);
      const priceElement = card.querySelector('div strong');
      if (price && priceElement) priceElement.textContent = price;
      const periodElement = card.querySelector('div span');
      if (periodElement) {
        const isSeasonalSoloMonth = months === '1' && card.closest('#solo-options');
        periodElement.textContent = isSeasonalSoloMonth ? 'kr. fyrsti mán.' : 'kr./mán.';
      }
      const oldPrice = card.getAttribute(`data-old-price-${months}`);
      const oldPriceElement = card.querySelector('.personal-old-price');
      if (oldPrice && oldPriceElement) oldPriceElement.textContent = oldPrice;
      const saving = card.getAttribute(`data-saving-${months}`);
      const savingElement = card.querySelector('.personal-saving');
      if (savingElement) {
        savingElement.textContent = saving ? `Þú sparar ${saving} kr. samtals` : '';
        savingElement.hidden = !saving;
      }
      const seasonalLabel = months === '1' && card.closest('#solo-options') ? ' · hausttilboð' : '';
      card.dataset.package = `${card.dataset.basePackage} · ${months} ${months === '1' ? 'mánuður' : 'mánuðir'}${seasonalLabel}`;
    });
  });
});

const form = document.querySelector('#contact-form');
const formNote = document.querySelector('#form-note');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());

  submitButton.disabled = true;
  submitButton.textContent = 'Sendi…';
  formNote.textContent = 'Sendi fyrirspurnina…';
  formNote.classList.remove('success', 'error');

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Ekki tókst að senda fyrirspurnina.');

    form.reset();
    formNote.textContent = 'Takk fyrir! Fyrirspurnin hefur verið send og Stefán hefur samband eins fljótt og auðið er.';
    formNote.classList.add('success');
  } catch (error) {
    formNote.innerHTML = 'Ekki tókst að senda í þetta sinn. Prófaðu aftur eða sendu beint á <a href="mailto:stefanarnar.pt@gmail.com">stefanarnar.pt@gmail.com</a>.';
    formNote.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Senda fyrirspurn';
  }
});
