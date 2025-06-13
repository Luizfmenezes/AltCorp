// js/modules/ui.js

import { loadIntegrationSettings } from './integration.js';
import * as elements from './domElements.js';
import { getUserName } from './state.js';

const screenDataLoaders = {};
const initializedScreens = new Set();

// --- OUVINTE DE NAVEGAÇÃO GLOBAL ---
// Ouve os "avisos" de navegação disparados por outros módulos.
document.addEventListener('navigate', (e) => {
    if (e.detail && e.detail.screenId) {
        showContentScreen(e.detail.screenId);
    }
});


export function showMessage(message, type, boxElement = elements.messageBox) {
    boxElement.textContent = message;
    boxElement.className = `message-box show ${type}`;
    setTimeout(() => {
        boxElement.className = 'message-box hidden';
    }, 5000);
}

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

function getPagePath(contentId) {
    switch (contentId) {
        case 'welcome-dashboard-content': return 'src/pages/welcome_dashboard.html';
        case 'vendas_geral': return 'src/pages/vendas_geral.html';
        case 'vendas_venda': return 'src/pages/vendas_venda.html';
        case 'vendas_orcamento': return 'src/pages/vendas_orcamento.html';
        case 'vendas_entrega': return 'src/pages/vendas_entrega.html';
        case 'estoque_geral': return 'src/pages/estoque_geral.html';
        case 'estoque_entrada_nf': return 'src/pages/estoque_entrada_nf.html';
        case 'estoque_cadastro_itens': return 'src/pages/estoque_cadastro_itens.html';
        case 'estoque_editar_item': return 'src/modals/estoque_editar_item.html'; 
        case 'clientes_geral': return 'src/pages/clientes_geral.html';
        case 'clientes_cadastro_rapido': return 'src/pages/clientes_cadastro_rapido.html';
        case 'relatorios_geral': return 'src/pages/relatorios_geral.html';
        case 'configuracoes_geral': return 'src/pages/configuracoes_geral.html';
        case 'configuracoes_usuarios': return 'src/pages/configuracoes_usuarios.html';
        case 'configuracoes_integracao': return 'src/pages/configuracoes_integracao.html';
        default: return '';
    }
}

async function loadPageContent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        return false;
    }
    if (container.dataset.loadedHtml === 'true' && containerId !== 'estoque_editar_item') {
        return true;
    }
    const htmlPath = getPagePath(containerId);
    if (!htmlPath) {
        return false;
    }
    try {
        const response = await fetch(htmlPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
        container.dataset.loadedHtml = 'true';
        return true;
    } catch (error) {
        container.innerHTML = `<p>Erro ao carregar o conteúdo.</p>`;
        return false;
    }
}

export async function showContentScreen(contentId) {
    const allContentScreens = document.querySelectorAll('.content-screen');
    allContentScreens.forEach(screen => screen.classList.add('hidden'));

    const contentDiv = document.getElementById(contentId);
    if (!contentDiv) {
        console.error(`Div de conteúdo com ID "${contentId}" não encontrada.`);
        return;
    }

    const htmlLoaded = await loadPageContent(contentId);

    if (htmlLoaded) {
        contentDiv.classList.remove('hidden');

        if (!initializedScreens.has(contentId)) {
            switch (contentId) {
                case 'estoque_cadastro_itens':
                    try {
                        const ItensManager = await import('./lista-estoque-itens.js');
                        const { setIdParaEditar } = await import('./editState.js');
                        
                        // Adiciona um listener que guarda o ID e troca de tela
                        const tableBody = document.querySelector('#itens-table tbody');
                        if (tableBody) {
                             tableBody.addEventListener('click', (event) => {
                                if (event.target && event.target.classList.contains('edit-button')) {
                                    const itemId = event.target.dataset.id;
                                    setIdParaEditar(itemId);
                                    // Chama esta mesma função para trocar para a tela de edição
                                    showContentScreen('estoque_editar_item'); 
                                }
                            });
                        }

                        // Adiciona os listeners da paginação
                        const prevButton = document.getElementById('prev-page-button');
                        const nextButton = document.getElementById('next-page-button');
                        if(prevButton){
                            prevButton.addEventListener('click', () => {
                                ItensManager.carregarItensNaPagina(ItensManager.getPaginaAtual() - 1);
                            });
                            nextButton.addEventListener('click', () => {
                                ItensManager.carregarItensNaPagina(ItensManager.getPaginaAtual() + 1);
                            });
                        }

                        screenDataLoaders[contentId] = ItensManager.carregarItensNaPagina;
                        initializedScreens.add(contentId);
                    } catch (error) {
                        console.error('Falha ao inicializar os eventos da tela de itens:', error);
                    }
                    break;
                
                case 'estoque_editar_item':
                    try {
                        const EditManager = await import('./estoque_editar_item.js');
                        // A função a ser chamada quando a tela for exibida
                        screenDataLoaders[contentId] = EditManager.inicializarFormularioEdicao;
                        initializedScreens.add(contentId);
                    } catch(error) {
                        console.error('Falha ao preparar a tela de edição de item:', error);
                    }
                    break;

                case 'configuracoes_integracao':
                    loadIntegrationSettings();
                    screenDataLoaders[contentId] = loadIntegrationSettings;
                    initializedScreens.add(contentId);
                    break;
            }
        }

        if (screenDataLoaders[contentId]) {
            screenDataLoaders[contentId]();
        }
    }
}


// --- RESTANTE DO SEU CÓDIGO ui.js (SEM ALTERAÇÕES) ---

export function updateSidebarSelection(screenKey) {
    elements.allSidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.screenKey === screenKey) {
            link.classList.add('active');
        }
    });

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

export function toggleAdminMenuItems(isAdmin) {
    if (elements.integrationSettingsMenuItem) {
        elements.integrationSettingsMenuItem.classList.toggle('hidden', !isAdmin);
    }
    if (elements.integrationSettingsMenuItemMobile) {
        elements.integrationSettingsMenuItemMobile.classList.toggle('hidden', !isAdmin);
    }
}

export function toggleMobileDrawer() {
    elements.mobileDrawer.classList.toggle('hidden');
    elements.drawerOverlay.classList.toggle('hidden');
}

export function showAlertDialog(title, message, isError = false) {
    alert(`${title}\n\n${message}`);
    if (isError) {
        console.error(`Alerta: ${title} - ${message}`);
    } else {
        console.info(`Alerta: ${title} - ${message}`);
    }
}

export function showConfirmationDialog(title, message) {
    return Promise.resolve(confirm(`${title}\n\n${message}`));
}

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