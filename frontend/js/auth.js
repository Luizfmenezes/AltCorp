// js/modules/auth.js
import * as elements from './domElements.js';
import * as state from './state.js';
import * as ui from './ui.js';
import { authenticateUser } from './api.js';
import { initializeDashboard } from '../main.js';

async function handleLogin(event) {
    event.preventDefault();
    elements.loginButton.disabled = true;
    elements.loginButton.textContent = 'Entrando...';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const data = await authenticateUser(username, password);
        if (data.status === 1) {
            state.setUserSession(data.usuario, data.isAdmin);
            initializeDashboard();
        } else {
            ui.showMessage(data.mensagem || 'Credenciais inválidas.', 'error');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        ui.showMessage('Erro de conexão com o servidor.', 'error');
    } finally {
        elements.loginButton.disabled = false;
        elements.loginButton.textContent = 'Entrar';
    }
}

function handleLogout() {
    state.clearUserSession();
    ui.showScreen(elements.loginScreen, elements.dashboardScreen);
    ui.showMessage('Você foi desconectado.', 'success');
}

export function initializeAuthEventListeners() {
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener('click', handleLogout);
    }
}