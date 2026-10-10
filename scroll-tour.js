import {scrollState, releaseOpacity} from './scroll-state.mjs';
const story = document.querySelector('#scroll-story');
const phone = document.querySelector('#story-phone');
const chapters = [...story.querySelectorAll('.story-chapter')];
const screens = [...phone.querySelectorAll('.story-screen')];
const buttons = [...document.querySelectorAll('[data-go]')];
const experience = document.querySelector('.product-experience');
const hero = document.querySelector('.product-hero');
const device = document.querySelector('.story-device');
const details = document.querySelector('.product-page #details');
const dock = document.querySelector('.device-dock');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const names = screens.map(screen => screen.dataset.label);
let centers = [], scheduled = false, active = -1;
let docking = {start:0, distance:1, x:0, y:0, startScale:1};
function measure() {
  const offset = window.scrollY;
  centers = chapters.map(chapter => {const rect = chapter.getBoundingClientRect();return rect.top + offset + rect.height / 2;});
  if (experience && window.innerWidth > 1000) {
    const rect = story.getBoundingClientRect();
    const mobile = window.innerWidth <= 760;
    const headerHeight = document.querySelector('header').getBoundingClientRect().height;
    docking = {
      start: hero.getBoundingClientRect().top + offset - headerHeight,
      distance: hero.offsetHeight * .85,
      x: mobile ? 0 : rect.left + rect.width * .75 + 10 - window.innerWidth / 2,
      y: mobile ? Math.max(0, (window.innerHeight <= 700 ? 185 + 335 / 2 : 200 + 425 / 2) - (window.innerHeight - headerHeight) / 2) : 0,
      startScale: mobile ? 1 : Math.min(1.07, Math.max(.62,(window.innerHeight - 330) / 620))
    };
  }
  requestRender();
}
function render() {
  scheduled = false;
  if (experience && window.innerWidth > 1000) {
    const exitOpacity = releaseOpacity(details.getBoundingClientRect().top, window.innerHeight);
    experience.style.setProperty('--device-exit-opacity', String(reduced.matches ? Number(exitOpacity > 0) : exitOpacity));
    dock.inert = exitOpacity === 0;
    dock.setAttribute('aria-hidden', String(exitOpacity === 0));

    const progress = Math.max(0, Math.min(1, (window.scrollY - docking.start) / docking.distance));
    const ease = progress * progress * (3 - 2 * progress);
    // Reduced-motion users get a static docking change rather than a moving device.
    const movement = reduced.matches ? Number(progress >= .5) : ease;
    experience.style.setProperty('--dock-x', `${docking.x * movement}px`);
    experience.style.setProperty('--dock-y', `${docking.y * movement - (window.innerWidth > 1000 ? 25 * (1 - movement) : 0)}px`);
    experience.style.setProperty('--dock-scale', String(docking.startScale + (1 - docking.startScale) * movement));
    experience.style.setProperty('--docked', String(ease));
    experience.style.setProperty('--halo', String(.55 * (1 - ease)));
    experience.style.setProperty('--stage-opacity', String(1 - ease));
    experience.style.setProperty('--hero-opacity', String(Math.max(0, 1 - progress * 2.5)));
    experience.style.setProperty('--features-opacity', String(reduced.matches ? 1 : .25 + ease * .75));
    experience.style.setProperty('--features-y', '0px');
  }
  const compact=window.innerWidth <= 1000;
  const {index, rotation, local} = scrollState(window.scrollY + window.innerHeight / 2, centers);
  const deviceIndex=compact?0:index;
  const deviceRotation=compact || reduced.matches?0:rotation;
  phone.style.setProperty('--rotation', `${deviceRotation}deg`);
  window.dispatchEvent(new CustomEvent('device-scene-update',{detail:{index:deviceIndex,rotation:deviceRotation,reduced:reduced.matches || compact}}));
  device.style.setProperty('--shadow-scale', String(.65 + .35 * Math.abs(Math.cos(rotation * Math.PI / 180))));
  if (active !== deviceIndex) {
    active = deviceIndex;
    document.querySelectorAll('.mac-scene').forEach((screen,i) => screen.classList.toggle('active',i===deviceIndex));
    screens.forEach((screen,i) => {screen.classList.toggle('active',i===deviceIndex);screen.setAttribute('aria-hidden',String(i!==deviceIndex));});
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i===deviceIndex)));
    document.querySelector('#story-caption').textContent = names[deviceIndex];
  }
  // Keep the home views at the top; detail screens are presented on app pages.
  const scroll = screens[index].querySelector('.phone-scroll');
  if (scroll) scroll.scrollTop = 0;
  const bar = screens[index].querySelector('.progress i');
  if (bar) bar.style.width = `${22 + local * 12}%`;
  screens[index].style.setProperty('--wave-scale',String(.4+local*.6));
}
function requestRender() {if (!scheduled) {scheduled = true;requestAnimationFrame(render);}}
buttons.forEach((button,i) => button.addEventListener('click',() => window.scrollTo({top:centers[i]-window.innerHeight/2,behavior:reduced.matches?'instant':'smooth'})));
window.addEventListener('scroll',requestRender,{passive:true});
window.addEventListener('resize',measure);
reduced.addEventListener('change',requestRender);
// On compact screens the hero owns the devices; each feature has its own
// inline preview. Restore the original slot when returning to desktop.
const compactQuery=matchMedia('(max-width: 1000px)');
const originalSlot=document.createComment('Desktop device position');
device.before(originalSlot);
function arrangeCompact(){
 if(compactQuery.matches && dock){dock.inert=false;dock.setAttribute('aria-hidden','false');}
 if(hero && compactQuery.matches)hero.insertBefore(device,hero.querySelector('.stage-copy'));
 else originalSlot.after(device);
 measure();
}
compactQuery.addEventListener('change',arrangeCompact);
arrangeCompact();
new ResizeObserver(measure).observe(story);
measure();
