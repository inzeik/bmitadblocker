// Entry point: wires every module together.
import * as Api from './api.js';
import { $ } from './utils.js';
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initAboutModal } from './about-modal.js';
import { initSetup } from './setup.js';
import { startDashboard } from './dashboard.js';

// Top-right pill: green = real NextDNS data, amber = demo data.
function updateStatusPill(mode) {
  $('status-pill').classList.toggle('demo', mode === 'demo');
  $('status-text').textContent = mode === 'live' ? 'NextDNS Live' : 'Demo data';
}

initTheme();
initNavigation();
initAboutModal();

Api.onModeChange(updateStatusPill);
const { profileId } = await Api.init();
updateStatusPill(Api.getMode());

initSetup(profileId);
startDashboard();
