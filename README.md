# Cross-Origin Session Store

Data in SessionStorage is generally available only to JavaScript from the same origin that created it. Often times applications are hosted across multiple subdomains and this hinders the ability of applications to share data with each other. This utility provides a means to securely access data from SessionStorage of another origin using an iframe that contains a document from the target origin that you need to read/write from. See sample folder for example of how to use this utility. 

##Usage
For example, consider that you have an application running on http://source.example.com (SENDER) that needs to read/write data in SessionStorage from another application that is hosted on say http://target.example.com (RECEIVER).

First, update the code to set the allowed origins. This is required to prevent data being read by unauthorized third-parties.

````JavaScript
    //ACL - List of allowed domains. Can be a regular expression
    //local host is for unit tests only
    var ALLOWED_ORIGINS = ['^http://[a-z0-9-\.]+\.example\.com$', '^http://localhost:9876$'];
````
On the target domain, host a simple HTML file (say, x-origin-frame.html) that includes and initializes the utility to receive messages from the sender/source.

````
    <script>
            var sessionStore = new XOriginSessionStore({
                //define the source origin that would send messages
                senderOrigin: 'http://source.example.com'
            });
    <script>            
````
On the page that you wish to read/write session data on to target domain, add the following code. Set the receiverUrl to the URL of the HTML page hosted on the target domain (x-origin-frame.html)

````
    //handle to perform get/set operations
    var sessionStore;
    
    //initialize the component on page load
    window.addEventListener('load', function () {
        sessionStore = new XOriginSessionStore({
            receiverUrl: "http://target.example.com/files/x-origin-frame.html",
            mode: XOriginSessionStore.MODE_SENDER
        });
    });
````

To set data on to target origin

````
    sessionStore.setItem('key', 'value');
````

To read data from target origin

````
    sessionStore.getItem('key', function (value) {
        console.log('Value is ' + value);
    });
````

To remove data from target origin

````
    sessionStore.removeItem('key');
````

To clear everything on target origin - CAUTION: this will clear all data stored on the target domain, including ones not set by this utility.
Possible use is during logout when you need to wipe out everything.

````
    sessionStore.clear();
````

###Advanced Options
To perform additional operations on the target page on a set request, you can create 'onSetItem' handlers to perform the required tasks.

````
        window.addEventListener('load', function() {
            var sessionStore = new XOriginSessionStore({
                senderOrigin: 'http://sender.example.com'
            });
            sessionStore.onSetItem(onSetHandler);
        })

        function onSetHandler(key, value) {
            //do something more here, like calling a service to update this data server-side.
        }
````

##Author
arctix360

