<?php

include '/connection/connect.inc.php';



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

echo json_encode(getData($connection));

?>



