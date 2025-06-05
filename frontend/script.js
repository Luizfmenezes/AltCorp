// frontend/script.js

// --- Configurações da API ---
const API_BASE_URL = 'http://kauikserver.ddns.net:19695'; // Endereço do seu backend Flask
const BEARER_TOKEN = 'seutoken123'; // Deve ser o mesmo token definido no backend/app.py

// --- Elementos do DOM ---
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-button');
const messageBox = document.getElementById('message-box');
const loggedInUserSpan = document.getElementById('logged-in-user');
const logoutButton = document.getElementById('logout-button');
const userOptionsButton = document.getElementById('user-options-button');
const menuToggleButton = document.getElementById('menu-toggle');
const fixedSidebar = document.getElementById('fixed-sidebar');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const mainContent = document.getElementById('main-content');
const integrationSettingsMenuItem = document.getElementById('integration-settings-menu-item');
const integrationSettingsMenuItemMobile = document.getElementById('integration-settings-menu-item-mobile');

// Elementos da tela de integração
const integrationSettingsForm = document.getElementById('integration-settings-form');
const systemIdInput = document.getElementById('system-id');
const apiEndpointInput = document.getElementById('api-endpoint');
const portInput = document.getElementById('port');
const companyNameInput = document.getElementById('company-name');
const saveSettingsButton = document.getElementById('save-settings-button');
const resetSettingsButton = document.getElementById('reset-settings-button');
const integrationMessageBox = document.getElementById('integration-message-box');

// --- Variáveis de Estado ---
let loggedInUserName = sessionStorage.getItem('userName'); // Tenta recuperar do sessionStorage
let isAdmin = sessionStorage.getItem('isAdmin') === 'true'; // Converte para booleano

// Mapeamento de chaves de tela para IDs de conteúdo
const screenKeyToContentId = {
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

// --- Funções Utilitárias ---

/**
 * Exibe uma mensagem na caixa de mensagens.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo da mensagem ('success' ou 'error').
 * @param {HTMLElement} boxElement - O elemento da caixa de mensagens (padrão: messageBox).
 */
function showMessage(message, type, boxElement = messageBox) {
    boxElement.textContent = message;
    boxElement.className = `message-box show ${type}`;
    setTimeout(() => {
        boxElement.className = 'message-box hidden';
    }, 5000); // Esconde a mensagem após 5 segundos
}

/**
 * Alterna a visibilidade das telas principais (login ou dashboard).
 * @param {HTMLElement} screenToShow - A tela a ser exibida.
 * @param {HTMLElement} screenToHide - A tela a ser ocultada.
 */
function showScreen(screenToShow, screenToHide) {
    screenToHide.classList.remove('active');
    screenToHide.classList.add('hidden');
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

/**
 * Alterna a visibilidade das seções de conteúdo dentro do dashboard.
 * @param {string} contentId - O ID da seção de conteúdo a ser exibida.
 */
function showContentScreen(contentId) {
    document.querySelectorAll('.content-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    const targetScreen = document.getElementById(contentId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        // Se for a tela de integração, carrega os dados
        if (contentId === 'configuracoes_integracao') {
            loadIntegrationSettings();
        } else if (contentId === 'welcome-dashboard-content') {
            loadWelcomeDashboardContent();
        }
    } else {
        console.error(`Conteúdo da tela não encontrado para o ID: ${contentId}`);
    }
}

/**
 * Atualiza a seleção visual na barra lateral.
 * @param {string} screenKey - A chave da tela selecionada.
 */
function updateSidebarSelection(screenKey) {
    // Remove 'active' de todos os itens de menu
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });

    // Adiciona 'active' ao item de menu correspondente
    const activeLink = document.querySelector(`.sidebar-nav a[data-screen-key="${screenKey}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Fecha o drawer móvel se estiver aberto
    if (mobileDrawer.classList.contains('active')) {
        toggleMobileDrawer();
    }
}

/**
 * Alterna a visibilidade do drawer móvel e do overlay.
 */
function toggleMobileDrawer() {
    mobileDrawer.classList.toggle('active');
    drawerOverlay.classList.toggle('active');
    drawerOverlay.classList.toggle('hidden'); // Garante que a classe hidden seja removida/adicionada corretamente
}

/**
 * Carrega o conteúdo dinâmico para a tela de boas-vindas.
 */
async function loadWelcomeDashboardContent() {
    const welcomeContentDiv = document.getElementById('welcome-dashboard-content');
    welcomeContentDiv.innerHTML = `
        <div class="welcome-section">
            <div class="welcome-message">
                <i class="ph-fill ph-hand-waving"></i>
                <h2>Bem-vindo, ${loggedInUserName} ao seu ERP!</h2>
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

    // Opcional: buscar dados reais do dashboard da API
    // try {
    //     const response = await fetch(`${API_BASE_URL}/dashboard-data`, {
    //         headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` }
    //     });
    //     const data = await response.json();
    //     if (data.status === 1) {
    //         // Atualizar os cards com os dados reais
    //         console.log('Dados do dashboard:', data);
    //     }
    // } catch (error) {
    //     console.error('Erro ao carregar dados do dashboard:', error);
    //     showMessage('Erro ao carregar dados do dashboard.', 'error');
    // }
}


/**
 * Carrega as configurações de integração do backend e preenche o formulário.
 */
async function loadIntegrationSettings() {
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
            const settings = data.settings;
            systemIdInput.value = settings.systemId;
            apiEndpointInput.value = settings.apiEndpoint;
            portInput.value = settings.port;
            companyNameInput.value = settings.companyName;
            showMessage('Configurações de integração carregadas.', 'success', integrationMessageBox);
        } else {
            showMessage(data.mensagem || 'Erro ao carregar configurações de integração.', 'error', integrationMessageBox);
        }
    } catch (error) {
        console.error('Erro ao carregar configurações de integração:', error);
        showMessage('Erro de conexão ao carregar configurações de integração.', 'error', integrationMessageBox);
    }
}

