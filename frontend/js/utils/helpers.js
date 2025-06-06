// js/utils/helpers.js

import { DOMElements } from './domElements.js';

/**
 * Exibe uma mensagem na caixa de mensagens.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo da mensagem ('success' ou 'error').
 * @param {HTMLElement} boxElement - O elemento da caixa de mensagens (padrão: DOMElements.messageBox).
 */
export function showMessage(message, type, boxElement = DOMElements.messageBox) {
    boxElement.textContent = message;
    boxElement.className = `message-box show ${type}`;
    setTimeout(() => {
        boxElement.className = 'message-box hidden';
    }, 5000);
}

/**
 * Alterna a visibilidade das telas principais (login ou dashboard).
 * @param {HTMLElement} screenToShow - A tela a ser exibida.
 * @param {HTMLElement} screenToHide - A tela a ser ocultada.
 */
export function showScreen(screenToShow, screenToHide) {
    screenToHide.classList.remove('active');
    screenToHide.classList.add('hidden');
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

/**
 * Exibe um diálogo de confirmação personalizado.
 * @param {string} title - Título do diálogo.
 * @param {string} message - Mensagem do diálogo.
 * @returns {Promise<boolean>} - Resolve para true se confirmar, false se cancelar.
 */
export function showConfirmationDialog(title, message) {
    return new Promise(resolve => {
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';

        const dialogBox = document.createElement('div');
        dialogBox.className = 'dialog-box';
        dialogBox.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="dialog-actions">
                <button id="${DOMElements.dialogCancelButton}" class="secondary-button">Cancelar</button>
                <button id="${DOMElements.dialogConfirmButton}" class="primary-button">Confirmar</button>
            </div>
        `;
        dialogOverlay.appendChild(dialogBox);
        document.body.appendChild(dialogOverlay);

        document.getElementById(DOMElements.dialogCancelButton).onclick = () => {
            document.body.removeChild(dialogOverlay);
            resolve(false);
        };
        document.getElementById(DOMElements.dialogConfirmButton).onclick = () => {
            document.body.removeChild(dialogOverlay);
            resolve(true);
        };
    });
}

/**
 * Exibe um diálogo de alerta personalizado.
 * @param {string} title - Título do diálogo.
 * @param {string} message - Mensagem do diálogo.
 * @param {boolean} isError - Se a mensagem é de erro (afeta o estilo).
 */
export function showAlertDialog(title, message, isError = false) {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';

    const dialogBox = document.createElement('div');
    dialogBox.className = `dialog-box ${isError ? 'error' : 'success'}`;
    dialogBox.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="dialog-actions">
            <button id="${DOMElements.dialogOkButton}" class="primary-button">OK</button>
        </div>
    `;
    dialogOverlay.appendChild(dialogBox);
    document.body.appendChild(dialogOverlay);

    document.getElementById(DOMElements.dialogOkButton).onclick = () => {
        document.body.removeChild(dialogOverlay);
    };
}