console.log('This is the background paggggge.', chrome.runtime.id);
console.log('Put the background scripts here.');

chrome.runtime.onStartup.addListener( () => {
    console.log(`onStartup()`);
});

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        // May be empty.
    });
});

chrome.runtime.onMessageExternal.addListener(function(message) {
    switch (message.action) {
        case "openOptionsPage":
            openOptionsPage();
            break;
        default:
            break;
    }
});

function openOptionsPage(){
    chrome.runtime.openOptionsPage();
}