/**
 * Simula o salvamento das configurações de integração.
 */
async function saveIntegrationSettings(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const confirmSave = await showConfirmationDialog(
        'Confirmar Salvamento',
        'Tem certeza que deseja salvar as novas configurações? (Funcionalidade de salvamento desativada)'
    );

    if (confirmSave) {
        // Apenas simula o envio dos dados, pois a funcionalidade está desativada
        const settings = {
            systemId: systemIdInput.value,
            apiEndpoint: apiEndpointInput.value,
            port: portInput.value,
            companyName: companyNameInput.value
        };
        console.log('Tentativa de salvar configurações:', settings);
        showMessage('A funcionalidade de salvamento está desativada nesta versão de depuração.', 'success', integrationMessageBox);

        // Opcional: Enviar para o backend se a funcionalidade estivesse ativa
        // try {
        //     const response = await fetch(`${API_BASE_URL}/integration-settings`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${BEARER_TOKEN}`
        //         },
        //         body: JSON.stringify(settings)
        //     });
        //     const data = await response.json();
        //     if (response.ok && data.status === 1) {
        //         showMessage('Configurações salvas com sucesso!', 'success', integrationMessageBox);
        //     } else {
        //         showMessage(data.mensagem || 'Erro ao salvar configurações.', 'error', integrationMessageBox);
        //     }
        // } catch (error) {
        //     console.error('Erro ao salvar configurações:', error);
        //     showMessage('Erro de conexão ao salvar configurações.', 'error', integrationMessageBox);
        // }
    }
}

/**
 * Simula a redefinição das configurações para os valores padrão.
 */
async function resetToDefaults() {
    const confirmReset = await showConfirmationDialog(
        'Confirmar Redefinição',
        'Tem certeza que deseja redefinir as configurações para os valores padrão? (Funcionalidade de redefinição desativada)'
    );

    if (confirmReset) {
        systemIdInput.value = '1';
        apiEndpointInput.value = 'http://192.168.15.187';
        portInput.value = '8000';
        companyNameInput.value = 'AltCorp';
        showMessage('A funcionalidade de redefinição está desativada nesta versão de depuração.', 'success', integrationMessageBox);
    }
}

/**
 * Exibe um diálogo de confirmação personalizado (substitui showDialog do Flutter).
 * @param {string} title - Título do diálogo.
 * @param {string} message - Mensagem do diálogo.
 * @returns {Promise<boolean>} - Resolve para true se confirmar, false se cancelar.
 */
function showConfirmationDialog(title, message) {
    return new Promise(resolve => {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';

        const dialogBox = document.createElement('div');
        dialogBox.className = 'dialog-box';
        dialogBox.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="dialog-actions">
                <button id="dialog-cancel-button" class="secondary-button">Cancelar</button>
                <button id="dialog-confirm-button" class="primary-button">Confirmar</button>
            </div>
        `;

        dialogOverlay.appendChild(dialogBox);
        document.body.appendChild(dialogOverlay);

        document.getElementById('dialog-cancel-button').onclick = () => {
            document.body.removeChild(dialogOverlay);
            resolve(false);
        };
        document.getElementById('dialog-confirm-button').onclick = () => {
            document.body.removeChild(dialogOverlay);
            resolve(true);
        };
    });
}

/**
 * Exibe um diálogo de alerta personalizado (substitui showDialog do Flutter).
 * @param {string} title - Título do diálogo.
 * @param {string} message - Mensagem do diálogo.
 * @param {boolean} isError - Se a mensagem é de erro (afeta o estilo).
 */
function showAlertDialog(title, message, isError = false) {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';

    const dialogBox = document.createElement('div');
    dialogBox.className = `dialog-box ${isError ? 'error' : 'success'}`;
    dialogBox.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="dialog-actions">
            <button id="dialog-ok-button" class="primary-button">OK</button>
        </div>
    `;

    dialogOverlay.appendChild(dialogBox);
    document.body.appendChild(dialogOverlay);

    document.getElementById('dialog-ok-button').onclick = () => {
        document.body.removeChild(dialogOverlay);
    };
}


// --- Lógica de Autenticação ---

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';
    messageBox.classList.remove('show');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const sistemaFixo = 1; // Sistema ID fixo, como no Flutter

    try {
        const response = await fetch(`${API_BASE_URL}/autenticar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BEARER_TOKEN}` // Adiciona o token Bearer
            },
            body: JSON.stringify({
                sistema: sistemaFixo,
                usuario: username,
                senha: password
            })
        });

        const data = await response.json();

        if (response.ok && data.status === 1) {
            loggedInUserName = data.usuario;
            isAdmin = data.isAdmin;

            // Armazena no sessionStorage para persistência da sessão
            sessionStorage.setItem('userName', loggedInUserName);
            sessionStorage.setItem('isAdmin', isAdmin);

            loggedInUserSpan.textContent = `Usuário: ${loggedInUserName}`;
            showScreen(dashboardScreen, loginScreen);
            
            // Exibe ou oculta o item de menu "Integração" com base no status de administrador
            if (isAdmin) {
                integrationSettingsMenuItem.classList.remove('hidden');
                integrationSettingsMenuItemMobile.classList.remove('hidden');
            } else {
                integrationSettingsMenuItem.classList.add('hidden');
                integrationSettingsMenuItemMobile.classList.add('hidden');
            }

            // Carrega o conteúdo inicial do dashboard (Visão Geral)
            showContentScreen('welcome-dashboard-content');
            updateSidebarSelection('visao_geral');

        } else {
            showMessage(data.mensagem || 'Credenciais inválidas.', 'error');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        showMessage('Erro de conexão com o servidor. Tente novamente.', 'error');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
    }
});

