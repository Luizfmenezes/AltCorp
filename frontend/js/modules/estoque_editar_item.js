// src/js/modules/estoque_editar_item.js

// Importa a função do nosso estado e a função de navegação do ui.js
import { getIdParaEditar } from './editState.js';
import { showContentScreen } from './ui.js';

// Função principal que será chamada pelo ui.js
export function inicializarFormularioEdicao() {
    const form = document.getElementById('edit-item-form');
    const loadingMessage = document.getElementById('loading-edit-form');
    const cancelButton = document.getElementById('cancel-edit-button');

    if (!form || !loadingMessage || !cancelButton) {
        console.error("Não foi possível inicializar o formulário de edição. Elementos faltando.");
        return;
    }
    
    // Pega o ID que foi guardado no estado
    const itemId = getIdParaEditar();

    if (!itemId) {
        loadingMessage.textContent = 'ERRO: ID do item não fornecido.';
        return;
    }

    // Adiciona os listeners aos botões deste formulário
    form.addEventListener('submit', salvarAlteracoes);
    cancelButton.addEventListener('click', voltarParaLista);

    // Inicia o carregamento dos dados do item
    carregarDadosDoItem(itemId, form, loadingMessage);
}

// Busca os dados do item na API
async function carregarDadosDoItem(itemId, form, loadingMessage) {
    form.style.display = 'none';
    loadingMessage.style.display = 'block';

    try {
        const resposta = await fetch('http://kauikserver.ddns.net:19695/lista/itens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "sistema": 1, "usuario": "kauik.becker", "senha": "kauik123", "pagina": 1, "filtros": { "id": parseInt(itemId, 10) }
            })
        });
        if (!resposta.ok) throw new Error(`Erro do Servidor: ${resposta.status}`);
        
        const dados = await resposta.json();
        if (Array.isArray(dados) && dados.length > 0) {
            preencherFormulario(dados[0], form, loadingMessage);
        } else {
            throw new Error('Item não encontrado.');
        }
    } catch (error) {
        loadingMessage.textContent = `Erro ao carregar dados: ${error.message}`;
    }
}

// Preenche o formulário com os dados recebidos da API
function preencherFormulario(item, form, loadingMessage) {
    document.getElementById('editItemId').value = item.ID;
    document.getElementById('editItemIdDisplay').value = item.ID;
    document.getElementById('editItemNome').value = item.NOME || '';
    document.getElementById('editItemGroupo').value = item.GRUPO || '';
    document.getElementById('editItemSubgrupo').value = item.SUBGRUPO || '';
    
    loadingMessage.style.display = 'none';
    form.style.display = 'block';
}

// Salva as alterações feitas no formulário
async function salvarAlteracoes(event) {
    event.preventDefault();
    const botaoSalvar = event.target.querySelector('button[type="submit"]');
    botaoSalvar.disabled = true;
    botaoSalvar.textContent = 'Salvando...';

    // --- LINHA DE DEPURAÇÃO ---
    // Vamos verificar o que o JavaScript está lendo do campo de input no momento do clique.
    const valorDoInputNome = document.getElementById('editItemNome').value;
    console.log("Valor lido do campo 'Nome':", valorDoInputNome);
    // -------------------------

    const dadosParaEnviar = {
        "sistema": 1,
        "usuario": "kauik.becker",
        "senha": "kauik123",
        "id": parseInt(document.getElementById('editItemId').value, 10),
        "descricao": valorDoInputNome, // Usamos a variável que acabamos de ler
        "grupo": false,
        "subgrupo": false
    };
    
    try {
        const response = await fetch('http://kauikserver.ddns.net:19695/alterar/item', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaEnviar)
        });
        const result = await response.json();
        if (response.ok && result.status === 1) {
            alert('Item atualizado com sucesso!');
            // Dispara o evento para voltar para a lista
            const navigateEvent = new CustomEvent('navigate', { detail: { screenId: 'estoque_cadastro_itens' } });
            document.dispatchEvent(navigateEvent);
        } else {
            throw new Error(result.mensagem || 'Erro desconhecido ao salvar.');
        }
    } catch (error) {
        alert(`Não foi possível salvar: ${error.message}`);
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = 'Salvar Alterações';
    }
}
// Função para navegar de volta para a tela de listagem
function voltarParaLista() {
    // ESTA FUNÇÃO AGORA CHAMA O showContentScreen importado
    showContentScreen('estoque_cadastro_itens');
}