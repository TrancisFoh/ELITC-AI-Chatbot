window.scrollToBottom = (elementId) => {
    var element = document.getElementById(elementId);
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}
window.triggerLucide = () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
window.chatInputInit = () => {
    var element = document.getElementById('chat-input-textarea');
    if (element) {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
            }
        });
    }
}