// --- Lógica do Dashboard ---

// Event listener para cliques nos itens do menu lateral
document.querySelectorAll('.sidebar-nav a[data-screen-key]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const screenKey = event.currentTarget.dataset.screenKey;
        const contentId = screenKeyToContentId[screenKey];
        if (contentId) {
            showContentScreen(contentId);
            updateSidebarSelection(screenKey);
        }
    });
});

// Event listener para toggles de submenu
document.querySelectorAll('.submenu-toggle').forEach(toggle => {
    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        const parentLi = event.currentTarget.closest('li');
        const submenu = parentLi.querySelector('.submenu');
        if (submenu) {
            submenu.classList.toggle('expanded');
            event.currentTarget.classList.toggle('expanded');
        }
    });
});

// Botão de Logout
logoutButton.addEventListener('click', () => {
    sessionStorage.clear(); // Limpa o estado da sessão
    loggedInUserName = null;
    isAdmin = false;
    showScreen(loginScreen, dashboardScreen);
    showMessage('Você foi desconectado.', 'success');
});

// Botão de Opções do Usuário
userOptionsButton.addEventListener('click', () => {
    showAlertDialog('Opções do Usuário', 'Funcionalidades de "Ver Perfil" e "Mudar Senha" ainda não implementadas.');
});

// Botão de alternar menu (apenas para mobile)
menuToggleButton.addEventListener('click', toggleMobileDrawer);
drawerOverlay.addEventListener('click', toggleMobileDrawer); // Fecha o drawer ao clicar no overlay

// --- Lógica da Tela de Integração ---
if (integrationSettingsForm) {
    integrationSettingsForm.addEventListener('submit', saveIntegrationSettings);
}

if (resetSettingsButton) {
    resetSettingsButton.addEventListener('click', resetToDefaults);
}

// --- Lógica de Responsividade ---
function handleResize() {
    if (window.innerWidth >= 768) { // Largura de desktop
        fixedSidebar.classList.remove('hidden');
        fixedSidebar.classList.add('fixed');
        menuToggleButton.classList.add('hidden');
        mobileDrawer.classList.remove('active'); // Garante que o drawer esteja fechado
        mobileDrawer.classList.add('hidden');
        drawerOverlay.classList.add('hidden');
        drawerOverlay.classList.remove('active');
    } else { // Largura de mobile
        fixedSidebar.classList.add('hidden');
        fixedSidebar.classList.remove('fixed');
        menuToggleButton.classList.remove('hidden');
        mobileDrawer.classList.remove('hidden');
        // O estado 'active' do mobileDrawer é controlado pelo toggleMobileDrawer
    }
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    handleResize(); // Ajusta o layout na carga inicial
    window.addEventListener('resize', handleResize); // Ajusta o layout ao redimensionar

    if (loggedInUserName) {
        // Se o usuário já estiver logado (sessão persistida)
        loggedInUserSpan.textContent = `Usuário: ${loggedInUserName}`;
        showScreen(dashboardScreen, loginScreen);

        // Exibe ou oculta o item de menu "Integração" com base no status de administrador
        if (isAdmin) {
            integrationSettingsMenuItem.classList.remove('hidden');
            integrationSettingsMenuItemMobile.classList.remove('hidden');
        } else {
            integrationSettingsMenuItem.classList.add('hidden');
            integrationSettingsMenuItemMobile.classList.add('hidden');
        }

        // Carrega o conteúdo inicial do dashboard (Visão Geral)
        showContentScreen('welcome-dashboard-content');
        updateSidebarSelection('visao_geral');
    } else {
        // Se não houver sessão, permanece na tela de login
        showScreen(loginScreen, dashboardScreen);
    }
});
