// Small helpers shared by all modules.

export const $ = (id) => document.getElementById(id);

/** Build a DOM node: h('div', 'css-class', 'text', childNode). Strings become text nodes, so it is XSS-safe. */
export function h(tag, className = '', ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.flat());
  return node;
}

export const formatNumber = (n) => Number(n).toLocaleString();

export function timeAgo(date) {
  const s = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const hr = Math.round(m / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}
