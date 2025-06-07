// js/modules/estoque.js

import { API_BASE_URL, BEARER_TOKEN } from '../config.js';
import { DOMElements } from '../utils/domElements.js';
import { showMessage, showAlertDialog } from '../utils/helpers.js';

// --- Model (Lógica de Negócio para Estoque) ---
class EstoqueModel {
    async cadastrarItem(itemData) {
        try {
            // A URL da API pode precisar ser ajustada para o endpoint que aceita esses novos campos
            const response = await fetch(`${API_BASE_URL}/cadastrar-item-estoque`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${BEARER_TOKEN}` // Se seu endpoint precisar de token
                },
                body: JSON.stringify(itemData)
            });

            const data = await response.json();

            if (response.ok && data.status === 1) {
                return { success: true, message: data.mensagem || 'Item cadastrado com sucesso!', id: data.id };
            } else {
                return { success: false, message: data.mensagem || 'Erro ao cadastrar item. Tente novamente.' };
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro de item:', error);
            return { success: false, message: 'Erro de conexão ao cadastrar item. Verifique a rede.' };
        }
    }
}

// --- View (Manipulação da UI da Tela de Estoque) ---
class EstoqueView {
    constructor() {
        this.form = DOMElements.estoqueCadastroItemForm;
        this.submitButton = DOMElements.estoqueCadastroItemSubmitButton;
        this.loadingIndicator = DOMElements.estoqueCadastroItemLoadingIndicator;
        this.apiResponseDiv = DOMElements.estoqueCadastroItemApiResponse;
        this.responseMessage = DOMElements.estoqueCadastroItemResponseMessage;
        this.responseId = DOMElements.estoqueCadastroItemResponseId;
    }

    getItemFormData() {
        return {
            sistema: parseInt(DOMElements.estoqueCadastroItemSistemaInput.value),
            usuario: DOMElements.estoqueCadastroItemUsuarioInput.value,
            // NOVOS CAMPOS:
            id: DOMElements.estoqueCadastroItemIdInput.value ? parseInt(DOMElements.estoqueCadastroItemIdInput.value) : null, // ID pode ser opcional para novos cadastros
            name: DOMElements.estoqueCadastroItemNameInput.value,
            GP: DOMElements.estoqueCadastroItemGpInput.value,
            SGP: DOMElements.estoqueCadastroItemSgpInput.value,
            valor: parseFloat(DOMElements.estoqueCadastroItemValorInput.value),
            status: DOMElements.estoqueCadastroItemStatusInput.value,

            // CAMPOS ANTERIORES QUE PODEM SER REMOVIDOS OU RENOMEADOS SE SOBREPOSTOS:
            // Por exemplo, 'name' pode substituir 'descricao' e 'valor' substituir 'preco'.
            // Se 'codigo' e 'unidade' e 'grupo' ainda forem necessários, mantenha-os.
            codigo: DOMElements.estoqueCadastroItemCodigoInput.value,
            descricao: DOMElements.estoqueCadastroItemDescricaoInput.value, // Mantendo por enquanto, decida se 'name' o substitui
            unidade: DOMElements.estoqueCadastroItemUnidadeInput.value,
            grupo: DOMElements.estoqueCadastroItemGrupoInput.value, // Mantendo por enquanto, decida se 'GP' ou 'SGP' o substitui
            preco: parseFloat(DOMElements.estoqueCadastroItemPrecoInput.value), // Mantendo por enquanto, decida se 'valor' o substitui
            estoque: parseInt(DOMElements.estoqueCadastroItemEstoqueInput.value),
            observacao: DOMElements.estoqueCadastroItemObservacaoInput.value
        };
    }

    setFormState(submitting) {
        this.submitButton.disabled = submitting;
        this.submitButton.classList.toggle('opacity-50', submitting);
        this.submitButton.classList.toggle('cursor-not-allowed', submitting);
        this.loadingIndicator.classList.toggle('hidden', !submitting);
    }

    displayResponse(result) {
        this.apiResponseDiv.classList.remove('hidden');
        if (result.success) {
            this.apiResponseDiv.classList.remove('bg-red-100', 'border-red-400', 'text-red-700');
            this.apiResponseDiv.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
            this.responseMessage.textContent = result.message;
            this.responseId.textContent = `ID do Item: ${result.id}`; // Assume que a API retorna 'id'
            this.form.reset(); // Limpa o formulário em caso de sucesso
            // Preenche o ID e Usuário novamente se eles são fixos
            DOMElements.estoqueCadastroItemSistemaInput.value = '1';
            DOMElements.estoqueCadastroItemUsuarioInput.value = 'admin';
        } else {
            this.apiResponseDiv.classList.remove('bg-green-100', 'border-green-400', 'text-green-700');
            this.apiResponseDiv.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
            this.responseMessage.textContent = `Erro: ${result.message}`;
            this.responseId.textContent = '';
        }
    }

    clearResponse() {
        this.apiResponseDiv.classList.add('hidden');
        this.responseMessage.textContent = '';
        this.responseId.textContent = '';
    }

    // Binds
    bindSubmitItem(handler) {
        this.form.addEventListener('submit', handler);
    }
}

// --- Controller (Gerencia a Lógica da Tela de Estoque) ---
class EstoqueController {
    constructor() {
        this.estoqueModel = new EstoqueModel();
        this.estoqueView = new EstoqueView();

        this.estoqueView.bindSubmitItem(this.handleSubmitItem.bind(this));
    }

    // Método a ser chamado quando a tela de cadastro de item for ativada
    initEstoqueCadastroScreen() {
        // Limpa mensagens anteriores ao carregar a tela
        this.estoqueView.clearResponse();
        // Pré-popula campos fixos
        DOMElements.estoqueCadastroItemSistemaInput.value = '1';
        DOMElements.estoqueCadastroItemUsuarioInput.value = 'admin';
    }

    async handleSubmitItem(event) {
        event.preventDefault();

        this.estoqueView.clearResponse();
        this.estoqueView.setFormState(true); // Desabilita botão e mostra loading

        const itemData = this.estoqueView.getItemFormData();
        const result = await this.estoqueModel.cadastrarItem(itemData);

        this.estoqueView.setFormState(false); // Habilita botão e esconde loading
        this.estoqueView.displayResponse(result);
    }
}

export default EstoqueController;