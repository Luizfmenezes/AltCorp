
// js/modules/lista-estoque-itens.js

let paginaAtual = 1;
let itensExibidosAtualmente = [];
let filtrosAtivos = {};
let isLoading = false;

// Elementos DOM
const elements = {
    loadingMessage: null,
    itemsTable: null,
    itemsTableBody: null,
    noItemsMessage: null,
    paginationContainer: null,
    pageInfo: null,
    prevPageButton: null,
    nextPageButton: null,
    searchInput: null,
    searchButton: null,
    toggleFiltersButton: null,
    advancedFilters: null,
    applyFiltersButton: null,
    clearFiltersButton: null,
    refreshListButton: null,
    filterInputs: {}
};

// Inicialização do módulo
export function inicializarListaItens() {
    initializeElements();
    attachEventListeners();
    carregarItens();
}

// Inicializar referências dos elementos DOM
function initializeElements() {
    elements.loadingMessage = document.getElementById('loading-message');
    elements.itemsTable = document.getElementById('items-table');
    elements.itemsTableBody = document.getElementById('items-table-body');
    elements.noItemsMessage = document.getElementById('no-items-message');
    elements.paginationContainer = document.getElementById('pagination-container');
    elements.pageInfo = document.getElementById('page-info');
    elements.prevPageButton = document.getElementById('prev-page-button');
    elements.nextPageButton = document.getElementById('next-page-button');
    elements.searchInput = document.getElementById('search-input');
    elements.searchButton = document.getElementById('search-button');
    elements.toggleFiltersButton = document.getElementById('toggle-filters-button');
    elements.advancedFilters = document.getElementById('advanced-filters');
    elements.applyFiltersButton = document.getElementById('apply-filters-button');
    elements.clearFiltersButton = document.getElementById('clear-filters-button');
    elements.refreshListButton = document.getElementById('refresh-list-button');
    
    // Inputs de filtro
    elements.filterInputs = {
        id: document.getElementById('filter-id'),
        group: document.getElementById('filter-group'),
        subgroup: document.getElementById('filter-subgroup'),
        status: document.getElementById('filter-status')
    };
}

// Anexar event listeners
function attachEventListeners() {
    // Paginação
    if (elements.prevPageButton) {
        elements.prevPageButton.addEventListener('click', () => navegarPagina(-1));
    }
    if (elements.nextPageButton) {
        elements.nextPageButton.addEventListener('click', () => navegarPagina(1));
    }
    
    // Pesquisa
    if (elements.searchButton) {
        elements.searchButton.addEventListener('click', aplicarFiltros);
    }
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                aplicarFiltros();
            }
        });
    }
    
    // Filtros avançados
    if (elements.toggleFiltersButton) {
        elements.toggleFiltersButton.addEventListener('click', toggleAdvancedFilters);
    }
    if (elements.applyFiltersButton) {
        elements.applyFiltersButton.addEventListener('click', aplicarFiltros);
    }
    if (elements.clearFiltersButton) {
        elements.clearFiltersButton.addEventListener('click', limparFiltros);
    }
    if (elements.refreshListButton) {
        elements.refreshListButton.addEventListener('click', () => {
            limparFiltros();
            carregarItens();
        });
    }
    
    // Enter nos campos de filtro
    Object.values(elements.filterInputs).forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    aplicarFiltros();
                }
            });
        }
    });
}

// Carregar itens da API
async function carregarItens(pagina = 1, filtros = {}) {
    if (isLoading) return;
    
    isLoading = true;
    mostrarLoading(true);
    
    try {
        const dadosRequisicao = {
            sistema: 1,
            usuario: "kauik.becker",
            senha: "kauik123",
            pagina: pagina,
            filtros: Object.keys(filtros).length > 0 ? filtros : false
        };
        
        const response = await fetch('http://kauikserver.ddns.net:19695/lista/itens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosRequisicao)
        });
        
        if (!response.ok) {
            throw new Error(`Erro do servidor: ${response.status}`);
        }
        
        const dados = await response.json();
        
        if (Array.isArray(dados)) {
            itensExibidosAtualmente = dados;
            paginaAtual = pagina;
            filtrosAtivos = { ...filtros };
            
            atualizarUI({
                itens: dados,
                numeroDaPagina: pagina,
                fimDaLista: dados.length < 30
            });
        } else {
            throw new Error('Formato de resposta inválido');
        }
        
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
        mostrarMensagemErro(`Erro ao carregar itens: ${error.message}`);
    } finally {
        isLoading = false;
        mostrarLoading(false);
    }
}

