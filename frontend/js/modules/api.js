// js/modules/api.js
import { showMessage } from './ui.js';

// --- Configurações da API ---
const API_BASE_URL = 'http://kauikserver.ddns.net:19695';
const BEARER_TOKEN = 'seutoken123';

/**
 * Realiza a chamada de autenticação para a API.
 * @param {string} username - Nome do usuário.
 * @param {string} password - Senha do usuário.
 * @returns {Promise<object>} - Os dados da resposta da API.
 */
export async function authenticateUser(username, password) {
    const sistemaFixo = 1;
    const response = await fetch(`${API_BASE_URL}/autenticar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        body: JSON.stringify({
            sistema: sistemaFixo,
            usuario: username,
            senha: password
        })
    });
    return response.json();
}

/**
 * Busca as configurações de integração da API.
 * @returns {Promise<object>} - Os dados da resposta da API.
 */
export async function fetchIntegrationSettings() {
    const response = await fetch(`${API_BASE_URL}/integration-settings`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`
        }
    });
    return response.json();
}

// Futuramente, a função para salvar as configurações iria aqui.
/**
 * Busca a lista de itens cadastrados na API.
 * @returns {Promise<object>} - Os dados da resposta da API.
 */
export async function fetchItems() {
    // NOTA: O endpoint '/items' é um exemplo. Ajuste para o endpoint real da sua API que retorna a lista de itens.
    const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`
        }
    });
    return response.json();
}

/**
 * Envia os dados de um novo item para a API para criação.
 * @param {object} itemData - O objeto contendo os dados do item.
 * @returns {Promise<object>} - Os dados da resposta da API.
 */
export async function createItem(itemData) {
    // Usando o endpoint do seu script de exemplo.
    const response = await fetch(`${API_BASE_URL}/inserir/item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        body: JSON.stringify(itemData)
    });
    return response.json();
}
// export async function postIntegrationSettings(settings) { ... }