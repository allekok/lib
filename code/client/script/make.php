<?php
const js_file = "app.js";
const js_comp_file = "app-comp.js";
/* COMPRESS */
/* Using 'javascript-minifier.com's API. */
const api = "https://javascript-minifier.com/raw";
$content = file_get_contents(js_file);
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => api,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/x-www-form-urlencoded"],
    CURLOPT_POSTFIELDS => http_build_query(["input"=>$content]),
]);
$content = curl_exec($ch);
curl_close($ch);
file_put_contents(js_comp_file, $content);

/* UPDATE VERSION */
const files = ["../../../index.html", "../../../service-worker.js"];

foreach(files as $f)
{
    $content = file_get_contents($f);
    $content = preg_replace_callback(
	"/(client\/script\/app-comp\.js\?v)([0-9]+)/",
	"increase_ver", $content
    );
    file_put_contents($f, $content);
}

function increase_ver ($I)
{
    return $I[1] . (intval($I[2])+1);
}
?>
