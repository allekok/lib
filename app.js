/* Sanitizing */
const ar_signs =["ِ", "ُ", "ٓ", "ٰ", "ْ", "ٌ", "ٍ", "ً", "ّ", "َ"];
const extras = ["\\?", "!", "#", "&","\\*", "\\(", "\\)", "-","\\+",
		"=", "_","\\[", "\\]", "{","}","<",">","/",
		"|", "'","\"", ";", ":", ",","\\.", "~", "`",
		"؟", "،", "»", "«","ـ","؛","›","‹","•","‌",
		"\u{200E}","\u{200F}"];
const _assoc = {
    'en' : ['0','1','2','3','4','5','6','7','8','9'],	
    'fa' : ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'],
    'ckb' : ['٠', '١', '٢', '٣', '٤','٥', '٦', '٧', '٨', '٩'],
};
/* Language */
const langStorage = "lang";
const defaultLang = "fa";
const availableLangs = {
    "fa":{"cc":"fa", "dir":"rtl", "lang":"fa-IR",
	  "align":"right", "anti":"left"},
};
let currentLang;
let currentLangCc;

/* Globals */
const html = document.querySelector("html");
const head = document.head;
const body = document.body;

/* Storage */
const versionStorage = "version";

window.addEventListener("load", function () {
    currentLang = getLang();
    currentLangCc = currentLang.cc;
    applyLang(currentLang);
});
function getLang ()
{
    let lang = localStorage.getItem(langStorage);
    if(! (lang in availableLangs))
	lang = defaultLang;
    return availableLangs[lang];
}
function setLang (lang)
{
    localStorage.setItem(langStorage, lang);
}
function applyLang (lang)
{
    html.setAttribute("lang", lang.lang);
    html.setAttribute("dir", lang.dir);
    head.querySelector("title").innerText = P("title");
    body.querySelector("header h1").innerText = P("title");
    body.querySelector("#qTxt").setAttribute("placeholder", P("search..."));
    body.querySelector("#qBtn").innerText = P("search");
}

const Ps = {
    "title":{
	"fa":"کتاب‌خانه",
    },
    "desc":{
	"fa":"کتابخانه دانشگاه آزاد سردشت",
    },
    "search...":{
	"fa":"جست‌وجو...",
    },
    "search":{
	"fa":"جست‌وجو",
    },
};

function P(key)
{
    try
    {
	return Ps[key][currentLangCc];
    }
    catch (e)
    {
	return "";
    }
}

const qFrm = body.querySelector("#qFrm");
qFrm.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("hey");
});

function find (q, n=-1)
{
    q = sanitize_str(q);
    const firstChar = q[0];
    const path = `${firstChar}/list`;
    
    
}
function isJson (s)
{
    try
    {
	return JSON.parse(s);
    }
    catch (e)
    {
	return null
    }
}
function loadList (path, callback)
{
    let list = isJson(localStorage.getItem(path));
    if(list !== null)
    {
	callback(list);
	updateList(path);
    }
    else
    {
	getUrl(path, function (resp) {
	    list = resp.responseText;
	    localStorage.setItem(path, list);
	    callback(list);
	});
    }
}
function updateList (path)
{
    const clientVersion = localStorage.getItem(versionStorage);
    
}
function sanitize_str(s)
{
    for(const i in extras)
	s = s.replace(new RegExp(extras[i], "g"), "");
    for(const i in ar_signs)
	s = s.replace(new RegExp(ar_signs[i], "g"), "");
    s = s.replace(new RegExp("ي", "g"), "ی");
    s = s.replace(new RegExp("ك", "g"), "ک");
    s = s.toLowerCase();
    s = num_convert(s, "fa", "en");
    s = num_convert(s, "ckb", "en");
    s = s.replace(/\s+/g, "");
    return s;
}
function num_convert(s, f, t)
{
    for(const i in _assoc["en"])
	s = s.replace(new RegExp(_assoc[f][i], "g"), _assoc[t][i]);
    return s;
}
function chars (str)
{
    return str.split();
}
function makePath (str)
{
    return chars(str).join("/");
}
function getUrl (url, callback)
{
    const x = new XMLHttpRequest();
    x.open("get", url);
    x.onload = function ()
    {
	callback(this);
    }
    x.send();
}
