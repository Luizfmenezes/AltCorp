// js/app.js

import AuthController from './modules/auth.js';
import DashboardController from './modules/dashboard.js';
import SettingsController from './modules/settings.js';
import { DOMElements } from './utils/domElements.js';
import { showScreen } from './utils/helpers.js';

class App {
    constructor() {
        // Instancia os controllers e injeta as dependências
        this.settingsController = new SettingsController();
        this.authController = new AuthController(this.dashboardController); // Auth precisa do DashboardController
        this.dashboardController = new DashboardController(this.authController, this.settingsController); // Dashboard precisa de Auth e Settings
    }

    init() {
        // Re-atribui as instâncias após a construção circular para garantir que não são undefined
        // durante a criação
        this.authController.dashboardController = this.dashboardController;
        this.dashboardController.authController = this.authController;
        this.dashboardController.settingsController = this.settingsController;

        const authStatus = this.authController.getAuthStatus();

        if (authStatus.userName) {
            // Se o usuário já estiver logado (sessão persistida)
            this.dashboardController.handleLoginSuccess(authStatus.userName, authStatus.isAdmin);
            showScreen(DOMElements.dashboardScreen, DOMElements.loginScreen);
        } else {
            // Se não houver sessão, permanece na tela de login
            showScreen(DOMElements.loginScreen, DOMElements.dashboardScreen);
        }
    }
}

// Inicia a aplicação quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});