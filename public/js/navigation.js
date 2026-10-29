// Top tabs: Setup / Dashboard / Extension.
import { $ } from './utils.js';

export function initNavigation() {
  document.querySelectorAll('.nav-link[data-view]').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
      document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
      link.classList.add('active');
      $('view-' + link.dataset.view).classList.add('active');
      // Lets other modules (e.g. the dashboard) react when a tab opens.
      document.dispatchEvent(new CustomEvent('view:change', { detail: link.dataset.view }));
    });
  });
}
