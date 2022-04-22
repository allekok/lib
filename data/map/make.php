<?php
const input = "قفسه‌ها";
const output = "map.json";

$org = file_get_contents(input);
$tokens = tokenize($org);
$read = [];
read_from_tokens($tokens, $read);
file_put_contents(output, json_encode(list_labels($read)));
file_put_contents("VERSION", intval(@file_get_contents("VERSION")) + 1);

/* Functions */
function tokenize($str) {
	return explode("\n", preg_replace("/\n+/u", "\n", trim($str)));
}
function read_from_tokens(&$tokens, &$read) {
	if(!$tokens)
		return null;
	$token = array_shift($tokens);
	if(is_header($token) == "h1") {
		$L = [];
		while($tokens and is_header($tokens[0]) != "h1") {
			$L[eng_num(trim(mb_substr($tokens[0], 7)))] =
				read_from_tokens($tokens, $read);
		}
		$read[eng_num(trim(mb_substr($token, 14)))] = $L;
		read_from_tokens($tokens, $read);
	}
	elseif(is_header($token) == "h2") {
		$L = [];
		while($tokens and !is_header($tokens[0]))
			$L[] = read_from_tokens($tokens, $read);
		return $L;
	}
	elseif(is_row($token)) {
		$token = trim(substr($token, 1, -1));
		$row = explode("|", $token);
		$row[1] = trim_foreach(explode(",", @$row[1]));
		return $row[1];
	}
	elseif(is_comment($token))
		read_from_tokens($tokens, $read);
}
function trim_foreach($arr) {
	foreach($arr as $k => $v) {
		$arr[$k] = trim($v);
	}
	return $arr;
}
function is_header($token) {
	if(substr($token, 0, 2) == "* ")
		return "h1";
	elseif(substr($token, 0, 3) == "** ")
		return "h2";
	return false;
}
function is_comment($token) {
	if(substr($token, 0, 1) == "#")
		return "#";
	elseif(substr($token, 0, 3) == "-*-")
		return "-*-";
	return false;
}
function is_row($token) {
	$token = trim($token);
	return substr($token, 0, 1) == "|" and "|" == substr($token, -1);
}
function list_labels($tree) {
	$list = [];
	foreach($tree as $SET => $columns) {
		foreach($columns as $COL => $rows) {
			foreach($rows as $r => $labels) {
				foreach($labels as $l => $LABEL) {
					$list[$LABEL][$SET][$COL][] = $r;
				}
			}
		}
	}
	return $list;
}
function eng_num($str) {
	return str_replace(["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
			   ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
			   $str);
}
?>
