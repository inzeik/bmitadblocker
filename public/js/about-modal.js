// Full-screen "About the project" overlay (the "i" button).
import { $ } from './utils.js';

export function initAboutModal() {
  const modal = $('info-modal');

  const open = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  $('open-info').addEventListener('click', open);
  $('close-info').addEventListener('click', close);
  $('close-info-2').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}
