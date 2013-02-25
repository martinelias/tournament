<?php
/**
 * Created by JetBrains PhpStorm.
 * User: hennotaht
 * Date: 2/4/13
 * Time: 21:18
 * To change this template use File | Settings | File Templates.
 */
require 'config.php';
require 'modules/request.php';
require 'modules/user.php';
require 'modules/database.php';

if (file_exists('pages/' . $_request->controller . '/' . $_request->controller . '.php')) {
	require 'pages/' . $_request->controller . '/' . $_request->controller . '.php';
	$controller = new $_request->controller;
	$controller->{$_request->action}();
} else {
	echo "The page '{$_request->controller}' does not exist";
}

