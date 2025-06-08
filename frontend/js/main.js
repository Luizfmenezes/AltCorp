// js/main.js

import * as elements from './modules/domElements.js';
import * as state from './modules/state.js';
import * as ui from './modules/ui.js';

import { initializeAuthEventListeners } from './modules/auth.js';
import { initializeIntegrationEventListeners } from './modules/integration.js';
import { initializeItemManagement } from './modules/itemManagement.js';
// NOVO: NÃO precisamos importar initializeModal aqui se for chamado pelo ui.js
// import { initializeModal } from './modules/modal.js'; 


/**
 * Configura o dashboard para um usuário logado.
 */
export function initializeDashboard() {
    elements.loggedInUserSpan.textContent = `Usuário: ${state.getUserName()}`;
    ui.showScreen(elements.dashboardScreen, elements.loginScreen);
    ui.toggleAdminMenuItems(state.isAdminUser());
    ui.showContentScreen('welcome-dashboard-content');
    ui.updateSidebarSelection('visao_geral');
}

/**
 * Configura os event listeners gerais da aplicação. (DECLARAÇÃO ÚNICA)
 */
function initializeEventListeners() {
    // Autenticação
    initializeAuthEventListeners();

    // Navegação do Dashboard
    elements.allSidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const screenKey = event.currentTarget.dataset.screenKey;
            const contentId = elements.screenKeyToContentId[screenKey];
            if (contentId) {
                ui.showContentScreen(contentId); // Esta função agora chama initializeModal, se necessário
                ui.updateSidebarSelection(screenKey);
            }
        });
    });

    // Submenus
    elements.allSubmenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            const submenu = event.currentTarget.closest('li').querySelector('.submenu');
            if (submenu) {
                submenu.classList.toggle('expanded');
                event.currentTarget.classList.toggle('expanded');
            }
        });
    });
    
    // Botões de ação do dashboard
    elements.userOptionsButton.addEventListener('click', () => {
        ui.showAlertDialog('Opções do Usuário', 'Funcionalidades de "Ver Perfil" e "Mudar Senha" ainda não implementadas.');
    });
    
    // Controles de Integração
    initializeIntegrationEventListeners();

    // Gerenciamento de Itens (NOVO)
    initializeItemManagement();

    // Responsividade e Menu Mobile
    elements.menuToggleButton.addEventListener('click', ui.toggleMobileDrawer);
    elements.drawerOverlay.addEventListener('click', ui.toggleMobileDrawer);
    window.addEventListener('resize', ui.handleResize);

    // REMOVIDO: initializeModal() não é mais chamado aqui globalmente.
    // Ele será chamado quando a tela de conteúdo for exibida.
}

/**
 * Função de inicialização da aplicação.
 */
function main() {
    ui.handleResize();
    initializeEventListeners();

    if (state.getUserName()) {
        initializeDashboard();
    } else {
        ui.showScreen(elements.loginScreen, elements.dashboardScreen);
    }
}

// Ponto de entrada da aplicação
document.addEventListener('DOMContentLoaded', main);