// Aplicar filtros
function aplicarFiltros() {
    const filtros = {};
    
    // Filtro de pesquisa (nome)
    const searchTerm = elements.searchInput?.value?.trim();
    if (searchTerm) {
        // Se for um número, assume que é ID
        if (/^\d+$/.test(searchTerm)) {
            filtros.id = parseInt(searchTerm, 10);
        } else {
            filtros.nome = searchTerm;
        }
    }
    
    // Filtros avançados
    if (elements.filterInputs.id?.value) {
        filtros.id = parseInt(elements.filterInputs.id.value, 10);
    }
    if (elements.filterInputs.group?.value?.trim()) {
        filtros.grupo = elements.filterInputs.group.value.trim();
    }
    if (elements.filterInputs.subgroup?.value?.trim()) {
        filtros.subgrupo = elements.filterInputs.subgroup.value.trim();
    }
    if (elements.filterInputs.status?.value !== '') {
        filtros.status = parseInt(elements.filterInputs.status.value, 10);
    }
    
    // Resetar para página 1 ao aplicar filtros
    carregarItens(1, filtros);
}

// Limpar todos os filtros
function limparFiltros() {
    // Limpar campo de pesquisa
    if (elements.searchInput) {
        elements.searchInput.value = '';
    }
    
    // Limpar filtros avançados
    Object.values(elements.filterInputs).forEach(input => {
        if (input) {
            input.value = '';
        }
    });
    
    // Recarregar itens sem filtros
    filtrosAtivos = {};
    carregarItens(1, {});
}

// Toggle filtros avançados
function toggleAdvancedFilters() {
    if (elements.advancedFilters) {
        const isHidden = elements.advancedFilters.classList.contains('hidden');
        elements.advancedFilters.classList.toggle('hidden', !isHidden);
        
        // Atualizar texto do botão
        const icon = elements.toggleFiltersButton.querySelector('i');
        if (icon) {
            icon.className = isHidden ? 'ph ph-funnel-simple' : 'ph ph-funnel';
        }
    }
}

// Navegação de páginas
function navegarPagina(direcao) {
    const novaPagina = paginaAtual + direcao;
    if (novaPagina >= 1) {
        carregarItens(novaPagina, filtrosAtivos);
    }
}

// Atualizar interface do usuário
function atualizarUI({ itens, numeroDaPagina, fimDaLista, mensagem = null }) {
    // Atualizar informações de paginação
    if (elements.pageInfo) {
        elements.pageInfo.textContent = `Página ${numeroDaPagina}`;
    }
    
    if (elements.paginationContainer) {
        elements.paginationContainer.classList.remove('hidden');
    }
    
    if (elements.prevPageButton) {
        elements.prevPageButton.disabled = numeroDaPagina <= 1;
    }
    
    if (elements.nextPageButton) {
        elements.nextPageButton.disabled = fimDaLista;
    }
    
    // Atualizar tabela
    if (elements.itemsTableBody) {
        elements.itemsTableBody.innerHTML = '';
        
        if (itens && itens.length > 0) {
            itens.forEach(item => {
                const row = criarLinhaItem(item);
                elements.itemsTableBody.appendChild(row);
            });
            
            mostrarTabela(true);
            mostrarMensagemVazia(false);
        } else {
            mostrarTabela(false);
            mostrarMensagemVazia(true);
        }
    }
}

// Criar linha da tabela para um item
function criarLinhaItem(item) {
    const row = document.createElement('tr');
    
    // Formatar valor
    const valorFormatado = item.VALOR ? 
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(item.VALOR) : 'R$ 0,00';
    
    // Status
    const statusText = item.SITUACAO === 1 ? 'Ativo' : 'Inativo';
    const statusClass = item.SITUACAO === 1 ? 'status-active' : 'status-inactive';
    
    row.innerHTML = `
        <td>${item.ID || 'N/A'}</td>
        <td>${item.NOME || 'N/A'}</td>
        <td>${item.GRUPO || 'N/A'}</td>
        <td>${item.SUBGRUPO || 'N/A'}</td>
        <td>${valorFormatado}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td class="action-buttons">
            <button class="action-button edit-button" onclick="editarItem(${item.ID})" title="Editar">
                <i class="ph ph-pencil"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Função global para editar item (chamada pelo onclick)
window.editarItem = function(id) {
    import('./editState.js').then(({ setIdParaEditar }) => {
        setIdParaEditar(id);
        
        // Disparar evento de navegação para a tela de edição
        const navigateEvent = new CustomEvent('navigate', {
            detail: { screenId: 'estoque_editar_item' }
        });
        document.dispatchEvent(navigateEvent);
    });
};

// Controle de exibição
function mostrarLoading(show) {
    if (elements.loadingMessage) {
        elements.loadingMessage.classList.toggle('hidden', !show);
    }
}

function mostrarTabela(show) {
    if (elements.itemsTable) {
        elements.itemsTable.classList.toggle('hidden', !show);
    }
}

function mostrarMensagemVazia(show) {
    if (elements.noItemsMessage) {
        elements.noItemsMessage.classList.toggle('hidden', !show);
    }
}

function mostrarMensagemErro(mensagem) {
    mostrarTabela(false);
    mostrarMensagemVazia(false);
    
    if (elements.loadingMessage) {
        elements.loadingMessage.innerHTML = `
            <i class="ph ph-warning-circle"></i>
            ${mensagem}
        `;
        elements.loadingMessage.classList.remove('hidden');
    }
}

// Função para recarregar a lista (pode ser chamada externamente)
export function recarregarLista() {
    carregarItens(paginaAtual, filtrosAtivos);
}
