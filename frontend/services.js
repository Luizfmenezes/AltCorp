import { showMessage } from './utils.js';

const API_URL = 'http://kauikserver.ddns.net:19695';
const TOKEN = 'seutoken123';

export async function loadWelcomeDashboardContent() {
    const userName = sessionStorage.getItem('userName');
    const div = document.getElementById('welcome-dashboard-content');
    div.innerHTML = `
        <div class="welcome-message">
            <h2>Bem-vindo, ${userName}!</h2>
            <p>Sistema ERP</p>
        </div>
    `;
}

export async function loadIntegrationSettings() {
    try {
        const response = await fetch(`${API_URL}/integration-settings`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        const data = await response.json();
        if (data.status === 1) {
            // preencher inputs...
        } else {
            showMessage('Erro ao carregar configurações.', 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão com API.', 'error');
    }
}
