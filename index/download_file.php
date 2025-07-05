<?php
	require_once '../lib.php';
	$id=intval(@$_GET['d']);
	if ($id=="") exit;
	$con = dbconnect_mysqli();
	$statement="select url from capubbs.downloads where id=$id";
	$results=mysqli_query($con, $statement);
	if (mysqli_num_rows($results)==0) exit;
	$res=mysqli_fetch_row($results);
	$url=$res[0];
	$statement="update capubbs.downloads set times=times+1 where id=$id";
	mysqli_query($con, $statement);
	header("Location: $url");
	exit;
?>
