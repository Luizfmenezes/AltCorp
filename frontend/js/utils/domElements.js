// js/utils/domElements.js

export const DOMElements = {
    // Telas principais
    loginScreen: document.getElementById('login-screen'),
    dashboardScreen: document.getElementById('dashboard-screen'),

    // Elementos da tela de login
    loginForm: document.getElementById('login-form'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    loginButton: document.getElementById('login-button'),
    messageBox: document.getElementById('message-box'),

    // Elementos do dashboard
    loggedInUserSpan: document.getElementById('logged-in-user'),
    logoutButton: document.getElementById('logout-button'),
    userOptionsButton: document.getElementById('user-options-button'),
    menuToggleButton: document.getElementById('menu-toggle'),
    fixedSidebar: document.getElementById('fixed-sidebar'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    drawerOverlay: document.getElementById('drawer-overlay'),
    mainContent: document.getElementById('main-content'),

    // Itens de menu específicos
    integrationSettingsMenuItem: document.getElementById('integration-settings-menu-item'),
    integrationSettingsMenuItemMobile: document.getElementById('integration-settings-menu-item-mobile'),

    // Elementos da tela de integração
    integrationSettingsForm: document.getElementById('integration-settings-form'),
    systemIdInput: document.getElementById('system-id'),
    apiEndpointInput: document.getElementById('api-endpoint'),
    portInput: document.getElementById('port'),
    companyNameInput: document.getElementById('company-name'),
    saveSettingsButton: document.getElementById('save-settings-button'),
    resetSettingsButton: document.getElementById('reset-settings-button'),
    integrationMessageBox: document.getElementById('integration-message-box'),

    // Elementos de diálogo (serão criados dinamicamente, mas os botões internos são IDs)
    dialogCancelButton: 'dialog-cancel-button', // ID para referência interna
    dialogConfirmButton: 'dialog-confirm-button', // ID para referência interna
    dialogOkButton: 'dialog-ok-button', // ID para referência interna
};