export function showMessage(message, type = 'info', boxId = 'message-box') {
    const box = document.getElementById(boxId);
    box.textContent = message;
    box.className = `message-box show ${type}`;
    setTimeout(() => {
        box.className = 'message-box hidden';
    }, 5000);
}
