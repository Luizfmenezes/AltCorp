// js/modules/ui.js

import { loadIntegrationSettings } from './integration.js';
import * as elements from './domElements.js';
import { getUserName } from './state.js';
// NOVO: Importação do módulo do modal
import { initializeModal } from './modal.js'; 


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
    // Garante que screenToHide é um elemento HTMLElement antes de tentar manipular suas classes
    if (screenToHide && screenToHide instanceof HTMLElement) {
        screenToHide.classList.remove('active');
        screenToHide.classList.add('hidden');
    }
    // Garante que screenToShow é um elemento HTMLElement antes de tentar manipular suas classes
    if (screenToShow && screenToShow instanceof HTMLElement) {
        screenToShow.classList.remove('hidden');
        screenToShow.classList.add('active');
    }
}


/**
 * Exibe uma seção de conteúdo específica no dashboard.
 * @param {string} contentId - O ID do conteúdo a ser exibido.
 */
export async function showContentScreen(contentId) { // Tornar assíncrona se loadPageContent for assíncrona
    // Primeiro, esconda todas as telas de conteúdo
    const allContentScreens = document.querySelectorAll('.content-screen');
    allContentScreens.forEach(screen => screen.classList.add('hidden'));

    const contentDiv = document.getElementById(contentId);
    if (!contentDiv) {
        console.error(`Div de conteúdo com ID "${contentId}" não encontrada.`);
        return;
    }

    // Carrega o conteúdo dinâmico na div de conteúdo correta
    await loadPageContent(contentId, elements.screenKeyToContentId[contentId]);

    // Em seguida, mostre a tela de conteúdo desejada
    contentDiv.classList.remove('hidden');
    console.log(`Exibindo tela de conteúdo: ${contentId}`);

    // NOVO: Inicializa o modal SE a tela exibida for a de cadastro de itens
    if (contentId === 'estoque_cadastro_itens') {
        initializeModal(); // Chama a função de inicialização do modal
        console.log('Tentando inicializar modal para estoque_cadastro_itens...');
    }

    // Lógica específica para telas que precisam de carregamento de dados
    if (contentId === 'configuracoes_integracao') {
        loadIntegrationSettings();
    }
}


/**
 * Atualiza a seleção visual na barra lateral.
 * @param {string} screenKey - A chave da tela selecionada.
 */
export function updateSidebarSelection(screenKey) {
    elements.allSidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.screenKey === screenKey) {
            link.classList.add('active');
        }
    });

    // Garante que o submenu pai esteja expandido
    const activeLink = document.querySelector(`.sidebar-nav a[data-screen-key="${screenKey}"]`);
    if (activeLink) {
        const parentSubmenu = activeLink.closest('.submenu');
        if (parentSubmenu) {
            parentSubmenu.classList.add('expanded');
            const toggle = parentSubmenu.previousElementSibling;
            if (toggle && toggle.classList.contains('submenu-toggle')) {
                toggle.classList.add('expanded');
            }
        }
    }
}

/**
 * Alterna a visibilidade dos itens de menu de administrador.
 * @param {boolean} isAdmin - Verdadeiro se o usuário for administrador.
 */
export function toggleAdminMenuItems(isAdmin) {
    if (elements.integrationSettingsMenuItem) {
        elements.integrationSettingsMenuItem.classList.toggle('hidden', !isAdmin);
    }
    if (elements.integrationSettingsMenuItemMobile) {
        elements.integrationSettingsMenuItemMobile.classList.toggle('hidden', !isAdmin);
    }
}

/**
 * Alterna a visibilidade do drawer mobile e do overlay.
 */
export function toggleMobileDrawer() {
    elements.mobileDrawer.classList.toggle('hidden');
    elements.drawerOverlay.classList.toggle('hidden');
}

/**
 * Exibe uma mensagem de diálogo de alerta.
 * A funcionalidade é simulada e não bloqueia a execução.
 * @param {string} title - Título do diálogo.
 * @param {string} message - Mensagem a ser exibida.
 * @param {boolean} isError - Se a mensagem é de erro (true) ou sucesso/informativa (false).
 */
export function showAlertDialog(title, message, isError = false) {
    // Esta é uma implementação simplificada. Para um modal de alerta real,
    // você precisaria de uma estrutura HTML para o modal de alerta no index.html
    // e lógica para exibi-lo/escondê-lo.
    alert(`${title}\n\n${message}`); // Usando alert() para simplicidade
    if (isError) {
        console.error(`Alerta: ${title} - ${message}`);
    } else {
        console.info(`Alerta: ${title} - ${message}`);
    }
}

