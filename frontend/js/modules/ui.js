// js/modules/ui.js

import { loadIntegrationSettings } from './integration.js';
import * as elements from './domElements.js';
import { getUserName } from './state.js';
import { initializeModal } from './modal.js';

// NOVO: Objeto para armazenar as funções de inicialização de scripts de tela
// Isso evita múltiplos imports e permite re-executar as funções quando necessário.
const screenModuleInitializers = {};

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
    if (screenToHide && screenToHide instanceof HTMLElement) {
        screenToHide.classList.remove('active');
        screenToHide.classList.add('hidden');
    }
    if (screenToShow && screenToShow instanceof HTMLElement) {
        screenToShow.classList.remove('hidden');
        screenToShow.classList.add('active');
    }
}

/**
 * Retorna o caminho da página com base no ID do conteúdo.
 * @param {string} contentId - O ID do conteúdo.
 * @returns {string} - O caminho do arquivo HTML.
 */
function getPagePath(contentId) {
    // Mapeie contentId para o caminho do arquivo HTML correspondente
    // Caminhos são relativos ao seu servidor web, não ao ui.js
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
 */
async function loadPageContent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contêiner com ID "${containerId}" não encontrado.`);
        return false; // Indica falha no carregamento
    }

    // Se o conteúdo já foi carregado, não recarregue o HTML
    // Use um atributo de dados para marcar se o conteúdo já foi injetado
    if (container.dataset.loadedHtml === 'true') {
        console.log(`Conteúdo HTML para #${containerId} já carregado.`);
        return true; // Indica sucesso (já carregado)
    }

    const htmlPath = getPagePath(containerId);
    if (!htmlPath) {
        console.warn(`Caminho HTML não definido para o contentId: ${containerId}`);
        container.innerHTML = `<p>Conteúdo para "${containerId}" não encontrado ou definido.</p>`;
        return false;
    }

    try {
        const response = await fetch(htmlPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        container.innerHTML = html;
        container.dataset.loadedHtml = 'true'; // Marca que o HTML foi carregado
        console.log(`Conteúdo de ${htmlPath} carregado em #${containerId}`);
        return true; // Indica sucesso
    } catch (error) {
        console.error(`Erro ao carregar conteúdo para ${containerId} de ${htmlPath}:`, error);
        container.innerHTML = `<p>Erro ao carregar o conteúdo.</p>`;
        return false; // Indica falha
    }
}

/**
 * Exibe uma seção de conteúdo específica no dashboard.
 * @param {string} contentId - O ID do conteúdo a ser exibido.
 */
export async function showContentScreen(contentId) {
    // Primeiro, esconda todas as telas de conteúdo
    const allContentScreens = document.querySelectorAll('.content-screen');
    allContentScreens.forEach(screen => screen.classList.add('hidden'));

    const contentDiv = document.getElementById(contentId);
    if (!contentDiv) {
        console.error(`Div de conteúdo com ID "${contentId}" não encontrada.`);
        return;
    }

    // 1. Carregar o HTML da tela
    const htmlLoaded = await loadPageContent(contentId);

    if (htmlLoaded) {
        // 2. Em seguida, mostre a tela de conteúdo desejada
        contentDiv.classList.remove('hidden');
        console.log(`Exibindo tela de conteúdo: ${contentId}`);

        // 3. Lógica para carregar e executar scripts específicos de cada tela
        // Verifica se a função de inicialização para esta tela já foi importada
        if (!screenModuleInitializers[contentId]) {
            switch (contentId) {
                case 'estoque_cadastro_itens':
                    try {
                        // Importação dinâmica do módulo de gerenciamento de itens
                        // O caminho é relativo a ui.js, então './lista-estoque-itens.js'
                        const { carregarItensNaPagina } = await import('./lista-estoque-itens.js');
                        // Armazena a função para que possamos chamá-la novamente
                        screenModuleInitializers[contentId] = carregarItensNaPagina;
                        console.log('Módulo lista-estoque-itens.js carregado e inicializado pela primeira vez.');
                        carregarItensNaPagina(); // Chama a função para carregar os itens
                    } catch (error) {
                        console.error('Erro ao importar e inicializar lista-estoque-itens.js:', error);
                    }
                    break;
                case 'configuracoes_integracao':
                    // loadIntegrationSettings já é importado e chamado diretamente
                    loadIntegrationSettings(); 
                    screenModuleInitializers[contentId] = loadIntegrationSettings; // Opcional: armazenar também
                    break;
                // Adicione outros cases para outras telas que têm scripts específicos
                // Exemplo:
                // case 'minha_nova_tela':
                //     try {
                //         const { initMinhaNovaTela } = await import('./minha-nova-tela-script.js');
                //         screenModuleInitializers[contentId] = initMinhaNovaTela;
                //         initMinhaNovaTela();
                //     } catch (error) {
                //         console.error('Erro ao importar e inicializar minha-nova-tela-script.js:', error);
                //     }
                //     break;
                default:
                    console.log(`Nenhuma inicialização de script específica para a tela: ${contentId}.`);
                    break;
            }
        } else {
            // Se o módulo já foi importado, apenas re-execute a função de inicialização
            // Isso é crucial para telas que precisam recarregar dados (como tabelas) a cada visita
            console.log(`Re-executando inicialização de script para a tela: ${contentId}.`);
            screenModuleInitializers[contentId]();
        }

        // NOVO: Inicializa o modal SE a tela exibida for a de cadastro de itens
        // Mantenha isso aqui, pois o modal pode ter listeners específicos da tela.
        if (contentId === 'estoque_cadastro_itens') {
            initializeModal();
            console.log('Tentando inicializar modal para estoque_cadastro_itens...');
        }
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
    alert(`${title}\n\n${message}`);
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
    return Promise.resolve(confirm(`${title}\n\n${message}`));
}

/**
 * Ajusta o layout com base no tamanho da janela.
 * Mostra/esconde a barra lateral fixa e o botão do menu móvel.
 */
export function handleResize() {
    if (window.innerWidth <= 768) {
        elements.fixedSidebar.classList.add('hidden');
        elements.menuToggleButton.classList.remove('hidden');
    } else {
        elements.fixedSidebar.classList.remove('hidden');
        elements.mobileDrawer.classList.add('hidden');
        elements.drawerOverlay.classList.add('hidden');
        elements.menuToggleButton.classList.add('hidden');
    }
}