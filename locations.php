<?php

include '/connection/connect.inc.php';




if(isset($_POST['upDate'])){

	//echo ($_POST['upDate']);
	if(is_int($_POST['messageOrUpdate'])){
        $messageOrUpdate = $_POST['messageOrUpdate'];
    }

    if(is_int($_POST['latT'])){
        $latT = $_POST['latT'];
    }

    if(is_int($_POST['longT'])){
        $messageOrUpdate = $_POST['LongT'];
    }



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



