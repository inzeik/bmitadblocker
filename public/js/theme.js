// Light / dark theme toggle (remembered in localStorage).
import { $ } from './utils.js';

const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch { /* private mode */ }
  $('theme-icon-sun').style.display  = theme === 'light' ? 'block' : 'none';
  $('theme-icon-moon').style.display = theme === 'light' ? 'none' : 'block';
}

export function initTheme() {
  let saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch { /* ignore */ }
  setTheme(saved);
  $('theme-toggle').addEventListener('click', () =>
    setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
}
