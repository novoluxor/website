document.querySelector('#year').textContent = new Date().getFullYear();
const appNav = document.querySelector('.apps-nav');
const appToggle = appNav.querySelector('.apps-menu-toggle');
const hoverAvailable = matchMedia('(hover: hover)');
let suppressFocus = false;
function setMenu(open) {
  appNav.classList.toggle('open', open);
  appToggle.setAttribute('aria-expanded', String(open));
}
appNav.addEventListener('mouseenter', () => {if (hoverAvailable.matches) setMenu(true);});
appNav.addEventListener('mouseleave', () => {if (!appNav.contains(document.activeElement)) setMenu(false);});
appNav.addEventListener('focusin', event => {if (!suppressFocus && event.target.matches(':focus-visible')) setMenu(true);});
appNav.addEventListener('focusout', event => {if (!appNav.contains(event.relatedTarget)) setMenu(false);});
appToggle.addEventListener('click', () => setMenu(!appNav.classList.contains('open')));
document.addEventListener('click', event => {if (!appNav.contains(event.target)) setMenu(false);});
appNav.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();setMenu(false);suppressFocus = true;appToggle.focus();suppressFocus = false;
  }
  if (event.key === 'ArrowDown' && event.target === appToggle) {
    event.preventDefault();setMenu(true);appNav.querySelector('.apps-dropdown a').focus();
  }
});
const currentPath = location.pathname.replace(/\/$/, '') || '/';
document.querySelectorAll('.nav-links a').forEach(link => {
  if ((new URL(link.href).pathname.replace(/\/$/, '') || '/') === currentPath) link.setAttribute('aria-current', 'page');
});
const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  cards.forEach(card => {card.hidden = category !== 'all' && card.dataset.category !== category;});
  const count = cards.filter(card => !card.hidden).length;
  document.querySelector('#catalog-count').textContent = `${count} ${count === 1 ? 'app' : 'apps'}`;
}));
