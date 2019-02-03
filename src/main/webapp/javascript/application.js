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
        reconnectInterval: 100,
        initialReconnectInterval: 100,
        maxReconnectInterval: 5000
    };

    request.increaseReconnectInterval = function () {
        this.reconnectInterval *= 2;
        this.reconnectInterval += Math.ceil(Math.random() * 50);
        this.reconnectInterval = Math.min(this.reconnectInterval, this.maxReconnectInterval);
        console.log("ATM: Increased reconnect interval to " + this.reconnectInterval + " ms");
    }

    request.resetReconnectInterval = function(){
        this.reconnectInterval = this.initialReconnectInterval;
    }

    request.onOpen = function (response) {
        console.log("ATM connected using "+response.transport);
        this.resetReconnectInterval();
        
        // Carry the UUID. This is required if you want to call subscribe(request) again.
        request.uuid = response.request.uuid;
        showStatus(response);
    };

    request.onClientTimeout = function (request) {
        console.log("ATM onClientTimeout, reconnecting in "+request.reconnectInterval);

        var self = this;
        setTimeout(function () {
            subSocket = socket.subscribe(self);
        }, this.reconnectInterval);
        showStatus(request);
    };

    request.onReopen = function (response) {
        console.log("ATM onReopen re-connected using " + response.transport);
        this.resetReconnectInterval();
        showStatus(response);
    };

    request.onTransportFailure = function (errorMsg, request) {
        console.log(errorMsg);
        request.fallbackTransport = "websocket";
        showStatus(request);
    };

    request.onMessage = function (response) {
        var message = response.responseBody;
        addMessage(message, new Date(), 'black');
        shift();
        addPoint(message);
        showStatus(response);
    };

    request.onClose = function (response) {
        console.log("ATM onClose - Server closed the connection ");
        this.increaseReconnectInterval();
        showStatus(response);
    };

    request.onError = function (response) {
        this.increaseReconnectInterval();
        console.log("ATM onError");
        var self = this;
        setTimeout(function(){
            subSocket = socket.subscribe(self);
        }, this.reconnectInterval);
    };

    request.onReconnect = function (request, response) {
        this.increaseReconnectInterval();
        console.log("ATM onReconnect in "+request.reconnectInterval);
        showStatus(request);
    };

    function log(message){
        console.log(message);
    }

    function addMessage(message, datetime, color) {
        content.append('<p color=' + color + '>[' + datetime.toLocaleTimeString()
            + '] : ' + message + '</p>');
    }

    function showStatus(obj){
        var status = JSON.stringify(obj, undefined, 2);
        $("#atmosphere_status").text(status);
    }

    subSocket = socket.subscribe(request);
});