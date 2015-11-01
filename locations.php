<?php

include '/connection/connect.inc.php';

$timeFrame = 3;

//If post UpDate vaiable is set run following code otherwise return JASON of current markers.
if(isset($_POST['upDate'])){

	//Check what type of message is coming, new, update, edit etc... 0 = new, 1 = add message to existing hazard
    //3 = edit\delete message or marker status, validated as an integer before storing in variable.

	if(is_int($_POST['messageOrUpdate'])){
        $messageOrUpdate = $_POST['messageOrUpdate'];
    }

    //setting long and lat coordinates- need to sanitise and validate
    if(isset($_POST['latT'])){
        $latT = $_POST['latT'];
    }
    if(isset($_POST['longT'])){
        $LongT = $_POST['LongT'];
    }

    //setting messages var, need to further sanitise and validate
    $message =  strip_tags(trim($_POST['message']) );
	echo "$message";





}else{
	echo json_encode(getData($connection, $timeFrame));
}




//this function returns an array of marker objects and the associated messages.
function getData($connection, $timeFrame){

    //SQL query to return each marker from number for hours set in timeFrame Variable from current time.
    $flagQuery = "SELECT flag.flag_ID, hazard.hazard_Image, flag.longT, flag.latT FROM flag
                LEFT JOIN hazard ON hazard.hazard_ID=flag.hazard_Image
                WHERE flag.flag_TimeStamp > SUBDATE(now(), INTERVAL $timeFrame HOUR)";


    $flagResult = mysqli_query($connection,$flagQuery);

    $makerObjects = array();

    $staticIndex= 0;

    //Build array of messages for each result returned from flag query, mesage 1, 2, 3 etc for each marker
    while($row = mysqli_fetch_assoc($flagResult)){
        $marker = array();

        $marker [$staticIndex] = $row;

		$markerMessages = array();

        //Query returns messages associated with each marker. they are placed in array for each marker object
        $messageQuery= "SELECT message_ID, message_Text, message_TimeStamp FROM message WHERE flag_ID= '{$row['flag_ID']}'" ;

        $messageResult=mysqli_query($connection,$messageQuery);

        while($mRow = mysqli_fetch_assoc($messageResult)){
            $markerMessages[]= $mRow;
        }

        $marker[$staticIndex]['message']=$markerMessages;

        $makerObjects[] = $marker;

    }
	
	return $makerObjects;
}


?>



