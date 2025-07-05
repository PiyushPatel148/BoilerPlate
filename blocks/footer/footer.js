import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  // Adding the class names for the CSS
  const footerLists = footer.querySelectorAll('ul');
  footerLists.forEach((ul) => {
    ul.classList.add('footer-list');

    // Only direct <li> children of this <ul>
    ul.querySelectorAll(':scope > li').forEach((li) => {
      li.classList.add('footer-heading');

      // If this <li> contains a nested <ol>, decorate it
      li.querySelectorAll('ol').forEach((ol) => {
        ol.classList.add('footer-sublist');

        // Also add class to its <li> children
        ol.querySelectorAll('li').forEach((subLi) => {
          subLi.classList.add('footer-subitem');
        });
      });

      // Also check for nested <ul> and decorate them too
      li.querySelectorAll('ul').forEach((nestedUl) => {
        nestedUl.classList.add('footer-sublist');

        nestedUl.querySelectorAll('li').forEach((subLi) => {
          subLi.classList.add('footer-subitem');
        });
      });
    });
  });

  block.append(footer);
}
