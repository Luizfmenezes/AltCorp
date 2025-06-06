import { showScreen, updateSidebarSelection } from './ui.js';
import { loadWelcomeDashboardContent, loadIntegrationSettings } from './services.js';
import { showMessage } from './utils.js';

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');

document.addEventListener('DOMContentLoaded', () => {
    const loggedIn = sessionStorage.getItem('userName');
    if (loggedIn) {
        showScreen(dashboardScreen, loginScreen);
        loadWelcomeDashboardContent();
    } else {
        showScreen(loginScreen, dashboardScreen);
    }

    // Eventos adicionais, ex: login, logout, navegação...
});
