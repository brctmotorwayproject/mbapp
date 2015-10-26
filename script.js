
	
/*
 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
 */
$( document ).on( "pageinit", "#map-page", function() {

	
    
	var defaultLatLng = new google.maps.LatLng(34.0983425, -118.3267434);  // Default to Hollywood, CA when no geolocation support
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
	
	var map;
	
    function drawMap(latlng) {
        var myOptions = {
            zoom: 10,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
		

		
        map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
		
		google.maps.event.addListener(map, 'click', function(event) {
		addMarker(event.latLng, map);
		
		
		
		});
		
		google.maps.event.addListenerOnce( map, 'idle', function() {
				console.log('map at idle');
				
				
					jQuery.ajax({
					type: 'GET',
					url: 'http://54.254.182.76/mapmob/locations.php',
						success: function(mPoints) {
					    var	datas = $.parseJSON(mPoints);
							$.each(datas, function(i, data) {
							
								//console.log(data.message);
								var LatLng = new google.maps.LatLng(data.latT , data.longT);
								console.log()
								addMarker(LatLng, map, data.flag_Image, data.message);
							});
						
						}
					})
				
				
				});

        
    }
	
	        function addMarker(location, map, iconPath, contentMessage) {
            // Add the marker at the clicked location, and add the next-available label
            // from the array of alphabetical characters.
            var marker = new google.maps.Marker({
                position: location,
		
                icon: iconPath,
                map: map
            });

            var markerBubble = new google.maps.InfoWindow({
                content: contentMessage
        });

        	markerBubble.open(map, marker);
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
