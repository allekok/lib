<?php
require("constants.php");
$ar_signs =["ِ", "ُ", "ٓ", "ٰ", "ْ", "ٌ", "ٍ", "ً", "ّ", "َ"];
$extras = ["?", "!", "#", "&","*", "(", ")", "-","+",
	   "=", "_","[", "]", "{","}","<",">","\\","/",
	   "|", "'","\"", ";", ":", ",",".", "~", "`",
	   "؟", "،", "»", "«","ـ","؛","›","‹","•","‌",
	   "\u{200E}","\u{200F}"];
$_assoc = [
    'en' => ['0','1','2','3','4','5','6','7','8','9'],	
    'fa' => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'],
    'ckb' => ['٠', '١', '٢', '٣', '٤','٥', '٦', '٧', '٨', '٩'],
];
$N = [0, ""];

$sql = mysqli_connect(SQL_HOST, SQL_USER, SQL_PASS, SQL_DATABASE);
$query = "SELECT * FROM `" . SQL_TABLE_DEF . "`";
$result = mysqli_query($sql, $query);

while($record = mysqli_fetch_assoc($result))
{
    $title = str_replace(["عنوان‏:","Title‎:"], "", $record["عنوان‏"]);
    $title_san = sanitize_str($title);
    $title_chars = chars($title_san, 1);
    $record_str = implode_assoc_array($record);
    $path = DEST_PATH . "/" . implode("/", $title_chars);
    @mkdir($path, 0755, TRUE);
    $path .= "/{$record["ردیف"]}"; /* Almost Unique */
    file_put_contents($path, $record_str);
    echo "$path\n";
}

list_files(DEST_PATH);
print_r($N);

mysqli_close($sql);

file_put_contents(VERSION_PATH,
		  (1 + @intval(file_get_contents(VERSION_PATH))));

/* Functions */
function chars ($s, $limit=-1)
{
    $i = 0;
    $chars = [];
    while($c = mb_substr($s, $i++, 1))
    {
	if($limit-- == 0)
	    break;
	$chars[] = $c;
    }
    return $chars;
}
function implode_assoc_array ($arr, $del1=":", $del2="\n")
{
    $new_arr = [];
    foreach($arr as $k => $v)
    {
	$new_arr[] = $k . $del1 . $v . $del2;
    }
    return $new_arr;
}
function sanitize_str ($s)
{
    global $ar_signs, $extras;
    $s = str_replace($extras, "", $s);
    $s = str_replace($ar_signs, "", $s);
    $s = str_replace(["ي","ك"], ["ی","ک"], $s);
    $s = strtolower($s);
    $s = num_convert($s, "fa", "en");
    $s = num_convert($s, "ckb", "en");
    $s = preg_replace("/\s+/u", "", $s);
    return $s;
}
function num_convert($_string, $_from, $_to)
{
    /* Convert a string of numbers from 
       (en,fa,ckb) > (en,fa,ckb) */
    global $_assoc;
    return str_replace($_assoc[$_from],
		       $_assoc[$_to],
		       $_string);
}
function list_files ($path)
{
    global $N, $sql;
    $n = 0;
    $files = [];
    $d = opendir($path);
    while(FALSE !== ($f = readdir($d)))
    {
	if(in_array($f, [".","..","list"]))
	    continue;
	if(is_dir("$path/$f"))
	    list_files("$path/$f");	    
	else
	{
	    $query = "SELECT `عنوان‏` FROM `" . SQL_TABLE_DEF . "` WHERE `ردیف`=$f";
	    $result = mysqli_query($sql, $query);
	    if(!$result) die($query);
	    $title = str_replace(["عنوان‏:" , "Title‎:"], "",
				 mysqli_fetch_assoc($result)["عنوان‏"]);
	    $files[] = "$f\t$title";
	}
	$n++;
    }
    if($n > $N[0]) $N = [$n, $path];
    closedir($d);
    sort($files);
    $files = implode("\n", $files);
    file_put_contents("$path/list", $files);
    echo "`$path` listed.\n";
}
?>
