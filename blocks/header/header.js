import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');
function waitForFormLoad(selector, callback) {
  const interval = setInterval(() => {
    const form = document.querySelector(selector);
    if (form) {
      clearInterval(interval);
      callback(form);
    }
  }, 20);
}

function initModalForms() {
  [
    { selector: '.form.navform.block', triggerText: 'sign up' },
    { selector: '.form.reservation.block', triggerText: 'reservation' },
  ].forEach(({ selector, triggerText }) => {
    waitForFormLoad(selector, (formBlock) => {
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';

      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.className = 'modal-close';

      closeBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
        formBlock.style.display = 'none';
        document.body.style.overflow = '';
      });

      formBlock.style.display = 'none';

      const heading = formBlock.querySelector('h2');
      if (heading) {
        heading.remove();
        modalContent.appendChild(heading);
      }

      modalContent.appendChild(closeBtn);
      modalContent.appendChild(formBlock);
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      //  Find the <li> matching nav item by text
      const navItem = Array.from(document.querySelectorAll('nav ul li')).find(
        (li) => li.textContent.trim().toLowerCase() === triggerText,
      );

      if (navItem) {
        navItem.style.cursor = 'pointer';
        navItem.addEventListener('click', (e) => {
          e.preventDefault();
          modalOverlay.style.display = 'flex';
          formBlock.style.display = 'block';
          document.body.style.overflow = 'hidden';
        });
      }

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.style.display = 'none';
          formBlock.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    });
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');

  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!isDesktop.matches) {
    navSections.classList.add('nav-mobile');
  } else {
    navSections.classList.remove('nav-mobile');
  }

  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

// === CART BADGE UTILITY FUNCTIONS MOVED OUT ===
function getCartItems() {
  return JSON.parse(localStorage.getItem('cartItems')) || [];
}

function updateCartBadge(badge) {
  const cartItems = getCartItems();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'block' : 'none';
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // === CART BADGE LOGIC START ===
  const navCartLi = nav.querySelector('.nav-sections .default-content-wrapper > ul > li a[title="🛒"]')?.parentElement;
  if (navCartLi) {
    let badge = navCartLi.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      navCartLi.appendChild(badge);
    }
    const update = () => updateCartBadge(badge);
    window.addEventListener('cartUpdated', update);
    window.addEventListener('storage', (e) => {
      if (e.key === 'cartItems') update();
    });
    document.addEventListener('DOMContentLoaded', update);
    update(); // initial call
  }
  initModalForms();

  // === CART IN NAVBAR ===
  setTimeout(() => {
    const navCard = document.querySelector('.header .nav-wrapper nav');
    if (!navCard) return;
    // Find the cart item in the nav menu (mobile/desktop)
    const cartMenuItem = nav.querySelector('.nav-sections ul li a[title="🛒"]')?.parentElement;
    if (cartMenuItem) {
      // Clone the cart icon + badge
      const cartClone = cartMenuItem.cloneNode(true);
      cartClone.classList.add('nav-cart');
      // Remove aria attributes for the navbar version
      cartClone.removeAttribute('aria-expanded');
      // Insert the cart icon into the navbar (after brand)
      const navbrand = nav.querySelector('.nav-brand');
      if (navbrand) {
        navBrand.parentNode.insertBefore(cartClone, navbrand.nextSibling);
      }
      // Make sure clicking the navbar cart navigates to cart page
      const cartLink = cartClone.querySelector('a[title="🛒"]');
      if (cartLink) {
        cartLink.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/cart';
        });
      }
      // Keep badge updated
      const badge = cartClone.querySelector('.cart-badge');
      if (badge) {
        updateCartBadge(badge);
        window.addEventListener('storage', () => updateCartBadge(badge));
        document.addEventListener('cart-updated', () => updateCartBadge(badge));
      }
    }
  }, 500);
}
