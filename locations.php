<?php

include '/connection/connect.inc.php';

$timeFrame = 3;

//If post UpDate vaiable is set run following code otherwise return JASON of current markers.
if(isset($_POST['upDate'])){

	//Check what type of message is coming, new, update, edit etc... 0 = new, 1 = add message to existing hazard
    //3 = edit\delete message or marker status, validated as an integer before storing in variable.

	if(is_numeric($_POST['upDate'])){
        $messageOrUpdate = $_POST['upDate'];
    }

    if(is_numeric($_POST['m_ID'])){
        $message_ID = $_POST['m_ID'];
    }

    //setting long and lat coordinates- need to sanitise and validate
    if(is_numeric($_POST['latT'])){
        $latT = $_POST['latT'];
    }
    if(is_numeric($_POST['longT'])){
        $longT = $_POST['longT'];
    }
	if(is_numeric($_POST['hazIcon'])){
		$hazIcon = $_POST['hazIcon'];
	}

    //setting messages var, need to further sanitise and validate
    $message =  strip_tags(trim($_POST['message']) );

    echo ("$message_ID");
    echo ("<br>$message");
    echo ("<br>$longT");
    echo ("<br>$latT");
    echo ("<br>$messageOrUpdate");
	echo ("<br>$hazIcon");
	


$insertQuery ="INSERT INTO flag (hazard_Image, latT, LongT) VALUES ($hazIcon, $latT, $longT )";

  $markerInsertResult = mysqli_query($connection,$insertQuery);

    echo("<br> marker insert result $markerInsertResult");

  $markerInsertID = mysqli_insert_id($connection);

    echo ("<br> marker insert id $markerInsertID");

  $messageInsertQuery = "INSERT INTO message (flag_ID, message_Text) VALUES ( $markerInsertID, \"$message\" )";

    $messageInsertResult = mysqli_query($connection, $messageInsertQuery);

    echo("<br> message insert result $messageInsertResult");



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


    $marker = array();
    $arrayIndex= 0;

    //Build array of messages for each result returned from flag query, mesage 1, 2, 3 etc for each marker
    while($row = mysqli_fetch_assoc($flagResult)){


        $marker [$arrayIndex] = $row;

		$markerMessages = array();

        //Query returns messages associated with each marker. they are placed in array for each marker object
        $messageQuery= "SELECT message_ID, message_Text, message_TimeStamp FROM message WHERE flag_ID= '{$row['flag_ID']}'" ;

        $messageResult=mysqli_query($connection,$messageQuery);

        while($mRow = mysqli_fetch_assoc($messageResult)){
            $markerMessages[]= $mRow;
        }

        $marker[$arrayIndex]['message']=$markerMessages;



        $arrayIndex++;
    }
	

    return $marker;
}


?>



