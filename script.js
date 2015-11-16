

//Map stored as a javascript object with global scope so other functions can access it properties.
var map;

// Map Markers sotred in an array so they can be accessed later but other functions.
var markerArray = [];

//This stores the id that will be used to reference which marker has been click to have a message appened to it.
var markerIDforUpdate;

//this stores the object of the marker that will be used to mark a new location on the map.
var voteMarker;

//Variable set with default gps coordinates, this is used to center map initially if a your current location cannot be found.
var defaultLatLng = new google.maps.LatLng(-45.7307748, 170.5857255);  // Default to Blueskin bay when no geolocation support
var currentLatLng ;
//var refreshMarkers = false;
var ajaxurl = 'http://54.254.182.76/locations.php';

$( document ).on( "pageinit", "#two", function() {
//.ready(function(){
	
	if ( navigator.geolocation ) {
        function success(pos) {
            // Location found, show map with these coordinates
			currentLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			
        }
        function fail(error) {
			currentLatLng = defaultLatLng ;
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
            zoom: 12,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
		

		//drawing map on webpage @ id map-canvas
        map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
		
		//This is used to highlight the blue skin bay area, by placing a red overlay over the location, this halps users find blueskin bay ont he map when they have moved away from it.
		var blueskinArea = new google.maps.Circle({
		    strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			map: map,
			center:{ lat:-45.7307748, lng: 170.5857255},
			radius: 6000
		
		});
		
		//This waits for the map to be at idle after loading the web page.Tthen Runs what ever is inside the first set of brackets.
		google.maps.event.addListenerOnce( map, 'idle', function() {
				
				//print message to console, useful for debugging.
				//console.log('map at idle');
				
					//This loads data from our webserver and draws markers from it on the map. 
					drawAllMarkers();
						
				});

        
    }
	//This function is passed details required to draw a marker with a information window and draws in on the map
	function addMarker(location, map, iconPath, contentMessage) {

		var marker = new google.maps.Marker({
		position: location,
		icon: iconPath,
		map: map
		});

		// Add listend to marker, show inforwindo when clicked
		marker.addListener('click', function() {

		markerBubble.open(map, marker);

		});

			
			
		//add create speech bubble with text stored in contentMessage
        var markerBubble = new google.maps.InfoWindow({
			content: contentMessage
        });
			//add speech bubble to map and marker created just above.    
			//add marker and bubble to array to allow access to markers after iunstantation and allow them to be accessed and modified
		markerArray.push([marker,markerBubble]);
		
		
    }


	//this function loads all markes from the data base and darws them on the map, if builds the string that is added to the inforwindow as well.
	function drawAllMarkers(){
		
		jQuery.ajax({
			//type of ajax call
			type: 'GET',
			//location of webpage that generates data in JSON format(RESTful)
			url: ajaxurl,
			success: function(mPoints) {

				//on successfully getting data do the following
				var	datas = $.parseJSON(mPoints);
				//iterate through JSON array and convert data into map markers
				$.each(datas, function(i, data) {

					var LatLng = new google.maps.LatLng(data.latT , data.longT);
					
					// Build infowindow html and messages
					var messagebox = "<div class='bubbles'>";
					
					$.each(data.message, function(i, message){

						messagebox += "<H3>" + message.mesDate + "</H3>" + "<p>" + message.message_Text +"</p>";
						
					});
					
					if(data.resolved == 0){
					
					messagebox +=  "<a href='#addMesPop' data-rel='popup' data-position-to='window' data-transition='pop' class=' ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-mail ui-btn-icon-left ui-btn-b' onclick='setMarkID("+ data.flag_ID +")' >Add Message</a> <a href='#resolveHazPop' data-rel='popup' data-position-to='window' data-transition='pop' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-check ui-btn-icon-left ui-btn-b' onclick='setMarkID("+ data.flag_ID +")' >Resolve Hazard</a></div>";
					} else{
						
						messagebox += "<H3> Hazard Resolved</H3></div>";
						
					}

					addMarker(LatLng, map, data.hazard_Image, messagebox);
				});

			},
			
			error: function() {
				alert('Error loading web site makers, please check data connection and try again');
			}
		})

	}
	
	//when the add marker button is clicked this function removes currently diaplayed markers and drops a movable marked onto the map
	// that the user can drag to a location they want to identify as a hazard.
	$('#voteButton').click(function(){
		deleteOverlays();

		voteMarker = new google.maps.Marker({
			map: map,
			draggable: true,
			animation: google.maps.Animation.DROP,
			position: map.getCenter()
		});


		 markerBubble = new google.maps.InfoWindow({
			content: "<p class='bubbles'>Drag me to the location you want to report on.</p>"
		});
		markerBubble.open(map, voteMarker);
	});
	
	
	//this function is run when the confim button is pushed, it builds a JSON object to be sent via ajax back to the server for storage in the database
	$('#confirmButton').click(function(){
	
		$('#confirmLocation').hide();
		$('#voteButton').show();
		$('#viewButton').hide();
		$('#refreshButton').show();

		var iconSelected = $('input[name=radio-choice-b]:checked').val();
		
		var $formMessage = $('#messageText');

		var markerData = {
			upDate: 0,
			latT: voteMarker.getPosition().lat(),
			longT: voteMarker.getPosition().lng(),
			message: $formMessage.val(),
			hazIcon: iconSelected

		};
		
		

		$.ajax({
			type: 'POST',
			url: ajaxurl,
			data: markerData,
			success: function(data) {
				console.log(data['success']);
				voteMarker.setMap(null);
				drawAllMarkers();
			},
			error: function(data){

				alert('Error adding Marker to map, please check data connection and try again');
			}
		});



	});
	
	
	//this functiin builds a JSON object to adda message to a marker already ont he map.
	$('#confirmUpdate').click(function() {
	
		var formUpdateMessge = $('#updateText');
		
		
		var updateData ={
			upDate: 1,
			m_ID: markerIDforUpdate,
			message: formUpdateMessge.val()
		};
		
		console.log(updateData);
		
		$.ajax({
			type: 'POST',
			url: ajaxurl,
			data: updateData,
			success: function(data) {
				console.log(data['success']);
				deleteOverlays();
				drawAllMarkers();
			},
			error: function(data){
				alert('Error adding message, please check data connection and try again');
			}
		});
	
	});
	
	//this function resolves a marker, it builds a JSON object when is sent to the back end for processing
	$('#resolveHazard').click(function() {
	
		var formResolveMessge = $('#ResolveText');
		
		var updateData ={
			upDate: 2,
			m_ID: markerIDforUpdate,
			message: formResolveMessge.val()
		};
		
		console.log(updateData);
		
		$.ajax({
			type: 'POST',
			url: 'http://54.254.182.76/locations.php',
			data: updateData,
			success: function(data) {
				console.log(data['success']);
				deleteOverlays();
				drawAllMarkers();
			},
			error: function(data){
				alert('error posting data');
				console.log(data['error']);
			}
		});
	
	});
	

	//delet all markers off the map
	function deleteOverlays() {
		if (markerArray) {
			for (i in markerArray) {
			
			
				markerArray[i][0].setMap(null);
			}
			markerArray.length = 0;
		}
	}
	
	//the following functions are used to hide and display pop up forms and buttons 
	$('#voteButton').click(function() { 
	
		$(this).hide();
		$('#viewButton').show();
		$('#confirmLocation').show();
		$('#refreshButton').hide();
	
	})
	
	$('#confirmLocation').click(function() {
		
		$('#popupDialog').popup('open');
		
	})
	
	$('#viewButton').click(function() {
	
		$(this).hide();
		$('#voteButton').show();
		$('#confirmLocation').hide();
		$('#refreshButton').show();
		voteMarker.setMap(null);
		drawAllMarkers();
	})
	
	$('#refreshButton').click(function() {
		
		deleteOverlays();
		drawAllMarkers();
	
	})
	

	/*Could be used in future to refresh markers
	
	setInterval(function() {
		
		if(refreshMarkers == true){
		console.log('timer tick');
		}
		
	}, 6000);
	*/
	
	//this function address a bug where the map apears grey when moving from the main menu to the map, by resizing the map half a second after the page displays.
	$('#mapresize').click(function() {
		setTimeout(function(){
			google.maps.event.trigger(map,'resize');
			map.panTo(currentLatLng);
		}, 500);
		
	})
	
	
	$("#messageText").keyup(function(){
	var str_length = $("#messageText").val().length;
	$('#t1').html(str_length + " of 141");
	})
	
	$("#updateText").keyup(function(){
	var str_length = $("#updateText").val().length;
	$('#t2').html(str_length + " of 141");
	})
	
	$("#ResolveText").keyup(function(){
	var str_length = $("#ResolveText").val().length;
	$('#t3').html(str_length + " of 141");
	})
	
	

});


//Sets the markerIDforUpdate variable to the marker that was clicked on submitting a message to resolving a marker.
function setMarkID(idnum){
	
	markerIDforUpdate = idnum;	

}
	
