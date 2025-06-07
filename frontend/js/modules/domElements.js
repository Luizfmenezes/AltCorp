// js/modules/domElements.js

// Mapeamento de chaves de tela para IDs de conteúdo
export const screenKeyToContentId = {
    'visao_geral': 'welcome-dashboard-content',
    'vendas_geral': 'vendas_geral',
    'vendas_venda': 'vendas_venda',
    'vendas_orcamento': 'vendas_orcamento',
    'vendas_entrega': 'vendas_entrega',
    'estoque_geral': 'estoque_geral',
    'estoque_entrada_nf': 'estoque_entrada_nf',
    'estoque_cadastro_itens': 'estoque_cadastro_itens',
    'clientes_geral': 'clientes_geral',
    'clientes_cadastro_rapido': 'clientes_cadastro_rapido',
    'relatorios_geral': 'relatorios_geral',
    'configuracoes_geral': 'configuracoes_geral',
    'configuracoes_usuarios': 'configuracoes_usuarios',
    'configuracoes_integracao': 'configuracoes_integracao',
};

// --- Elementos do DOM ---
export const loginScreen = document.getElementById('login-screen');
export const dashboardScreen = document.getElementById('dashboard-screen');
export const loginForm = document.getElementById('login-form');
export const loginButton = document.getElementById('login-button');
export const messageBox = document.getElementById('message-box');
export const loggedInUserSpan = document.getElementById('logged-in-user');
export const logoutButton = document.getElementById('logout-button');
export const userOptionsButton = document.getElementById('user-options-button');
export const menuToggleButton = document.getElementById('menu-toggle');
export const fixedSidebar = document.getElementById('fixed-sidebar');
export const mobileDrawer = document.getElementById('mobile-drawer');
export const drawerOverlay = document.getElementById('drawer-overlay');
export const mainContent = document.getElementById('main-content');
export const integrationSettingsMenuItem = document.getElementById('integration-settings-menu-item');
export const integrationSettingsMenuItemMobile = document.getElementById('integration-settings-menu-item-mobile');

// Elementos da tela de integração
export const integrationSettingsForm = document.getElementById('integration-settings-form');
export const systemIdInput = document.getElementById('system-id');
export const apiEndpointInput = document.getElementById('api-endpoint');
export const portInput = document.getElementById('port');
export const companyNameInput = document.getElementById('company-name');
export const saveSettingsButton = document.getElementById('save-settings-button');
export const resetSettingsButton = document.getElementById('reset-settings-button');
export const integrationMessageBox = document.getElementById('integration-message-box');

// Seletores para event listeners
export const allSidebarLinks = document.querySelectorAll('.sidebar-nav a[data-screen-key]');
export const allSubmenuToggles = document.querySelectorAll('.submenu-toggle');