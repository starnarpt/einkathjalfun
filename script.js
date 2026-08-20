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
      card.dataset.package = `${card.dataset.basePackage} · ${months} ${months === '1' ? 'mánuður' : 'mánuðir'}`;
    });
  });
});

const form = document.querySelector('#contact-form');
const formNote = document.querySelector('#form-note');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name') || '';
  const email = data.get('email') || '';
  const phone = data.get('phone') || 'Ekki gefið upp';
  const selectedPackage = data.get('package') || 'Ekki valið';
  const location = data.get('location') || 'Ekki valið';
  const goals = data.get('goals') || '';
  const subject = `Fyrirspurn frá ${name} — SA Fitness`;
  const body = [
    `Nafn: ${name}`,
    `Netfang: ${email}`,
    `Símanúmer: ${phone}`,
    `Þjónusta: ${selectedPackage}`,
    `Stöð: ${location}`,
    '',
    'Markmið:',
    goals,
  ].join('\n');

  formNote.textContent = 'Tölvupóstforritið þitt opnast nú með tilbúinni fyrirspurn. Ýttu þar á Senda til að ljúka.';
  formNote.classList.add('success');
  window.location.href = `mailto:stefanarnar.pt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
