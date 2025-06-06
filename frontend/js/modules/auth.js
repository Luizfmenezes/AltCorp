// js/modules/auth.js

import { API_BASE_URL, BEARER_TOKEN, SYSTEM_ID_FIXED } from '../config.js';
import { DOMElements } from '../utils/domElements.js';
import { showMessage, showScreen } from '../utils/helpers.js';

// --- Model (Lógica de Autenticação e Estado do Usuário) ---
class AuthModel {
    constructor() {
        this._userName = sessionStorage.getItem('userName');
        this._isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    }

    get userName() {
        return this._userName;
    }

    get isAdmin() {
        return this._isAdmin;
    }

    async authenticate(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/autenticar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${BEARER_TOKEN}`
                },
                body: JSON.stringify({
                    sistema: SYSTEM_ID_FIXED,
                    usuario: username,
                    senha: password
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 1) {
                this._userName = data.usuario;
                this._isAdmin = data.isAdmin;
                sessionStorage.setItem('userName', this._userName);
                sessionStorage.setItem('isAdmin', this._isAdmin);
                return { success: true, message: data.mensagem, user: this._userName, isAdmin: this._isAdmin };
            } else {
                return { success: false, message: data.mensagem || 'Credenciais inválidas.' };
            }
        } catch (error) {
            console.error('Erro de conexão durante a autenticação:', error);
            return { success: false, message: 'Erro de conexão com o servidor. Tente novamente.' };
        }
    }

    logout() {
        sessionStorage.clear();
        this._userName = null;
        this._isAdmin = false;
    }
}

// --- View (Manipulação da UI de Login) ---
class AuthView {
    constructor() {
        this.loginForm = DOMElements.loginForm;
        this.usernameInput = DOMElements.usernameInput;
        this.passwordInput = DOMElements.passwordInput;
        this.loginButton = DOMElements.loginButton;
        this.messageBox = DOMElements.messageBox;
    }

    getLoginCredentials() {
        return {
            username: this.usernameInput.value,
            password: this.passwordInput.value
        };
    }

    setLoginButtonState(disabled, text) {
        this.loginButton.disabled = disabled;
        this.loginButton.textContent = text;
    }

    clearMessageBox() {
        this.messageBox.classList.remove('show');
    }

    displayMessage(message, type) {
        showMessage(message, type, this.messageBox);
    }

    // Método para vincular o evento de submissão do formulário ao controller
    bindLogin(handler) {
        this.loginForm.addEventListener('submit', handler);
    }
}

// --- Controller (Gerencia a Lógica de Login) ---
class AuthController {
    constructor(dashboardControllerInstance) {
        this.authModel = new AuthModel();
        this.authView = new AuthView();
        // Injeção do dashboardController para interação entre módulos
        this.dashboardController = dashboardControllerInstance;

        this.authView.bindLogin(this.handleLogin.bind(this));
    }

    async handleLogin(event) {
        event.preventDefault();

        this.authView.setLoginButtonState(true, 'Entrando...');
        this.authView.clearMessageBox();

        const { username, password } = this.authView.getLoginCredentials();
        const result = await this.authModel.authenticate(username, password);

        if (result.success) {
            // Notifica o DashboardController sobre o login bem-sucedido
            if (this.dashboardController) {
                this.dashboardController.handleLoginSuccess(result.user, result.isAdmin);
            }
            showScreen(DOMElements.dashboardScreen, DOMElements.loginScreen);
        } else {
            this.authView.displayMessage(result.message, 'error');
        }

        this.authView.setLoginButtonState(false, 'Entrar');
    }

    getAuthStatus() {
        return {
            userName: this.authModel.userName,
            isAdmin: this.authModel.isAdmin
        };
    }

    handleLogout() { // Chamado pelo DashboardController
        this.authModel.logout();
        showScreen(DOMElements.loginScreen, DOMElements.dashboardScreen);
        showMessage('Você foi desconectado.', 'success');
    }
}

export default AuthController; // Exporta a classe do Controller