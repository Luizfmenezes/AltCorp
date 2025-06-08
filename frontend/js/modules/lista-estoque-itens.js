// frontend/js/modules/lista-estoque-itens.js

async function listarItens(pagina = 1, filtros = {}) {
    const url = 'http://kauikserver.ddns.net:19695/lista/itens';
    const data = {
        "sistema": 1,
        "usuario": "kauik.becker",
        "senha": "kauik123",
        "pagina": pagina,
        "filtros": filtros
    };

    console.log("Enviando requisição POST para:", url);
    console.log("Com os dados:", JSON.stringify(data, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json(); 
        
        console.log("Resposta completa da API (HTTP Status):", response.status);
        console.log("Resposta JSON da API:", result); 

        if (response.ok) {
            console.log("Requisição bem-sucedida.");
        } else {
            console.error("Erro na requisição. Mensagem da API:", result.mensagem || result.detail || "Erro desconhecido");
        }
        return result; 
    } catch (error) {
        console.error("Erro ao conectar ou processar a API:", error);
        throw error;
    }
}

export async function carregarItensNaPagina() { // Adicionado 'export'
    const itensTableBody = document.querySelector('#itens-table tbody');
    const statusMessage = document.getElementById('status-message');
    const itensTable = document.getElementById('itens-table');
    
    // Adicionado: Verificação para garantir que os elementos existem antes de manipulá-los
    if (!itensTableBody || !statusMessage || !itensTable) {
        console.warn("Elementos da tabela de itens (tbody, status-message, itens-table) não encontrados. A tela pode não estar totalmente carregada ou há um problema de ID.");
        // Não continua a execução se os elementos essenciais não forem encontrados
        return; 
    }

    // 1. Resetar o estado da UI: Mostrar carregando e esconder a tabela
    itensTableBody.innerHTML = '';
    statusMessage.className = 'loading';
    statusMessage.textContent = 'Carregando itens...';
    statusMessage.style.display = 'block';
    itensTable.style.display = 'none';

    try {
        const itens = await listarItens(1);
        
        // 2. Verificar se os dados são válidos e não estão vazios
        if (itens && Array.isArray(itens) && itens.length > 0) {
            // 3. Ocultar mensagem de status e mostrar a tabela
            statusMessage.style.display = 'none'; 
            itensTable.style.display = 'table';

            // 4. Popular a tabela com os itens
            itens.forEach(item => {
                const row = itensTableBody.insertRow(); 
                
                row.insertCell().textContent = item.ID || 'N/A';
                row.insertCell().textContent = item.NOME || 'N/A';
                row.insertCell().textContent = item.GRUPO || 'N/A';
                row.insertCell().textContent = item.SUBGRUPO || 'N/A';
                row.insertCell().textContent = item.VALOR !== null ? item.VALOR : 'N/A'; 
            });
        } else {
            // 5. Exibir mensagem de "nenhum item encontrado"
            statusMessage.className = 'no-data'; 
            statusMessage.textContent = 'Nenhum item encontrado ou dados vazios na resposta da API.';
            statusMessage.style.display = 'block';
            itensTable.style.display = 'none';
        }
    } catch (error) {
        // 6. Exibir mensagem de erro
        statusMessage.className = 'error';
        statusMessage.textContent = 'Erro ao carregar os itens. Verifique o console para mais detalhes.';
        statusMessage.style.display = 'block';
        itensTable.style.display = 'none';
    }
}

// REMOVIDO OU COMENTADO: Esta linha será gerenciada pelo ui.js
// document.addEventListener('DOMContentLoaded', carregarItensNaPagina);