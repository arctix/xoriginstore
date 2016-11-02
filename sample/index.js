var sessionStore;
window.addEventListener('load', function () {
    sessionStore = new XOriginSessionStore({
        receiverUrl: "https://receiver.example.com/sample/x-domain-frame.html",
        mode: XOriginSessionStore.MODE_SENDER
    });
});

function getValue() {
    sessionStore.getItem(document.getElementById('dataKey').value, function (result) {
        document.getElementById('dataValue').value = result;
    });
}

function setValue() {
    sessionStore.setItem(document.getElementById('dataKey').value, document.getElementById('dataValue').value);
}

function clearValue() {
    sessionStore.removeItem(document.getElementById('dataKey').value);
}

function clearAll() {
    sessionStore.clear();
}