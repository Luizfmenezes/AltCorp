// js/modules/settings.js

import { API_BASE_URL, BEARER_TOKEN } from '../config.js';
import { DOMElements } from '../utils/domElements.js';
import { showMessage, showConfirmationDialog } from '../utils/helpers.js';

// --- Model (Lógica para Configurações de Integração) ---
class SettingsModel {
    async loadIntegrationSettings() {
        try {
            const response = await fetch(`${API_BASE_URL}/integration-settings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${BEARER_TOKEN}`
                }
            });
            const data = await response.json();

            if (response.ok && data.status === 1) {
                return { success: true, settings: data.settings, message: 'Configurações de integração carregadas.' };
            } else {
                return { success: false, message: data.mensagem || 'Erro ao carregar configurações de integração.' };
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de integração:', error);
            return { success: false, message: 'Erro de conexão ao carregar configurações de integração.' };
        }
    }

    // Esta função simula o salvamento, pois a funcionalidade real está desativada.
    async saveIntegrationSettings(settings) {
        console.log('Tentativa de salvar configurações:', settings);
        // Opcional: Implementar a chamada fetch real aqui quando a funcionalidade estiver ativa.
        return { success: true, message: 'A funcionalidade de salvamento está desativada nesta versão de depuração.' };
    }

    // Esta função simula a redefinição, pois a funcionalidade real está desativada.
    resetToDefaults() {
        const defaultSettings = {
            systemId: '1',
            apiEndpoint: 'http://192.168.15.187',
            port: '8000',
            companyName: 'AltCorp'
        };
        return { success: true, settings: defaultSettings, message: 'A funcionalidade de redefinição está desativada nesta versão de depuração.' };
    }
}

// --- View (Manipulação da UI de Configurações de Integração) ---
class SettingsView {
    constructor() {
        this.integrationSettingsForm = DOMElements.integrationSettingsForm;
        this.systemIdInput = DOMElements.systemIdInput;
        this.apiEndpointInput = DOMElements.apiEndpointInput;
        this.portInput = DOMElements.portInput;
        this.companyNameInput = DOMElements.companyNameInput;
        this.saveSettingsButton = DOMElements.saveSettingsButton;
        this.resetSettingsButton = DOMElements.resetSettingsButton;
        this.integrationMessageBox = DOMElements.integrationMessageBox;
    }

    displaySettings(settings) {
        this.systemIdInput.value = settings.systemId;
        this.apiEndpointInput.value = settings.apiEndpoint;
        this.portInput.value = settings.port;
        this.companyNameInput.value = settings.companyName;
    }

    getSettingsFormData() {
        return {
            systemId: this.systemIdInput.value,
            apiEndpoint: this.apiEndpointInput.value,
            port: this.portInput.value,
            companyName: this.companyNameInput.value
        };
    }

    displayMessage(message, type) {
        showMessage(message, type, this.integrationMessageBox);
    }

    async confirmSave() {
        return await showConfirmationDialog(
            'Confirmar Salvamento',
            'Tem certeza que deseja salvar as novas configurações? (Funcionalidade de salvamento desativada)'
        );
    }

    async confirmReset() {
        return await showConfirmationDialog(
            'Confirmar Redefinição',
            'Tem certeza que deseja redefinir as configurações para os valores padrão? (Funcionalidade de redefinição desativada)'
        );
    }

    // Binds
    bindSaveSettings(handler) {
        if (this.integrationSettingsForm) {
            this.integrationSettingsForm.addEventListener('submit', handler);
        }
    }

    bindResetSettings(handler) {
        if (this.resetSettingsButton) {
            this.resetSettingsButton.addEventListener('click', handler);
        }
    }
}

// --- Controller (Gerencia a Lógica de Configurações de Integração) ---
class SettingsController {
    constructor() {
        this.settingsModel = new SettingsModel();
        this.settingsView = new SettingsView();

        this.settingsView.bindSaveSettings(this.handleSaveSettings.bind(this));
        this.settingsView.bindResetSettings(this.handleResetSettings.bind(this));
    }

    async loadSettings() {
        const result = await this.settingsModel.loadIntegrationSettings();
        if (result.success) {
            this.settingsView.displaySettings(result.settings);
            this.settingsView.displayMessage(result.message, 'success');
        } else {
            this.settingsView.displayMessage(result.message, 'error');
        }
    }

    async handleSaveSettings(event) {
        event.preventDefault();
        const confirm = await this.settingsView.confirmSave();
        if (confirm) {
            const settings = this.settingsView.getSettingsFormData();
            const result = await this.settingsModel.saveIntegrationSettings(settings);
            this.settingsView.displayMessage(result.message, result.success ? 'success' : 'error');
        }
    }

    async handleResetSettings() {
        const confirm = await this.settingsView.confirmReset();
        if (confirm) {
            const result = this.settingsModel.resetToDefaults();
            this.settingsView.displaySettings(result.settings);
            this.settingsView.displayMessage(result.message, result.success ? 'success' : 'error');
        }
    }
}

export default SettingsController; // Exporta a classe do Controller