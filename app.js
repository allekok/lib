/* Tree */
const treePath = "tree";

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
const storageTimeoutDays = 100;
const storageTimeout = storageTimeoutDays * 24 * 60 * 60 * 1000;

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
    const qTxt = body.querySelector("#qTxt");
    find(qTxt.value, "#result", 10);
});

function find (q, t, n=-1)
{
    const target = body.querySelector(t);
    q = sanitizeStr(q);
    const firstChar = q[0];
    const path = `${treePath}/${firstChar}/list`;
    /* Loading... */
    loadList(path, function (list) {
	if(list === null)
	{
	    target.innerText = "Letter's List Not Found!";
	    return;
	}
	const result = _filter(q, firstChar, list, target);
	target.innerHTML = result;
	/* Loading... */
    });
}
function _filter (q, firstChar, list, target)
{
    /* TODO: Last chance: search in all local files */
    let result = "";
    list = list.split("\n");
    for (const i in list)
    {
	const item = list[i].split("\t");
	if(item.length < 2)
	    continue;
	const title = item[1];
	const sanTitle = sanitizeStr(title);
	if(sanTitle.indexOf(q) !== -1)
	{
	    const id = item[0];
	    const href = `${treePath}/${firstChar}/${id}`;
	    result +=
		`<button type='button' onclick='loadItem("${href}")'>${title}</button>`;
	}
    }
    return result;
}
function loadItem (path, callback)
{
    
}
function loadList (path, callback)
{
    let list = localStorage.getItem(path);
    if(list === null)
	downloadList(path, callback);
    else
    {
	callback(list);
	updateList(path);
    }
}
function downloadList (path, callback)
{
    getUrl(path, function (resp) {
	if(resp.status === 404)
	{
	    callback(null);
	    return;
	}
	list = resp.responseText;
	localStorage.setItem(path, list);
	localStorage.setItem(`${path}_time`, Date.now());
	callback(list);
    });
}
function updateList (path)
{
    const clientVersion = localStorage.getItem(versionStorage);
    const listTimeoutStorage = `${path}_time`;
    const listTimeout = localStorage.getItem(listTimeoutStorage);
    if(clientVersion && listTimeout &&
       ((Date.now() - listTimeout) > storageTimeout))
    {
	downloadList(path, (x) => null);
    }
}
function sanitizeStr (s)
{
    for(const i in extras)
	s = s.replace(new RegExp(extras[i], "g"), "");
    for(const i in ar_signs)
	s = s.replace(new RegExp(ar_signs[i], "g"), "");
    s = s.replace(new RegExp("ي", "g"), "ی");
    s = s.replace(new RegExp("ك", "g"), "ک");
    s = s.toLowerCase();
    s = numConvert(s, "fa", "en");
    s = numConvert(s, "ckb", "en");
    s = s.replace(/\s+/g, "");
    return s;
}
function numConvert (s, f, t)
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
