/***********
 * OU TM352 Block 3, TMA03: index.js
 *
 * To function correctly this file must be placed in a Cordova project and the appopriate plugins installed.
 * You need to complete the code which is commented with TODO.
 * This includes the FRs and a few other minor changes related to your HTML design decisions.
 *
 * Released by Chris Thomson / Stephen Rice: Dec 2020
 * Modified by Chris Thomson: November 2021
 * Modified by Chris Thomson: November 2022
 * Modified by Chris Thomson: March 2023 - To address changes in the API
 * Modified by Chris Thomson: March 14 2023 - remove stray bracket
 * Modified and submitted by (your name here)
 ************/

/**
 * Please remember to install the cleartext plugin:
 *
 * cordova plugin add cordova-plugin-enable-cleartext-traffic
 * cordova prepare
 */



// Execute in strict mode to prevent some common mistakes
"use strict";

// Declare a TaxiShare object for use by the HTML view
var controller;


document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
    // Create the TaxiShare object for use by the HTML view
    controller = new TaxiShare();
}

// JavaScript "class" containing the model, providing controller "methods" for the HTML view
function TaxiShare() {
    console.log("Creating controller/model");

    // PRIVATE VARIABLES AND FUNCTIONS - available only to code inside the controller/model
    // Note these are declared as function functionName() { ... }

    var BASE_GET_URL = "http://137.108.68.13/openstack/taxi/";
	// NOTE HTTPS: at the time of writting we are investigating the creating a https service
	//             this will increase compatibility with Android. If we get it working we 
    //             will ask you to modify the line above.	
    var BASE_URL = BASE_GET_URL;
	// NOTE CORS: if you get a CORS error we may recommend you insert code at this point.

    // HERE Maps code, based on:
    // https://developer.here.com/documentation/maps/3.1.19.2/dev_guide/topics/map-controls-ui.html
    // https://developer.here.com/documentation/maps/3.1.19.2/dev_guide/topics/map-events.html

    // Initialize the platform object:
    var platform = new H.service.Platform({
        // TODO: Change to your own API key or map will NOT work!
        apikey: "D9mTSMzg5VMYy4PH20Hs2b53KkDQkq8UoBg1JdWTuUs",
    });
    // Obtain the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();
    // Instantiate (and display) a map object:
    var map = new H.Map(
        document.getElementById("mapContainer"),
        defaultLayers.vector.normal.map,
        {
            zoom: 15,
            center: { lat: 52.04, lng: 0.75 },
        }
    );

    // Create the default UI:
    var ui = H.ui.UI.createDefault(map, defaultLayers);
    var mapSettings = ui.getControl("mapsettings");
    var zoom = ui.getControl("zoom");
    var scalebar = ui.getControl("scalebar");
    mapSettings.setAlignment("top-left");
    zoom.setAlignment("top-left");
    scalebar.setAlignment("top-left");
    // Enable the event system on the map instance:
    var mapEvents = new H.mapevents.MapEvents(map);
    // Instantiate the default behavior, providing the mapEvents object:
    new H.mapevents.Behavior(mapEvents);

    var markers = []; // array of markers that have been added to the map

    // get the current date and time and a date/time 10 minutes from now
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var timePlus10 = today.getHours() + ":" + (today.getMinutes() + 10)+ ":" + today.getSeconds();
    var dateTime = date+'T'+time;
    var timeNextTen = date+'T'+timePlus10;
    var currentAddress = ""; 
    
    // Action called after button pressed
    function onConfirm(buttonIndex) {
        alert('You selected button ' + buttonIndex);
    }
    
    // call the alert with the taxi place and time that is leaving
    function alertUser() {
        navigator.notification.confirm(
            'Taxi from: ' + currentAddress + " is leaving in the next ten minutes!",  // message
            onConfirm,         // callback
            'The following ride shares are about to leave:', // title
            ['Notify', 'dismiss']                  // buttonName
            );
                           
    }

    // TODO Lookup an address and add a marker to the map at the position of this address
    function addMarkerToMap(address) {
        if (address) {
            // Hint: If you call the OpenStreetMap REST API too frequently, your access will be blocked.
            //       We have provided a helper function to prevent this however if you open the app
            //       on several browser windows at once you may still run into problems.
            //       Consider hardcoding locations for testing.

            // Hint: To ensure a marker will be cleared by clearMarkersFromMap, use:
            //       markers.push(marker);
            //       to add it to the markers array
            var onSuccess = function (data) {
                // TODO 2(a) FR2.2
                // You need to implement this function
                // See the TMA for an explanation of the functional requirements

                // Hint: If you can't see the markers on the map if using the browser platform,
                //       try refreshing the page.
                
                // Create variable for the lon/lat. Write update to console then add markers to map.
                var lat1 = data[0].lat;
                var lon1 = data[0].lon;
                console.log("Lon/lat co-ordinates being passed for marker:" + lat1 + " " + lon1);
                var myMarker = new H.map.Marker({lat: lat1, lng: lon1});
                map.addObject(myMarker);  
                markers.push(myMarker);        
           
            };

            // Hint: We have provided the helper function nominatim.get which uses
            //       the OpenStreetMap REST API to turn an address into co-ordinates.
            //       It does this in such a way that requests are cached and sent to
            //       the OpenStreetMap REST API no more than once every 5 seconds.
            nominatim.get(address, onSuccess);

        }
    }

    // Clear any markers added to the map (if added to the markers array)
    function clearMarkersFromMap() {
        // This is implemented for you and no further work is needed on it
        markers.forEach(function (marker) {
            if (marker) {
                map.removeObject(marker);
            }
        });
        markers = [];
    }

    // Obtain the device location and centre the map
    function centreMap() {
        // This is implemented for you and no further work is needed on it

        function onSuccess(position) {
            console.log("Obtained position", position);
            var point = {
                lng: position.coords.longitude,
                lat: position.coords.latitude,
            };
            map.setCenter(point);
        }

        function onError(error) {
            console.error("Error calling getCurrentPosition", error);

            // Inform the user that an error occurred
            alert("Error obtaining location, please try again.");
        }

        // Note: This can take some time to callback or may never callback,
        //       if permissions are not set correctly on the phone/emulator/browser
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
        });
    }

    // TODO Update the map with addresses for orders from the Taxi Sharing API
    function updateMap() {
        // TODO adjust the following to get the required data from your HTML view
        var userid = getInputValue("userid", "user1");

        // TODO 2(a) FR2.1
        // You need to implement this function
        // See the TMA for an explanation of the functional requirements

        // Hint: You will need to call addMarkerToMap and clearMarkersFromMap.
        // Hint: If you cannot complete FR2.1, call addMarkerToMap with a fixed value
        //       to allow yourself to move on to FR2.2.
        //       e.g. addMarkerToMap("Milton Keynes Central");
        clearMarkersFromMap();
        
        function onListSuccess(obj) {
            console.log("Update map function: received obj", obj);

            if (obj.status == "success") {
                // Matches are in an array named "data" inside the object returned
                var matches = obj.data;

                // Inform the user what is happening
                alert("Finding Matches:" + matches.length + " Matchess");

                // Loop through each one and call the addMarkerToMap function with it as the argument
                matches.forEach(function (match) {
                    // update the console with what is happening and add marker to map
                    console.log("adding marker to map at: " + match.offer_address);
                    addMarkerToMap(match.offer_address);
                    currentAddress = match.offer_address;
                    console.log("start time: " + dateTime);
                    console.log("10 mins time:" + timeNextTen)
                    console.log("taxi time is:" + match.start )

                    // check if any mataches are leaving in the next 10 minutes
                    if (match.start > dateTime && match.start < timeNextTen) {
                        console.log("If statement has been triggered");
                        alertUser(); 
                    }

                });
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert(obj.status + " " + obj.data[0].reason);
            }
            
        }

        // Get all the matches for the given userid
        var listUrl = BASE_GET_URL + "matches?userid=" + userid;
        console.log("Match list: Sending GET to " + listUrl);
        $.ajax(listUrl, { type: "GET", data: {}, success: onListSuccess });

    }

    // Register userid with the taxi sharing service
    function register(userid) {
        // 2(a) FR3
        // This is implemented for you and no further work is needed on it

        // Note we have pre-registered your userid so using this is only required
        // should you want to add an additional (fictional) userid for testing.

        function onSuccess(obj) {
            console.log("register: received obj", obj);

            // Inform the user what happened
            if (obj.status == "success") {
                alert("User " + userid + " has been successfully registered.");
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert("Invalid userid: " + userid);
            }
        }

        // Post the userid to register with the Taxi Sharing API
        var url = BASE_URL + "users";
        console.log("register: sending POST to " + url);
        $.ajax(url, { type: "POST", data: { userid: userid }, success: onSuccess });
    }

    // TODO Offer a taxi for the given userid
    function offer(userid, address, startTime, endTime) {
        // TODO 2(a) FR1.1
        // You need to implement this function
        // See the TMA for an explanation of the functional requirements
        function onSuccess(obj) {
            console.log("offer: received obj", obj);

            // Inform the user what happened
            if (obj.status == "success") {
                alert("User " + userid + " offer has been sucessfully logged.");
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert("Invalid userid: " + userid);
            }
        }

        // Post a taxi offer with the Taxi Sharing API
        var url = BASE_URL + "orders";
        console.log("offer: sending POST to " + url);
        $.ajax(url, { type: "POST", data: { userid: userid, type: 0, address: address, start: startTime, end: endTime }, success: onSuccess });
        
    }

    // TODO Request an offered taxi for the given userid
    function request(userid, address, startTime) {
        // TODO 2(a) FR1.2
        // You need to implement this function
        // See the TMA for an explanation of the functional requirements
        function onSuccess(obj) {
            console.log("request: received obj", obj);

            // Inform the user what happened
            if (obj.status == "success") {
                alert("User " + userid + " request has been sucessfully logged.");
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert("Invalid userid: " + userid);
            }
        }

        // Post a taxi request with the Taxi Sharing API
        var url = BASE_URL + "orders";
        console.log("request: sending POST to " + url);
        $.ajax(url, { type: "POST", data: { userid: userid, type: 1, address: address, start: startTime }, success: onSuccess });
        
    }

    // Cancel all orders (offers and requests) for the given userid
    function cancel(userid) {
        // 2(a) FR1.3
        // This is implemented for you and no further work is needed on it

        function onDeleteSuccess(obj) {
            console.log("cancel/delete: received obj", obj);
        }

        function onListSuccess(obj) {
            console.log("cancel/list: received obj", obj);

            if (obj.status == "success") {
                // Orders are in an array named "data" inside the object returned
                var orders = obj.data;

                // Inform the user what is happening
                alert("Deleting " + orders.length + " orders");

                // Loop through each one and delete it
                orders.forEach(function (order) {
                    // Delete the order with this ID for the given userid
                    var deleteUrl = BASE_URL + "orders/" + order.id + "?userid=" + userid;
                    console.log("cancel/delete: Sending DELETE to " + deleteUrl);
                    $.ajax(deleteUrl, {
                        type: "DELETE",
                        data: {},
                        success: onDeleteSuccess,
                    });
                });
            } else if (obj.message) {
                alert(obj.message);
            } else {
                alert(obj.status + " " + obj.data[0].reason);
            }
        }

        // Get all the orders (offers and requests) for the given userid
        var listUrl = BASE_GET_URL + "orders?userid=" + userid;
        console.log("cancel/list: Sending GET to " + listUrl);
        $.ajax(listUrl, { type: "GET", data: {}, success: onListSuccess });
    }
 
    // PUBLIC FUNCTIONS - available to the view
    // Note these are declared as this.functionName = function () { ... };

    // Controller function to update map with matches to request or offer
    this.updateMap = function () {
        // 2(a) FR3
        // This is implemented for you and no further work is needed on it

        // Update map now
        updateMap();
    };
	
	// Controller function to centre map with matches to request or offer
    this.centreMap = function () {
        // 2(a) FR2.3
        // This is implemented for you and no further work is needed on it

        // Update map now
        centreMap();
    };

    // Controller function to register a user with the web service
    this.registerUser = function () {
        // 2(a) FR3
        // TODO adjust the following to get the userid from your HTML view
        var userid = getInputValue("userid", "user1");

        // Call the model using values from the view
        register(userid);
    };

    // Controller function for user to offer to share a taxi they have booked
    this.offerTaxi = function () {
        var defaultStartTime = convertToOrderTime(new Date());

        // TODO adjust the following to get the required data from your HTML view
        var userid = getInputValue("userid", "user1");
        var address = getInputValue("addr", "Milton Keynes Central Station");
        var startTime = getInputValue("time", defaultStartTime); // eg. 2020:12:18:14:38
        var hours = getInputValue("hours", "1"); // duration in hours

        // The following code is very sensitive to the formatting of the date/time.
        // The code above automatically populates a defaultStartTime of the correct
        // format based on the current date and time. If you have problems we
        // recommend you leave the input blank on the HTML and use the default.

        // The format of the date and time should be exactly like:
        // 2020:12:18:14:38
        // YYYY:MM:DD:HH:MM
        // OR like
        // 2021-04-01 12:00:00
        // YYYY-MM-DD HH:MM:SS

        // You may change the way this code works if you wish.
        // Please take care with the formatting of the dates for the API call!

        // The model requires an end time, but the view provides a duration, so...
        // ...convert the start time back to a Date object...
        var endDate = convertFromOrderTime(startTime);
        // ...add on the hours (ensuring the string is an integer first)...
        endDate.setHours(endDate.getHours() + parseInt(hours));
        // ...convert back to an end time string
        var endTime = convertToOrderTime(endDate);

        // Call the model using values from the view
        offer(userid, address, startTime, endTime);
    };

    // Controller function for user to request to share an offered taxi
    this.requestTaxi = function () {
        // TODO adjust the following to get the required data from your HTML view
        var userid = getInputValue("userid", "user1");
        var address = getInputValue("addr", "Open University, Milton Keynes");
        var startTime = getInputValue("time", convertToOrderTime(new Date()));

        // Call the model using values from the view
        request(userid, address, startTime);
    };

    // Controller function for user to cancel all their offers and requests
    this.cancel = function () {
        // TODO adjust the following to get the required data from your HTML view
        var userid = getInputValue("userid", "user1");

        // Call the model using values from the view
        cancel(userid);
    };
}
