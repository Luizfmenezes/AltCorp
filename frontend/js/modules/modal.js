const button = document.getElementById('openModalButton');
const modal = document.getElementById('modalContainer');
const buttonClose = modal.getElementById('closeModalButton');

button.onClick = function() {
    modal.showModal();
}

buttonClose.onClick = function() {
    modal.close();
}