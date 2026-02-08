const routes = {
  '/home': renderHome,
  '/services': renderServices,
  '/about': renderAbout,
  '/contact': renderContact,
};

const servicesData = [
  {
    title: 'UX Audit',
    desc: 'Қолданушы жолын талдап, конверсияға кедергі болатын жерлерді табамыз.',
  },
  {
    title: 'Design System',
    desc: 'Бірегей UI кит пен компоненттер арқылы жылдам дизайн жасаймыз.',
  },
  {
    title: 'Landing Pages',
    desc: 'Нақты мақсатқа бағытталған лендингтерді құрастырамыз.',
  },
  {
    title: 'Mobile UI',
    desc: 'Қолайлы мобильді интерфейстерді жобалаймыз.',
  },
  {
    title: 'Brand Refresh',
    desc: 'Брендтің визуалын жаңартып, тартымдылығын арттырамыз.',
  },
  {
    title: 'Support',
    desc: 'Дизайнды қолдау және үздіксіз жақсарту қызметі.',
  },
];

const app = document.getElementById('app');
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const toast = document.getElementById('toast');
const backToTop = document.getElementById('backToTop');

function getRoute() {
  const hash = window.location.hash || '#/home';
  const route = hash.replace('#', '');
  return route.startsWith('/') ? route : `/${route}`;
}

function renderRoute() {
  const route = getRoute();
  const view = routes[route] || renderNotFound;
  app.innerHTML = '';
  view();
  updateActiveLink(route);
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActiveLink(route) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    const target = `/${link.dataset.link}`;
    if (target === route) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function closeMenu() {
  nav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
  const isOpen = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(isOpen));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function saveRequest(data) {
  const stored = JSON.parse(localStorage.getItem('requests') || '[]');
  stored.push({ ...data, date: new Date().toISOString() });
  localStorage.setItem('requests', JSON.stringify(stored));
}

async function submitRequest(data) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Server error');
  }

  return response.json();
}

function renderHome() {
  const section = document.createElement('section');
  section.className = 'hero';
  section.innerHTML = `
    <div class="hero-card">
      <h1>Бір терезе. Барлық цифрлық шешім.</h1>
      <p>Біз заманауи дизайн мен сенімді техникалық іске асыру арқылы бизнесіңізді жаңа деңгейге көтереміз.</p>
      <a class="btn" href="#/contact">Хабарласу</a>
    </div>
    <div class="hero-card">
      <h2>Неліктен біз?</h2>
      <p>Қысқа мерзім, ашық коммуникация және нақты нәтиже. Әр жобаға жеке көзқарас.</p>
      <a class="btn secondary" href="#/services">Қызметтер</a>
    </div>
  `;
  app.appendChild(section);
}

function renderServices() {
  const section = document.createElement('section');
  section.innerHTML = `
    <h2 class="section-title">Қызметтер</h2>
    <div class="grid" id="servicesGrid"></div>
  `;
  app.appendChild(section);

  const grid = document.getElementById('servicesGrid');
  servicesData.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${item.title}</h3><p>${item.desc}</p>`;
    grid.appendChild(card);
  });
}

function renderAbout() {
  const section = document.createElement('section');
  section.innerHTML = `
    <h2 class="section-title">Біз туралы</h2>
    <div class="card">
      <p>Командамыз дизайн мен әзірлеу бағытында 5+ жылдық тәжірибеге ие. Әр клиент үшін жеке шешім ұсынамыз.</p>
    </div>
    <div class="timeline">
      <div class="timeline-item">
        <strong>2020</strong> — Алғашқы жобалар мен стартап серіктестіктері.
      </div>
      <div class="timeline-item">
        <strong>2022</strong> — 50+ клиент және жеке дизайн жүйеміз.
      </div>
      <div class="timeline-item">
        <strong>2024</strong> — Халықаралық жобалармен жұмыс.
      </div>
      <div class="timeline-item">
        <strong>2026</strong> — Жаңа өнімдер және тұрақты даму.
      </div>
    </div>
  `;
  app.appendChild(section);
}

function renderContact() {
  const section = document.createElement('section');
  section.innerHTML = `
    <h2 class="section-title">Байланыс</h2>
    <div class="card">
      <form class="form" id="contactForm" novalidate>
        <div class="input-group" data-field="name">
          <label for="name">Аты-жөні</label>
          <input type="text" id="name" name="name" placeholder="Аты-жөніңіз" />
          <small>Атыңызды енгізіңіз.</small>
        </div>
        <div class="input-group" data-field="phone">
          <label for="phone">Телефон</label>
          <input type="tel" id="phone" name="phone" placeholder="87001234567" />
          <small>Телефон тек сан болуы керек, min 10 цифр.</small>
        </div>
        <div class="input-group" data-field="message">
          <label for="message">Хабарлама</label>
          <textarea id="message" name="message" rows="4" placeholder="Хабарлама"></textarea>
          <small>Хабарлама бос болмауы керек.</small>
        </div>
        <button class="btn" type="submit">Жіберу</button>
      </form>
    </div>
  `;
  app.appendChild(section);

  const form = document.getElementById('contactForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name').trim(),
      phone: formData.get('phone').trim(),
      message: formData.get('message').trim(),
    };

    const errors = validateForm(payload);
    updateFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        await submitRequest(payload);
        saveRequest(payload);
        showToast('Сұраныс қабылданды!');
        form.reset();
      } catch (err) {
        saveRequest(payload);
        showToast('Сервер жоқ, сұраныс локалды сақталды.');
        form.reset();
      }
    }
  });
}

function validateForm(data) {
  const errors = {};
  if (!data.name) errors.name = 'required';
  if (!data.message) errors.message = 'required';
  if (!data.phone) {
    errors.phone = 'required';
  } else if (!/^\d+$/.test(data.phone)) {
    errors.phone = 'digits';
  } else if (data.phone.length < 10) {
    errors.phone = 'min';
  }
  return errors;
}

function updateFormErrors(errors) {
  document.querySelectorAll('.input-group').forEach((group) => {
    const field = group.dataset.field;
    if (errors[field]) {
      group.classList.add('invalid');
    } else {
      group.classList.remove('invalid');
    }
  });
}

function renderNotFound() {
  const section = document.createElement('section');
  section.innerHTML = `
    <div class="card">
      <h2>404 — Not Found</h2>
      <p>Кешіріңіз, бұл бет табылмады. Басты бетке оралыңыз.</p>
      <a class="btn" href="#/home">Home</a>
    </div>
  `;
  app.appendChild(section);
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('load', renderRoute);

burger.addEventListener('click', toggleMenu);

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
