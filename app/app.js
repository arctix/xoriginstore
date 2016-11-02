(function() {

    //globals
    var URI_SENDER_ORIGIN;
    var URI_RECEIVER_ORIGIN;
    var MODE_RECEIVER = 'RECEIVER';
    var MODE_SENDER = 'SENDER';
    var callbacks = {};

    //ACL - List of allowed domains. Can be a regular expression
    //local host is for unit tests only
    var ALLOWED_ORIGINS = ['^http://[a-z0-9-\.]+\.example\.com$', '^http://localhost:9876$'];

    //constructor definition
    function XOriginSessionStore(config) {

        var configuration = config || {};
        var receiverUrl;

        //default un-initialized state
        this.initialized = false;

        //basic validation and initialization    
        //default configuration is for the page to be a 'RECEIVER'        
        try {
            this.mode = configuration.mode || MODE_RECEIVER; //default mode 
            receiverUrl = configuration.receiverUrl || window.location.origin;
            URI_RECEIVER_ORIGIN = getOriginFromURL(receiverUrl);
            URI_SENDER_ORIGIN = configuration.senderOrigin || window.top.location.origin;
        } catch (error) {
            //if this is child iframe and can't access parent domain, throw error (cross-domain access error)
            window.top.location.replace(window.self.location);
            console.log(error);
            throw new Error('Sender and Receiver not in the same TLD!', error);
        }

        var list = [];
        ALLOWED_ORIGINS.forEach(function(allowedOrigin) {
            if (URI_RECEIVER_ORIGIN.search(allowedOrigin) === 0)
                list.push(allowedOrigin);
            if (URI_SENDER_ORIGIN.search(allowedOrigin) === 0)
                list.push(allowedOrigin);
        });
        if (list.length != 2)
            throw new Error('Invalid origins ' + [URI_SENDER_ORIGIN, URI_RECEIVER_ORIGIN]);

        window.addEventListener('message', receiveMessage, false);

        //if the mode is SENDER, create the receiver iframe
        if (this.mode === MODE_SENDER) {
            var frameId = 'crossOriginHelperFrame';
            var frame = createIFrame(frameId, receiverUrl);
            this.targetFrame = frame.contentWindow;

            //wait for the iframe to load and then consider initialization as done
            var that = this;
            frame.addEventListener('load', function() {
                that.initialized = true;
            });
        } else {
            this.initialized = true;
        }
    }

    //constructor declaration
    XOriginSessionStore.prototype.constructor = XOriginSessionStore;

    //public setter method
    XOriginSessionStore.prototype.setItem = function(key, value) {
        if (!this.initialized)
            throw new Error('Not initialized!');
        this.targetFrame.postMessage({
            action: 'set',
            key: key,
            value: value
        }, URI_RECEIVER_ORIGIN);
    };

    //public getter method
    XOriginSessionStore.prototype.getItem = function(key, callback) {
        if (!this.initialized)
            throw new Error('Not initialized!');
        var id = Math.floor(Math.random() * 10000);
        callbacks[id] = callback;
        this.targetFrame.postMessage({
            action: 'get',
            key: key,
            id: id
        }, URI_RECEIVER_ORIGIN);
    };

    //public remove method
    XOriginSessionStore.prototype.removeItem = function(key) {
        if (!this.initialized)
            throw new Error('Not initialized!');
        this.targetFrame.postMessage({
            action: 'remove',
            key: key
        }, URI_RECEIVER_ORIGIN);
    };

    //public clear method
    XOriginSessionStore.prototype.clear = function() {
        if (!this.initialized)
            throw new Error('Not initialized!');
        this.targetFrame.postMessage({
            action: 'clear'
        }, URI_RECEIVER_ORIGIN);
    };

    //even listener for set calls on the target domain.
    //this can be used to perform extra actions necessary on the target domain when an item is set
    //Note callback does not happen on the same origin that item is set
    XOriginSessionStore.prototype.onSetItem = function(callback) {
        //keep just one callback for 'onSet' for an item
        callbacks.setItem = callback;
    };

    XOriginSessionStore.MODE_RECEIVER = MODE_RECEIVER;
    XOriginSessionStore.MODE_SENDER = MODE_SENDER;

    //function that receives events from postMessage calls
    function receiveMessage(event) {

        //validate the sender
        if (event.origin !== URI_SENDER_ORIGIN && event.origin !== URI_RECEIVER_ORIGIN) {
            console.error('Invalid origin - ', event.origin);
            return;
        }

        if (event.data.action === 'set') {
            sessionStorage.setItem(event.data.key, event.data.value);
            if (typeof callbacks.setItem === 'function')
                callbacks.setItem.call(this, event.data.key, event.data.value);
        } else if (event.data.action === 'get') {
            var data = sessionStorage.getItem(event.data.key);
            event.source.postMessage({
                action: 'return',
                key: event.data.key,
                value: data,
                id: event.data.id,
                mode: MODE_SENDER
            }, event.origin);
        } else if (event.data.action === 'remove') {
            sessionStorage.removeItem(event.data.key);
        } else if (event.data.action === 'clear') {
            sessionStorage.clear();
        } else if (event.data.action === 'return') {
            if (typeof callbacks[event.data.id] === 'function') {
                callbacks[event.data.id].call(this, event.data.value);
                delete callbacks[event.data.id];
            } else {
                console.error('Callback function not found for ' + event.data.id);
            }
        }
    }

    //creates a 0x0 iframe element with the given URL a source
    function createIFrame(id, url) {
        var iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.id = id;
        iframe.height = 0;
        iframe.width = 0;
        return document.body.appendChild(iframe);
    }

    //url parser
    function getOriginFromURL(url) {
        var parser = document.createElement('a');
        parser.href = url;
        if (!parser.origin) {
            //for IE - when origin property is not available
            return parser.protocol + "//" + parser.hostname + (parser.port && parser.port !== '80' && parser.port !== '443' ? ':' + parser.port : '');
        }
        return parser.origin;
    }

    //make this class globally visible
    window.XOriginSessionStore = XOriginSessionStore;

})();