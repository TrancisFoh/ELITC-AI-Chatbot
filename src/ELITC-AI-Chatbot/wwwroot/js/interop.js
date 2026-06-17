window.chatInterop = {
    initIcons: function () {
        if (window.lucide) {
            lucide.createIcons();
        }
    },
    scrollToBottom: function (elementId) {
        var element = document.getElementById(elementId);
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }
};
