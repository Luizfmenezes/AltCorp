// js/modules/dashboard.js

import { DOMElements } from '../utils/domElements.js';
import { showScreen, showAlertDialog } from '../utils/helpers.js';
import { SCREEN_KEY_TO_CONTENT_ID } from '../config.js';

// --- View (Manipulação da UI do Dashboard) ---
class DashboardView {
    constructor() {
        this.loggedInUserSpan = DOMElements.loggedInUserSpan;
        this.logoutButton = DOMElements.logoutButton;
        this.userOptionsButton = DOMElements.userOptionsButton;
        this.menuToggleButton = DOMElements.menuToggleButton;
        this.mobileDrawer = DOMElements.mobileDrawer;
        this.drawerOverlay = DOMElements.drawerOverlay;
        this.fixedSidebar = DOMElements.fixedSidebar;
        this.integrationSettingsMenuItem = DOMElements.integrationSettingsMenuItem;
        this.integrationSettingsMenuItemMobile = DOMElements.integrationSettingsMenuItemMobile;
    }

    updateLoggedInUser(userName) {
        this.loggedInUserSpan.textContent = `Usuário: ${userName}`;
    }

    toggleIntegrationSettingsVisibility(isAdmin) {
        // Usando toggle com segundo argumento para mais clareza
        this.integrationSettingsMenuItem.classList.toggle('hidden', !isAdmin);
        this.integrationSettingsMenuItemMobile.classList.toggle('hidden', !isAdmin);
    }

