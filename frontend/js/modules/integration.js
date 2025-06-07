// js/modules/integration.js
import * as elements from './domElements.js';
import { showMessage, showConfirmationDialog } from './ui.js';
import { fetchIntegrationSettings } from './api.js';

/**
 * Carrega as configurações de integração e preenche o formulário.
 */
export async function loadIntegrationSettings() {
    try {
        const data = await fetchIntegrationSettings();
        if (data.status === 1) {
            const { settings } = data;
            elements.systemIdInput.value = settings.systemId;
            elements.apiEndpointInput.value = settings.apiEndpoint;
            elements.portInput.value = settings.port;
            elements.companyNameInput.value = settings.companyName;
            showMessage('Configurações carregadas.', 'success', elements.integrationMessageBox);
        } else {
            showMessage(data.mensagem || 'Erro ao carregar.', 'error', elements.integrationMessageBox);
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        showMessage('Erro de conexão ao carregar.', 'error', elements.integrationMessageBox);
    }
}

/**
 * Simula o salvamento das configurações.
 */
async function saveIntegrationSettings(event) {
    event.preventDefault();
    const confirmSave = await showConfirmationDialog(
        'Confirmar Salvamento',
        'Tem certeza? (Funcionalidade de salvamento desativada)'
    );
    if (confirmSave) {
        showMessage('A funcionalidade de salvamento está desativada.', 'success', elements.integrationMessageBox);
    }
}

/**
 * Simula a redefinição para os padrões.
 */
async function resetToDefaults() {
    const confirmReset = await showConfirmationDialog(
        'Confirmar Redefinição',
        'Tem certeza? (Funcionalidade de redefinição desativada)'
    );
    if (confirmReset) {
        elements.systemIdInput.value = '1';
        elements.apiEndpointInput.value = 'http://192.168.15.187';
        elements.portInput.value = '8000';
        elements.companyNameInput.value = 'AltCorp';
        showMessage('A funcionalidade de redefinição está desativada.', 'success', elements.integrationMessageBox);
    }
}

/**
 * Adiciona os event listeners para os botões do formulário de integração.
 */
export function initializeIntegrationEventListeners() {
    if (elements.integrationSettingsForm) {
        elements.integrationSettingsForm.addEventListener('submit', saveIntegrationSettings);
    }
    if (elements.resetSettingsButton) {
        elements.resetSettingsButton.addEventListener('click', resetToDefaults);
    }
}