$(function () {
    "use strict";

    var header = $('#header');
    var content = $('#content');
    var status = $('#status');
    var socket = atmosphere;
    var subSocket;
    var transport = 'websocket';
    var fallbackTransport = 'sse';

    var request = {
        url: document.location.toString() + 'atmo',
        contentType: "application/json",
        logLevel: 'debug',
        transport: transport,
        fallbackTransport: fallbackTransport,
        reconnectInterval: 1000
    };

    request.onOpen = function (response) {
        content.html($('<p>', {
            text: 'Atmosphere connected using ' + response.transport
        }));
        transport = response.transport;

        // Carry the UUID. This is required if you want to call subscribe(request) again.
        request.uuid = response.request.uuid;
    };

    request.onClientTimeout = function (r) {
        content.html($('<p>', {
            text: 'Client closed the connection after a timeout. Reconnecting in ' + request.reconnectInterval
        }));
        subSocket.push(JSON.stringify({
            author: r.uuid,
            message: 'is inactive and closed the connection. Will reconnect in ' + request.reconnectInterval
        }));
        setTimeout(function () {
            subSocket = socket.subscribe(request);
        }, request.reconnectInterval);
    };

    request.onReopen = function (response) {
        content.html($('<p>', {
            text: 'Atmosphere re-connected using ' + response.transport
        }));
    };

    // For demonstration of how you can customize the fallbackTransport using the onTransportFailure function
    request.onTransportFailure = function (errorMsg, request) {
        atmosphere.util.info(errorMsg);
        request.fallbackTransport = "long-polling";

        header.html($('<h3>', {
            text: 'Transport failure'
        }));
    };

    request.onMessage = function (response) {
        var message = response.responseBody;
        addMessage(message, new Date(), 'black');
    };

    request.onClose = function (response) {
        content.html($('<p>', {
            text: 'Server closed the connection after a timeout'
        }));
        if (subSocket) {
            subSocket.push(atmosphere.util.stringifyJSON({
                message: 'disconnecting'
            }));
        }
    };

    request.onError = function (response) {
        content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your ' +
                'socket or the server is down'
        }));
    };

    request.onReconnect = function (request, response) {
        content.html($('<p>', {
            text: 'Connection lost, trying to reconnect. Trying to reconnect ' + request.reconnectInterval
        }));
    };

    subSocket = socket.subscribe(request);

    function addMessage(message, datetime, color) {
        content.append('<p color='+color+'>[' + datetime.toLocaleTimeString() 
            +'] : ' + message + '</p>');
    }
});