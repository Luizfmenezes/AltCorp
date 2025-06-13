// teste_modal.js

// Espera o HTML estar completamente carregado para executar o script
document.addEventListener('DOMContentLoaded', () => {

    // Pega os 3 elementos com os quais vamos interagir
    const openModalButton = document.getElementById('meu-botao-editar');
    const closeModalButton = document.getElementById('meu-botao-fechar');
    const modal = document.getElementById('editItemModal');

    // Verifica se todos os elementos foram encontrados
    if (!openModalButton || !closeModalButton || !modal) {
        alert('Erro: Não foi possível encontrar os botões ou o modal no HTML de teste.');
        return;
    }

    // Adiciona a função de clique ao botão de ABRIR o modal
    openModalButton.addEventListener('click', () => {
        console.log('Botão de abrir clicado. Exibindo modal...');
        modal.style.display = 'flex';
    });

    // Adiciona a função de clique ao botão de FECHAR o modal ('X')
    closeModalButton.addEventListener('click', () => {
        console.log('Botão de fechar clicado. Escondendo modal...');
        modal.style.display = 'none';
    });

    // Adiciona uma função extra: fechar o modal se o usuário clicar fora da caixa branca
    modal.addEventListener('click', (event) => {
        // Se o local clicado (event.target) for o próprio fundo do modal
        if (event.target === modal) {
            console.log('Clique no fundo do modal. Escondendo modal...');
            modal.style.display = 'none';
        }
    });
    
    // Adiciona um listener ao formulário apenas para impedir o recarregamento da página
    const form = document.getElementById('editItemForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('O formulário seria salvo aqui!');
    });

    console.log('Script de teste do modal carregado e pronto.');

});