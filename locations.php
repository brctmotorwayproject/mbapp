<?php

include '/connection/connect.inc.php';



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
	echo json_encode(getData($connection));
}




function getData($connection){

    //Get data from last 6 hours of votes
    $sqlQuery = "SELECT * FROM mwapp";


    $result = mysqli_query($connection,$sqlQuery);

	$data = array();
	
    while($row = mysqli_fetch_assoc($result)){
        
		$lineArray = array();
		
		

		$data [] = $row;
    }
	
	return $data;
}

//echo json_encode(getData($connection));

?>



