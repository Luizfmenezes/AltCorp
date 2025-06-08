// js/modules/modal.js

export function initializeModal() {
    const button = document.getElementById('openModalButton');
    const modal = document.getElementById('modalContainer');
    const buttonClose = document.getElementById('closeModalButton');

    // Verifica se os elementos foram encontrados antes de adicionar listeners
    if (button && modal && buttonClose) {
        // Remove listeners antigos para evitar duplicação se a função for chamada várias vezes
        // (Isso é importante se initializeModal for chamado em cada troca de tela)
        button.removeEventListener('click', openTheModal);
        buttonClose.removeEventListener('click', closeTheModal);
        modal.removeEventListener('click', closeOnBackdropClick);

        button.addEventListener('click', openTheModal);
        buttonClose.addEventListener('click', closeTheModal);
        modal.addEventListener('click', closeOnBackdropClick);

        console.log('Modal listeners inicializados!');
    } else {
        console.warn('Um ou mais elementos do modal não foram encontrados. Verifique IDs HTML: openModalButton, modalContainer, closeModalButton.');
    }
}

// Funções nomeadas para facilitar a remoção de listeners, se necessário
function openTheModal() {
    const modal = document.getElementById('modalContainer');
    if (modal) {
        modal.showModal();
    }
}

function closeTheModal() {
    const modal = document.getElementById('modalContainer');
    if (modal) {
        modal.close();
    }
}

function closeOnBackdropClick(event) {
    const modal = document.getElementById('modalContainer');
    if (modal && event.target === modal) {
        modal.close();
    }
}