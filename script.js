
	
/*
 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
 */

//Map stored as a javascript object so other functions can access it properties.
var map;

// Map Markers sotred in an array so they can be accessed later but other functions.
var markerArray = [];

var voteMarker;

//Variable set with default gps coordinates, this is used to center map initially if a your current location cannot be found.
var defaultLatLng = new google.maps.LatLng(45.8667, 170.5000);  // Default to Dunedin when no geolocation support



$( document ).on( "pageinit", "#map-page", function() {

	

    

	
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
		

		
		//This waits for the map to be at idle after loading the web page. then Runs what ever is inside first set of brackets.
		google.maps.event.addListenerOnce( map, 'idle', function() {
				
				//print message to console, useful for debugging.
				console.log('map at idle');
				
					//This loads data from our webserver and draws markers from it on the map 

					drawAllMarkers();
				
				
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
        	//console.log(marker.getPosition());
		
        }


		
		function drawAllMarkers(){

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

						var messagebox = "";

						var LatLng = new google.maps.LatLng(data.latT , data.longT);
						//console.log()

						$.each(data.message, function(i, message){

							//console.log(message.message_Text);

							messagebox += "<H3>" + message.message_TimeStamp + "</H3>" + "<p>" + message.message_Text +"</p>";
						});

						addMarker(LatLng, map, data.hazard_Image, messagebox);
					});

				}
			})

		}

	$('#voteButton').click(function(){
		//deleteMarkers();
		deleteOverlays();

		voteMarker = new google.maps.Marker({
			map: map,
			draggable: true,
			animation: google.maps.Animation.DROP,
			position: map.getCenter()
		});


		var markerBubble = new google.maps.InfoWindow({
			content: "Drag me to the location you want to report on."
		});
		//add speech bubble to map and marker created just above.
		markerBubble.open(map, voteMarker);
	});

	$('#confirmButton').click(function(){

		var iconSelected = $('input[name=radio-choice-b]:checked').val();
		console.log(iconSelected);
		var $formMessage = $('#messageText');

		console.log(voteMarker.getPosition().lat());
		console.log(voteMarker.getPosition().lng());
		var markerData = {
			upDate: 0,
			latT: voteMarker.getPosition().lat(),
			longT: voteMarker.getPosition().lng(),
			message: $formMessage.val(),
			hazIcon: iconSelected

		};

		$.ajax({
			type: 'POST',
			url: 'http://54.254.182.76/mapmob/locations.php',
			data: markerData,
			success: function(data) {
				console.log(data['success']);
				voteMarker.setMap(null);
				drawAllMarkers();
			},
			error: function(data){
				alert('error posting data');
				console.log(data['error']);
			}
		});



	});

	function deleteMarkers() {
		clearMarkers();
		markerArray = [];
	}

	function clearMarkers() {
		setMapOnAll(null);
	}

	// Sets the map on all markers in the array.
	function setMapOnAll(map) {
		for (var i = 0; i < markerArray.length; i++) {
			markerArray[i][0].setMap(map);
		}
	}



	function deleteOverlays() {
		if (markerArray) {
			for (i in markerArray) {
			
			console.log(i);
				markerArray[i][0].setMap(null);
			}
			markerArray.length = 0;
		}
	}
	
	$('#voteButton').click(function() { 
	
		$(this).hide();
		$('#confirmLocation').show();
	
	})
	
	$('#confirmLocation').click(function() {
	
		$(this).toggle();
		$('#voteButton').show();
		
	})
	
	
});
