// js/utils/domElements.js

export const DOMElements = {
    // ... (Seus elementos existentes) ...

    // --- NOVOS ELEMENTOS PARA CADASTRO DE ITEM DE ESTOQUE ---
    estoqueCadastroItemForm: document.getElementById('estoque-cadastro-item-form'),
    estoqueCadastroItemSistemaInput: document.getElementById('sistema-estoque'),
    estoqueCadastroItemUsuarioInput: document.getElementById('usuario-estoque'),

    // NOVOS CAMPOS ESPECÍFICOS PARA O ITEM
    estoqueCadastroItemIdInput: document.getElementById('item-id'), // Novo ID para o campo ID
    estoqueCadastroItemNameInput: document.getElementById('item-name'), // Novo ID para o campo Name
    estoqueCadastroItemGpInput: document.getElementById('item-gp'), // Novo ID para o campo GP
    estoqueCadastroItemSgpInput: document.getElementById('item-sgp'), // Novo ID para o campo SGP
    estoqueCadastroItemValorInput: document.getElementById('item-valor'), // Novo ID para o campo Valor
    estoqueCadastroItemStatusInput: document.getElementById('item-status'), // Novo ID para o campo Status

    // CAMPOS ANTERIORES (manter se ainda necessários)
    estoqueCadastroItemCodigoInput: document.getElementById('codigo'),
    estoqueCadastroItemDescricaoInput: document.getElementById('descricao'),
    estoqueCadastroItemUnidadeInput: document.getElementById('unidade'),
    estoqueCadastroItemGrupoInput: document.getElementById('grupo'),
    estoqueCadastroItemPrecoInput: document.getElementById('preco'),
    estoqueCadastroItemEstoqueInput: document.getElementById('estoque'),
    estoqueCadastroItemObservacaoInput: document.getElementById('observacao'),

    estoqueCadastroItemSubmitButton: document.getElementById('submit-item-button'),
    estoqueCadastroItemLoadingIndicator: document.getElementById('loading-item-indicator'),
    estoqueCadastroItemApiResponse: document.getElementById('api-item-response'),
    estoqueCadastroItemResponseMessage: document.getElementById('response-item-message'),
    estoqueCadastroItemResponseId: document.getElementById('response-item-id'),

    // ... (Seus elementos de diálogo existentes) ...
};