    showContentScreen(screenKey) {
        document.querySelectorAll('.content-screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        const contentId = SCREEN_KEY_TO_CONTENT_ID[screenKey];
        const targetScreen = document.getElementById(contentId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            return contentId; // Retorna o ID para o controller saber qual tela foi ativada
        } else {
            console.error(`Conteúdo da tela não encontrado para o ID: ${contentId}`);
            return null;
        }
    }

    updateSidebarSelection(screenKey) {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar-nav a[data-screen-key="${screenKey}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        if (this.mobileDrawer.classList.contains('active')) {
            this.toggleMobileDrawer();
        }
    }

    toggleMobileDrawer() {
        this.mobileDrawer.classList.toggle('active');
        this.drawerOverlay.classList.toggle('active');
        this.drawerOverlay.classList.toggle('hidden');
    }

    loadWelcomeDashboardContent(userName) {
        const welcomeContentDiv = document.getElementById('welcome-dashboard-content');
        if (welcomeContentDiv) {
            welcomeContentDiv.innerHTML = `
                <div class="welcome-section">
                    <div class="welcome-message">
                        <i class="ph-fill ph-hand-waving"></i>
                        <h2>Bem-vindo, ${userName} ao seu ERP!</h2>
                        <p>Aqui você encontra as principais informações e acessa as funcionalidades do sistema.</p>
                    </div>
                </div>
                <div class="dashboard-info-area">
                    <div class="info-card">
                        <h3><i class="ph-fill ph-info"></i> Status do Sistema</h3>
                        <ul>
                            <li><i class="ph-fill ph-check-circle"></i> Todos os serviços estão operacionais.</li>
                        </ul>
                    </div>
                    <div class="info-card">
                        <h3><i class="ph-fill ph-calendar-blank"></i> Próximo Evento</h3>
                        <ul>
                            <li><i class="ph-fill ph-calendar-check"></i> Reunião de Vendas - 05/06/2025 às 10:00.</li>
                        </ul>
                    </div>
                    <div class="info-card">
                        <h3><i class="ph-fill ph-bell"></i> Avisos Importantes</h3>
                        <ul>
                            <li><i class="ph-fill ph-warning"></i> Manutenção agendada para 10/06/2025 às 02:00 AM.</li>
                            <li><i class="ph-fill ph-warning"></i> Nova atualização de segurança disponível.</li>
                            <li><i class="ph-fill ph-warning"></i> Lembrete: Encerramento do mês fiscal em 30/06/2025.</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    handleResize() {
        const applyLayout = () => {
            if (window.innerWidth >= 768) {
                this.fixedSidebar.classList.remove('hidden');
                this.fixedSidebar.classList.add('fixed');
                this.menuToggleButton.classList.add('hidden');
                this.mobileDrawer.classList.remove('active');
                this.mobileDrawer.classList.add('hidden');
                this.drawerOverlay.classList.add('hidden');
                this.drawerOverlay.classList.remove('active');
            } else {
                this.fixedSidebar.classList.add('hidden');
                this.fixedSidebar.classList.remove('fixed');
                this.menuToggleButton.classList.remove('hidden');
                this.mobileDrawer.classList.remove('hidden');
            }
        };
        window.addEventListener('resize', applyLayout);
        applyLayout(); // Aplica na carga inicial
    }

    // Binds
    bindLogout(handler) {
        this.logoutButton.addEventListener('click', handler);
    }

    bindUserOptions(handler) {
        this.userOptionsButton.addEventListener('click', handler);
    }

    bindMenuToggle(handler) {
        this.menuToggleButton.addEventListener('click', handler);
        this.drawerOverlay.addEventListener('click', handler);
    }

    bindSidebarNavigation(handler) {
        document.querySelectorAll('.sidebar-nav a[data-screen-key]').forEach(link => {
            link.addEventListener('click', handler);
        });
    }

    bindSubmenuToggles(handler) {
        document.querySelectorAll('.submenu-toggle').forEach(toggle => {
            toggle.addEventListener('click', handler);
        });
    }
}

// --- Controller (Gerencia a Lógica do Dashboard) ---
class DashboardController {
    constructor(authControllerInstance, settingsControllerInstance) {
        // Não há um "Model" de dashboard complexo aqui, o AuthModel serve para o estado do usuário
        this.dashboardView = new DashboardView();
        // Injeção de dependências para comunicação entre módulos
        this.authController = authControllerInstance;
        this.settingsController = settingsControllerInstance;

        this.dashboardView.bindLogout(this.handleLogout.bind(this));
        this.dashboardView.bindUserOptions(this.handleUserOptions.bind(this));
        this.dashboardView.bindMenuToggle(this.handleMenuToggle.bind(this));
        this.dashboardView.bindSidebarNavigation(this.handleSidebarNavigation.bind(this));
        this.dashboardView.bindSubmenuToggles(this.handleSubmenuToggle.bind(this));
        this.dashboardView.handleResize(); // Configura o listener de resize
    }

    handleLoginSuccess(userName, isAdmin) {
        this.dashboardView.updateLoggedInUser(userName);
        this.dashboardView.toggleIntegrationSettingsVisibility(isAdmin);
        // Carrega o conteúdo inicial do dashboard (Visão Geral)
        this.handleSidebarNavigation({
            currentTarget: {
                dataset: { screenKey: 'visao_geral' }
            }
        });
        this.dashboardView.updateSidebarSelection('visao_geral');
        this.dashboardView.loadWelcomeDashboardContent(userName);
    }

    handleLogout() {
        // Delega o logout ao AuthController
        this.authController.handleLogout();
    }

    handleUserOptions() {
        showAlertDialog('Opções do Usuário', 'Funcionalidades de "Ver Perfil" e "Mudar Senha" ainda não implementadas.');
    }

    handleMenuToggle() {
        this.dashboardView.toggleMobileDrawer();
    }

    handleSidebarNavigation(event) {
        // REMOVA OU COMENTE A LINHA ABAIXO:
        // event.preventDefault(); // Esta linha causa o erro quando 'event' não é um evento DOM real

        const screenKey = event.currentTarget.dataset.screenKey;
        const activatedContentId = this.dashboardView.showContentScreen(screenKey);
        this.dashboardView.updateSidebarSelection(screenKey);

        // Lógica para carregar dados específicos da tela
        if (activatedContentId === 'configuracoes_integracao' && this.settingsController) {
            this.settingsController.loadSettings();
        } else if (activatedContentId === 'welcome-dashboard-content') {
            const authStatus = this.authController.getAuthStatus();
            this.dashboardView.loadWelcomeDashboardContent(authStatus.userName);
        }
        // Adicionar outras condições para outras telas que precisam carregar dados ou lógica específica
    }

    handleSubmenuToggle(event) {
        event.preventDefault();
        const parentLi = event.currentTarget.closest('li');
        const submenu = parentLi.querySelector('.submenu');
        if (submenu) {
            submenu.classList.toggle('expanded');
            event.currentTarget.classList.toggle('expanded');
        }
    }
}

export default DashboardController; // Exporta a classe do Controller