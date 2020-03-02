<?php
const input = "برنامه";
const output = "plan.json";
$plan = file_get_contents(input);
$tokens = tokenize($plan);
$ast = [];
read_from_tokens($tokens, $ast);
file_put_contents(output, json_encode($ast));
file_put_contents("VERSION", (intval(
    @file_get_contents("VERSION"))+1));

/* Functions */
function tokenize ($str) {
    return explode("\n", preg_replace("/\n+/u", "\n", trim($str)));
}
function read_from_tokens (&$tokens, &$ast) {
    if(!$tokens) return null;
    $token = array_shift($tokens);
    if(is_row($token)) {
	$table = [];
	$table[] = parse_row($token);
	while($tokens and is_row($tokens[0]))
	    $table[] = parse_row(array_shift($tokens), $ast);
	$ast["table"][] = $table;
    }
    elseif(!is_comment($token))
	$ast["text"][] = $token;
    read_from_tokens($tokens, $ast);
}
function is_row ($token) {
    $token = trim($token);
    return substr($token, 0, 1) == "|" &&
	   substr($token, -1) == "|";
}
function parse_row ($token) {
    $token = trim($token);
    $token = substr($token, 1, -1);
    $rows = explode("|", $token);
    foreach($rows as $i => $r) {
	$rows[$i] = trim($r);
    }
    return $rows;
}
function is_comment ($token) {
    return substr($token, 0, 1) == "#" ||
	   substr($token, 0, 3) == "-*-";
}
?>
