// js/modules/editState.js

// Uma variável privada do módulo para guardar o ID
let idParaEditar = null;

/**
 * Define o ID do item que será editado.
 * @param {number | string} id - O ID do item.
 */
export function setIdParaEditar(id) {
    idParaEditar = id;
}

/**
 * Obtém o ID do item que foi guardado para edição.
 * @returns {number | string | null} - O ID do item.
 */
export function getIdParaEditar() {
    return idParaEditar;
}