<?php
	require_once 'dbconnector.php';
	
	header('Content-type: text/json');
	echo '[';
	//   echo '  { "date": "2013-03-19 17:30:00", "type": "meeting", "title": "Test Last Year", "description": "Lorem Ipsum dolor set", "url": "" },';
	//  echo '  { "date": "2013-03-23 17:30:00", "type": "meeting", "title": "Test Next Year", "description": "Lorem Ipsum dolor set", "url": "http://www.event3.com/" },';
	
	dbconnect();
	$statement="select * from capubbs.calendar";
	$results=mysql_query($statement);
	$x=1;
	while ($res=mysql_fetch_array($results)) {
		if ($x==0) echo ',';
	
		$year=$res[0];
		$month=$res[1];
		$day=$res[2];
		$time=$res[3];
		$title=$res[4];
		$text=$res[5];
	
		echo '{ "date":"'.$year.'-'.$month.'-'.$day.' '.$time.':00","type":"meeting","title":"'.$title.'","description":"'.$text.'","url":""}';
		$x=0;
	}
	
	echo ']';
?>
