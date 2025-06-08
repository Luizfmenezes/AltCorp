// js/modules/ui.js
import { loadIntegrationSettings } from './integration.js';
import * as elements from './domElements.js';
import { getUserName } from './state.js';

/**
 * Exibe uma mensagem na caixa de mensagens especificada.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - 'success' ou 'error'.
 * @param {HTMLElement} boxElement - O elemento da caixa de mensagens.
 */
export function showMessage(message, type, boxElement = elements.messageBox) {
    boxElement.textContent = message;
    boxElement.className = `message-box show ${type}`;
    setTimeout(() => {
        boxElement.className = 'message-box hidden';
    }, 5000);
}

/**
 * Alterna a visibilidade entre duas telas principais.
 * @param {HTMLElement} screenToShow - A tela a ser exibida.
 * @param {HTMLElement} screenToHide - A tela a ser ocultada.
 */
export function showScreen(screenToShow, screenToHide) {
    screenToHide.classList.remove('active');
    screenToHide.classList.add('hidden');
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

/**
 * Exibe uma seção de conteúdo específica no dashboard.
 * @param {string} contentId - O ID do conteúdo a ser exibido.
 */
async function loadPageContent(containerId, pagePath) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
        const response = await fetch(pagePath);
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p>Erro ao carregar o conteúdo da página.</p>`;
    }
}

export function showContentScreen(contentId) {
    document.querySelectorAll('.content-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    const targetScreen = document.getElementById(contentId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        if (contentId === 'configuracoes_integracao') {
            // Carrega o HTML externo e só depois chama loadIntegrationSettings
            const pagePath = getPagePathFromContentId(contentId);
            loadPageContent(contentId, pagePath).then(() => {
                loadIntegrationSettings();
            });
        } else if (contentId === 'welcome-dashboard-content') {
            loadWelcomeDashboardContent();
        } else {
            const pagePath = getPagePathFromContentId(contentId);
            loadPageContent(contentId, pagePath);
        }
    } else {
        console.error(`Conteúdo da tela não encontrado para o ID: ${contentId}`);
    }
}

/**
 * Atualiza o item de menu ativo na barra lateral.
 * @param {string} screenKey - A chave da tela selecionada.
 */
export function updateSidebarSelection(screenKey) {
    elements.allSidebarLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-nav a[data-screen-key="${screenKey}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    if (elements.mobileDrawer.classList.contains('active')) {
        toggleMobileDrawer();
    }
}

/**
 * Alterna a visibilidade do menu lateral móvel (drawer).
 */
export function toggleMobileDrawer() {
    elements.mobileDrawer.classList.toggle('active');
    elements.drawerOverlay.classList.toggle('active');
    elements.drawerOverlay.classList.toggle('hidden');
}

/**
 * Exibe ou oculta os itens de menu de administrador.
 * @param {boolean} isAdmin - Se o usuário é administrador.
 */
export function toggleAdminMenuItems(isAdmin) {
    const action = isAdmin ? 'remove' : 'add';
    elements.integrationSettingsMenuItem.classList[action]('hidden');
    elements.integrationSettingsMenuItemMobile.classList[action]('hidden');
}

/**
 * Exibe um diálogo de confirmação.
 * @returns {Promise<boolean>} - True se confirmar, false se cancelar.
 */
export function showConfirmationDialog(title, message) {
    // ... (código da função showConfirmationDialog original)
}

/**
 * Exibe um diálogo de alerta.
 */
export function showAlertDialog(title, message, isError = false) {
    // ... (código da função showAlertDialog original)
}

/**
 * Ajusta o layout com base no tamanho da janela.
 */
export function handleResize() {
    // ... (código da função handleResize original)
}

/**
 * Carrega o conteúdo dinâmico do painel de boas-vindas.
 */
async function loadWelcomeDashboardContent() {
    const welcomeContentDiv = document.getElementById('welcome-dashboard-content');
    welcomeContentDiv.innerHTML = `
        <div class="welcome-section">
             <div class="welcome-message">
                <i class="ph-fill ph-hand-waving"></i>
                <h2>Bem-vindo, ${getUserName()} ao seu ERP!</h2>
                <p>Aqui você encontra as principais informações e acessa as funcionalidades do sistema.</p>
            </div>
        </div>
        // ... (resto do HTML do dashboard)
    `;
}

/**
 * Retorna o caminho da página com base no ID do conteúdo.
 * @param {string} contentId - O ID do conteúdo.
 * @returns {string} - O caminho da página.
 */
function getPagePathFromContentId(contentId) {
    return `src/pages/${contentId}.html`;
}