// js/modules/itemManagement.js

import * as elements from './domElements.js';
import * as api from './api.js';
import { showMessage } from './ui.js';

/**
 * Renderiza os itens na tabela do DOM.
 * @param {Array<object>} items - Um array de objetos de item.
 */
function renderItemsTable(items) {
    elements.itemsTableBody.innerHTML = ''; // Limpa a tabela antes de popular

    if (!items || items.length === 0) {
        elements.itemsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum item encontrado.</td></tr>';
        return;
    }

    // A API de exemplo retorna uma lista dentro de um objeto, ex: { "itens": [...] }
    // Ajuste 'items.itens' se a sua API retornar o array diretamente.
    const itemsArray = items.itens || items;

    // Limita a 30 itens, conforme solicitado
    itemsArray.slice(0, 30).forEach(item => {
        const row = document.createElement('tr');
        
        // Formata o valor para moeda brasileira
        const formattedValue = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(item.valor || 0);

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.GP}</td>
            <td>${item.SGP}</td>
            <td>${formattedValue}</td>
            <td><span class="status ${item.status === 1 ? 'active' : 'inactive'}">${item.status === 1 ? 'Ativo' : 'Inativo'}</span></td>
        `;
        elements.itemsTableBody.appendChild(row);
    });
}

/**
 * Carrega os itens da API e os renderiza na tabela.
 */
async function loadItems() {
    try {
        const data = await api.fetchItems();
        if (data.status === 1) {
            renderItemsTable(data);
        } else {
            showMessage(data.mensagem || 'Erro ao carregar itens.', 'error', elements.itemMessageBox);
        }
    } catch (error) {
        console.error('Erro ao buscar itens:', error);
        showMessage('Falha na conexão ao buscar itens.', 'error', elements.itemMessageBox);
        elements.itemsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Erro ao carregar os dados.</td></tr>';
    }
}

/**
 * Manipula o evento de submissão do formulário de cadastro de item.
 * @param {Event} event 
 */
async function handleItemRegistration(event) {
    event.preventDefault();
    elements.submitItemButton.disabled = true;
    elements.submitItemButton.innerHTML = 'Cadastrando...';

    // Construindo o corpo da requisição com base no seu script de exemplo
    const requestBody = {
        sistema: 1, // Fixo, conforme exemplo
        usuario: sessionStorage.getItem('userName'), // Pega o usuário da sessão
        senha: "password_placeholder", // A API deveria validar pelo token, não pela senha aqui. Usando placeholder.
        status: parseInt(elements.itemStatusInput.value, 10),
        descricao: elements.descricaoItemInput.value,
        valor: parseFloat(elements.valorItemInput.value), // Novo campo de valor
        grupo: false, // Sempre cria um novo grupo
        grupoinfo: {
            status: 1,
            descricao: elements.grupoInfoDescricaoInput.value,
            exigeaprovacao: 0
        },
        subgrupo: false, // Sempre cria um novo subgrupo
        subgrupoinfo: {
            status: 1,
            descricao: elements.subgrupoInfoDescricaoInput.value
        },
        tipovalidade: 0, // Valores padrão do seu script
        validade: "",
        temgarantia: 0,
        garantia: ""
    };

    try {
        const result = await api.createItem(requestBody);
        if (result.status === 1) {
            showMessage(`Item "${result.descricao}" cadastrado com sucesso! ID: ${result.id}`, 'success', elements.itemMessageBox);
            elements.itemRegistrationForm.reset(); // Limpa o formulário
            await loadItems(); // Recarrega a tabela para mostrar o novo item
        } else {
            showMessage(`Erro: ${result.mensagem || 'Não foi possível cadastrar o item.'}`, 'error', elements.itemMessageBox);
        }
    } catch (error) {
        console.error('Erro ao cadastrar item:', error);
        showMessage('Falha de conexão ao cadastrar o item.', 'error', elements.itemMessageBox);
    } finally {
        elements.submitItemButton.disabled = false;
        elements.submitItemButton.innerHTML = '<i class="ph ph-plus-circle"></i> Cadastrar Item';
    }
}

/**
 * Inicializa a funcionalidade de gerenciamento de itens.
 * Adiciona os listeners de eventos e carrega os dados iniciais.
 */
export function initializeItemManagement() {
    if (elements.itemRegistrationForm) {
        elements.itemRegistrationForm.addEventListener('submit', handleItemRegistration);
    }

    // Carrega os itens quando a página é acessada pela primeira vez.
    // Verificamos se a tabela existe na página para evitar erros.
    if (elements.itemsTableBody) {
       loadItems();
    }
}