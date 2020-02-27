<?php
const main = "camel.css";
const main_comp = "camel-comp.css";
/* COMPRESS */
const _input = [main];
const _output = [main_comp];
foreach(_input as $i=>$input)
{
    $css = file_get_contents($input);
    // Remove Comments
    $css = preg_replace('/\/\*.*\*\//u', '', $css);
    // Remove New-lines
    $css = preg_replace('/[\n\r\t]+/u', '', $css);
    // ' {},:; ' -> '{}'
    $css = preg_replace('/\s*([{},:;])\s*/', '$1', $css);
    // Replace many spaces with one space
    $css = preg_replace('/\s+/', ' ', $css);
    // Replace ';}' -> '}'
    $css = str_replace(';}', '}', $css);
    file_put_contents(_output[$i], $css);
}
/* UPDATE VERSION */
const _files = ["../../index.html", "../../service-worker.js"];
foreach(_files as $file) {
    $content = file_get_contents($file);
    $content = preg_replace_callback(
	"/(client\/style\/camel-comp\.css\?v)([0-9]+)/",
	"increase_ver", $content
    );
    file_put_contents($file, $content);
}
function increase_ver ($I)
{
    return $I[1] . (intval($I[2])+1);
}
?>
