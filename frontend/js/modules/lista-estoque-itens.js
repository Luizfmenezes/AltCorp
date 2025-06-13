// js/modules/lista-estoque-itens.js

let paginaAtual = 1;
let itensExibidosAtualmente = [];

function atualizarUI({ itens, numeroDaPagina, fimDaLista, mensagem = null }) {
    const itensTableBody = document.querySelector('#itens-table tbody');
    if (!itensTableBody) return;
    
    document.getElementById('page-info').textContent = `Página ${numeroDaPagina}`;
    document.getElementById('pagination-container').style.display = 'flex';
    document.getElementById('prev-page-button').disabled = numeroDaPagina <= 1;
    document.getElementById('next-page-button').disabled = fimDaLista;
    itensTableBody.innerHTML = '';

    if (mensagem) {
        document.getElementById('status-message').textContent = mensagem;
        document.getElementById('status-message').style.display = 'block';
        document.getElementById('itens-table').style.display = 'none';
    } else {
        document.getElementById('status-message').style.display = 'none';
        document.getElementById('itens-table').style.display = 'table';
        itens.forEach(item => {
            const row = itensTableBody.insertRow();
            row.insertCell().textContent = item.ID || 'N/A';
            row.insertCell().textContent = item.NOME || 'N/A';
            row.insertCell().textContent = item.GRUPO || 'N/A';
            row.insertCell().textContent = item.SUBGRUPO || 'N/A';
            row.insertCell().textContent = typeof item.VALOR === 'number' ? item.VALOR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A';
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `<button class="edit-button" data-id="${item.ID}">Editar</button>`;
        });
    }
}

async function buscarItensDaAPI(pagina) {
    try {
        const resposta = await fetch('http://kauikserver.ddns.net:19695/lista/itens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "sistema": 1, "usuario": "kauik.becker", "senha": "kauik123", "pagina": pagina, "filtros": {}
            })
        });
        if (!resposta.ok) throw new Error(`Erro do Servidor: ${resposta.status}`);
        const dados = await resposta.json();
        return Array.isArray(dados) ? dados : [];
    } catch (error) {
        return [];
    }
}

export async function carregarItensNaPagina(paginaParaCarregar = 1) {
    if (paginaParaCarregar < 1) return;
    
    paginaAtual = paginaParaCarregar;
    atualizarUI({ itens: [], numeroDaPagina: paginaAtual, fimDaLista: true, mensagem: 'Carregando...' });
    const itensRecebidos = await buscarItensDaAPI(paginaAtual);
    itensExibidosAtualmente = itensRecebidos;

    if (itensRecebidos.length > 0) {
        atualizarUI({ itens: itensRecebidos, numeroDaPagina: paginaAtual, fimDaLista: false });
    } else {
        const mensagem = paginaAtual === 1 ? 'Nenhum item encontrado.' : 'Não há mais itens.';
        atualizarUI({ itens: [], numeroDaPagina: paginaAtual, fimDaLista: true, mensagem: mensagem });
    }
}

// Retorna a página atual para o ui.js
export function getPaginaAtual() {
    return paginaAtual;
}