
	
/*
 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
 */
$( document ).on( "pageinit", "#map-page", function() {

	
    //Variable set with default gps coordinates, this is used to center map initially if a your current location cannot be found. 
	var defaultLatLng = new google.maps.LatLng(34.0983425, -118.3267434);  // Default to Hollywood, CA when no geolocation support
    
	//Map stored as a javascript object so other functions can access it properties.
	var map;
	
	// Map Markers sotred in an array so they can be accessed later but other functions.
	var markerArray = [];
	
	if ( navigator.geolocation ) {
        function success(pos) {
            // Location found, show map with these coordinates
            drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        }
        function fail(error) {
            drawMap(defaultLatLng);  // Failed to find location, show default map

        }
        // Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
    } else {
        drawMap(defaultLatLng);  // No geolocation support, show default map
    }
	

	// This function is called to draw the map initially, is needs to be supplied with a lat and long (gps) location
	// eg var LatLng = new google.maps.LatLng(123456 , 123456); 
    function drawMap(latlng) {
        var myOptions = {
            zoom: 10,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
		

		//drawing map on webpage @ id map-canvas
        map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
		
		//this adds a listener to the map for click and touches, when click the addmarker() functions is called and draws a marker at the location clicked. 
		google.maps.event.addListener(map, 'click', function(event) {
		
		// this marker is added at load, "need t make this drag-able"
		addMarker(event.latLng, map);
		
		});
		
		//This waits for the map to be at idle after loading the web page. then Runs what ever is inside first set of brackets.
		google.maps.event.addListenerOnce( map, 'idle', function() {
				
				//print message to console, useful for debugging.
				console.log('map at idle');
				
					//This loads data from our webserver and draws markers from it on the map 
					
					jQuery.ajax({
					//type of ajax call
					type: 'GET',
					//location of webpage that generates data in JSON format(FESRful)
					url: 'http://54.254.182.76/mapmob/locations.php',
						success: function(mPoints) {
						
						//on successfully getting data fdo the following
					    var	datas = $.parseJSON(mPoints);
						//iterate through JSON array and convert data into map markers
							$.each(datas, function(i, data) {
							
								//console.log(data.message);
								var LatLng = new google.maps.LatLng(data.latT , data.longT);
								//console.log()
								addMarker(LatLng, map, data.flag_Image, data.message);
							});
						
						}
					})
				
				
				});

        
    }
	
	        function addMarker(location, map, iconPath, contentMessage) {
            // Add the marker at the clicked location
            var marker = new google.maps.Marker({
                position: location,
		
                icon: iconPath,
                map: map
            });
			
			//add create speech bubble with text stored in contentMessage
            var markerBubble = new google.maps.InfoWindow({
                content: contentMessage
        });
			//add speech bubble to map and marker created just above.
        	markerBubble.open(map, marker);
			//add marker and bubble to array
			markerArray.push([marker,markerBubble]);
		
		//print marker position to console - used for debug
        	console.log(marker.getPosition());
		
        }
		
	/*
		
	 jQuery.ajax({
		type: 'GET',
		url: 'http://54.254.182.76/mapmob/locations.php',
			success: function(mPoints) {
			
			$.each(mPoints, function(i, point) {
			
			var LatLng = new google.maps.LatLng(point.latT + ',' + point.longT);
				addMarker(LatLng, map, point.flsg_Image, point.message);
			})
			
			}
		})
		*/
	
});