/**
 * Exibe um diálogo de confirmação.
 * @param {string} title - Título do diálogo.
 * @param {string} message - Mensagem a ser exibida.
 * @returns {Promise<boolean>} - Resolve com true se o usuário confirmar, false caso contrário.
 */
export function showConfirmationDialog(title, message) {
    // Esta é uma implementação simplificada usando window.confirm.
    // Para um modal de confirmação customizado, você precisaria de uma estrutura HTML
    // e promises para lidar com as interações do usuário.
    return Promise.resolve(confirm(`${title}\n\n${message}`));
}

/**
 * Ajusta o layout com base no tamanho da janela.
 * Mostra/esconde a barra lateral fixa e o botão do menu móvel.
 */
export function handleResize() {
    if (window.innerWidth <= 768) { // Exemplo: breakpoint para mobile
        elements.fixedSidebar.classList.add('hidden');
        elements.menuToggleButton.classList.remove('hidden');
    } else {
        elements.fixedSidebar.classList.remove('hidden');
        elements.mobileDrawer.classList.add('hidden');
        elements.drawerOverlay.classList.add('hidden');
        elements.menuToggleButton.classList.add('hidden');
    }
}

/**
 * Retorna o caminho da página com base no ID do conteúdo.
 * @param {string} contentId - O ID do conteúdo.
 * @returns {string} - O caminho do arquivo HTML.
 */
function getPagePath(contentId) {
    // Mapeie contentId para o caminho do arquivo HTML correspondente
    // Exemplo: 'estoque_cadastro_itens' -> 'src/pages/estoque_cadastro_itens.html'
    // Você pode precisar ajustar o caminho base dependendo de onde seus arquivos HTML estão
    switch (contentId) {
        case 'welcome-dashboard-content':
            return 'src/pages/welcome_dashboard_content.html';
        case 'vendas_geral':
            return 'src/pages/vendas_geral.html';
        case 'vendas_venda':
            return 'src/pages/vendas_venda.html';
        case 'vendas_orcamento':
            return 'src/pages/vendas_orcamento.html';
        case 'vendas_entrega':
            return 'src/pages/vendas_entrega.html';
        case 'estoque_geral':
            return 'src/pages/estoque_geral.html';
        case 'estoque_entrada_nf':
            return 'src/pages/estoque_entrada_nf.html';
        case 'estoque_cadastro_itens':
            return 'src/pages/estoque_cadastro_itens.html'; // Caminho para sua tela de cadastro de itens
        case 'clientes_geral':
            return 'src/pages/clientes_geral.html';
        case 'clientes_cadastro_rapido':
            return 'src/pages/clientes_cadastro_rapido.html';
        case 'relatorios_geral':
            return 'src/pages/relatorios_geral.html';
        case 'configuracoes_geral':
            return 'src/pages/configuracoes_geral.html';
        case 'configuracoes_usuarios':
            return 'src/pages/configuracoes_usuarios.html';
        case 'configuracoes_integracao':
            return 'src/pages/configuracoes_integracao.html';
        default:
            return '';
    }
}

/**
 * Carrega conteúdo HTML de um arquivo externo e injeta em um container.
 * @param {string} containerId - O ID da div onde o conteúdo será injetado (ex: 'estoque_cadastro_itens').
 * @param {string} pagePath - O caminho do arquivo HTML a ser carregado (ex: 'src/pages/estoque_cadastro_itens.html').
 */
async function loadPageContent(containerId, pagePath) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contêiner com ID "${containerId}" não encontrado.`);
        return;
    }

    const htmlPath = getPagePath(containerId); // Usando a função getPagePath
    if (!htmlPath) {
        console.warn(`Caminho HTML não definido para o contentId: ${containerId}`);
        container.innerHTML = `<p>Conteúdo para "${containerId}" não encontrado ou definido.</p>`;
        return;
    }

    try {
        const response = await fetch(htmlPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        container.innerHTML = html;
        console.log(`Conteúdo de ${htmlPath} carregado em #${containerId}`);
    } catch (error) {
        console.error(`Erro ao carregar conteúdo para ${containerId} de ${htmlPath}:`, error);
        container.innerHTML = `<p>Erro ao carregar o conteúdo.</p>`;
    }
}