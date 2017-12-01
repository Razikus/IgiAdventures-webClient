var webSocket;
var console;
function initSockets()
{
    webSocket = new WebSocket("ws://" + IGISERVER + "/IgiAdventures/igisocket");
    webSocket.onmessage = function(evt) { onMessage(evt) };
    webSocket.onopen = function(evt) { onOpen(evt) };
    webSocket.onclose = function(evt) { onClose(evt) };
    webSocket.onerror = function(evt) { onError(evt) };
 }

function onOpen(evt)
{
    console = $("#console");
    recognizer(evt);
}

function onClose(evt)
{
    recognizer(evt);
}

function onMessage(evt)
{
	recognizer(evt);
}

function onError(evt)
{
	recognizer(evt);
}

function doSend(message)
{
	webSocket.send(message);
}
initSockets();
