/* Variables */
/* Tree */
const treePath = "tree";

/* Sanitizing */
const arSigns =["ِ", "ُ", "ٓ", "ٰ", "ْ", "ٌ", "ٍ", "ً", "ّ", "َ"];
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
const Ps = {
    "title":{
	"fa":"کتاب‌خانه",
    },
    "header":{
	"fa":"کتابــــــ‌خانه",
    },
    "desc":{
	"fa":"کتاب‌خانه دانشگاه آزاد سردشت",
    },
    "search in books":{
	"fa":"جست‌وجو در کتاب‌ها...",
    },
    "search":{
	"fa":"جست‌وجو",
    },
    "< back":{
	"fa":"بازگشت ›",
    },
    "plan":{
	"fa":"برنامه کاری کتاب‌خانه",
    },
    "not found":{
	"fa":"نتیجه‌ای یافت نشد.",
    },
};

/* Globals */
const html = document.querySelector("html");
const head = document.head;
const body = document.body;
const defTargetId = "#result";
const defTarget = body.querySelector(defTargetId);

/* Storage */
const versionStorage = "version";
const versionPath = "VERSION";

/* Theme */
const themeStorage = "theme";
const availableThemes = {
    "light": {"name":"light","colors":["#FFF","#000","#900","#ddd"],
	      "icon":"brightness_5"},
    "dark": {"name":"dark","colors":["#444","#FFF","#6FF","#666"],
	     "icon":"brightness_2"},
};
let currentTheme;

/* Functions */
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
    body.querySelector("header h1").innerText = P("header");
    body.querySelector("header h2").innerText = P("desc");
    body.querySelector("#qTxt").setAttribute("placeholder", P("search in books"));
    body.querySelector("#close").innerText = P("< back");
    body.querySelector("#planBtn").innerText = P("plan");
}
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
function find (q, t, n=-1, firstChar=null)
{
    const target = body.querySelector(t);
    q = sanitizeStr(q);
    if(! q)
    {
	target.innerHTML = "";
	return;
    }
    if(!firstChar) firstChar = q[0];
    const path = `${treePath}/${firstChar}/list`;
    /* Loading... */
    loadItem(path, function (list) {
	let result = list ? _filter(q, firstChar, list, target, n) : null;
	if(result)
	{
	    target.innerHTML = result;
	    applyTheme(currentTheme);
	}
	else
	{
	    target.innerHTML = "";
	    const firstChars = downloadedListsFirstChars();
	    n = Math.ceil(n / firstChars.length) + 1;
	    for(const c of firstChars)
	    {
		loadItem(`${treePath}/${c}/list`, function (list) {
		    result = _filter(q, c, list, target, n);
		    target.innerHTML += result;
		    applyTheme(currentTheme);
		});
	    }
	}
    });
}
function _filter (q, firstChar, list, target, n)
{
    /* TODO: Last chance: search in all local files */
    let result = "";
    list = list.split("\n");
    for (let item of list)
    {
	if(n == 0) break;
	item = item.split("\t");
	if(item.length < 3)
	    continue;
	const title = item[1];
	const sanTitle = item[2];
	if(sanTitle.indexOf(q) !== -1)
	{
	    const id = item[0];
	    const href = `${treePath}/${firstChar}/${id}`;
	    result +=
		`<button type='button' onclick='O("${href}")'>
<i class='icon'>book</i> ${title}</button>`;
	    n--;
	}
    }
    return result;
}
function O (path)
{
    const D = body.querySelector("#D");
    const DRes = D.querySelector("#res");
    D.style.display = "block";
    /* TODO: Loading... */
    loadItem(path, function (item) {
	DRes.innerHTML = `${item.replace(/\n/g, "<br>")}`;
    });
}
function loadItem (path, callback)
{
    const item = localStorage.getItem(path);
    if(item === null)
	downloadItem(path, callback);
    else
    {
	callback(item);
	updateItem(path);
    }
}
function downloadItem (path, callback)
{
    getUrl(path, function (resp) {
	let item = resp.status === 404 ? "" : resp.responseText;
	if(item && path.endsWith("/list")) item = sanList(item);
	localStorage.setItem(path, item);
	getUrl(versionPath, function (x) {
	    localStorage.setItem(`${path}_ver`, x.responseText);
	    callback(item);
	});
    });
}
function updateItem (path)
{
    const clientVersion = localStorage.getItem(versionStorage);
    const itemVersion = localStorage.getItem(`${path}_ver`);
    if(clientVersion > itemVersion)
	downloadItem(path, (x) => null);
}
function sanitizeStr (s)
{
    for(const extra of extras)
	s = s.replace(new RegExp(extra, "g"), "");
    for(const arSign of arSigns)
	s = s.replace(new RegExp(arSign, "g"), "");
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
function plan ()
{
    const D = body.querySelector("#D");
    const DRes = D.querySelector("#res");
    D.style.display = "block";
    /* TODO: Loading... */
    getUrl("plan", function (resp) {
	const item = resp.responseText;
	let html = "<table>";
	const lines = item.split("\n");
	for(const line of lines)
	{
	    if(! line.trim()) continue;
	    const cell = line.split("  ");
	    html += `<tr><td>${cell[0]}</td><td>${cell[1]}</td></tr>`;
	}
	html += "</table>";
	DRes.innerHTML = html;
    });
}
function setTheme (theme)
{
    localStorage.setItem(themeStorage, theme);
}
function getTheme ()
{
    let theme = localStorage.getItem(themeStorage);
    if(! (theme in availableThemes))
	theme = timeTheme();
    return availableThemes[theme];
}
function timeTheme ()
{
    const D = new Date;
    const H = D.getHours();
    if(H > 6 && H < 18)
	return "light";
    return "dark";
}
function applyTheme (theme)
{
    setThemeIcon();

    const back = theme.colors[0];
    const fore = theme.colors[1];
    const key = theme.colors[2];
    const foreLight = theme.colors[3];
    
    const close = body.querySelector("#close");
    const qTxt = body.querySelector("#qTxt");
    
    body.style.background = back;
    body.style.color = fore;
    body.querySelector("header h1").style.color = key;
    body.querySelector("#D").style.background = back;
    qTxt.style.borderBottomColor = foreLight;
    qTxt.addEventListener("focus", function () {
	qTxt.style.borderBottomColor = fore;
    });
    qTxt.addEventListener("blur", function () {
	qTxt.style.borderBottomColor = foreLight;
    });
    close.style.background = foreLight;
    close.style.color = fore;
    close.addEventListener("mouseenter", function () {
	close.style.background = fore;
	close.style.color = back;
    });
    close.addEventListener("mouseleave", function () {
	close.style.background = foreLight;
	close.style.color = fore;
    });
    body.querySelectorAll("button").forEach(function (o) {
	o.style.color = fore;
	o.addEventListener("mouseenter", function () {
	    o.style.color = key;
	});
	o.addEventListener("mouseleave", function () {
	    o.style.color = fore;
	});
    });
}
function setThemeIcon ()
{
    const themeBtn = body.querySelector("#themeBtn");
    if(! localStorage.getItem(themeStorage))
    {
	themeBtn.innerText = availableThemes.light.icon +
	    availableThemes.dark.icon;
    }
    else if(currentTheme.name == "light")
	themeBtn.innerText = availableThemes.light.icon;
    else
	themeBtn.innerText = availableThemes.dark.icon;
}
function downloadedListsFirstChars ()
{
    let lists = [];
    for(let i=0; i<localStorage.length; i++)
    {
	const o = localStorage.key(i);
	if(o.endsWith("/list"))
	    lists.push(o.substr(-6,1));
    }
    return lists;
}
function sanList (list)
{
    list = list.split("\n");
    for(const i in list)
    {
	let line = list[i];
	line = line.split("\t");
	line[2] = sanitizeStr(line[1]);
	line = line.join("\t");
	list[i] = line;
    }
    list = list.join("\n");
    return list;
}

/* Event Listeners */
const qFrm = body.querySelector("#qFrm");
const qTxt = body.querySelector("#qTxt");
const closeBtn = body.querySelector("#close");
const planBtn = body.querySelector("#planBtn");
const themeBtn = body.querySelector("#themeBtn");
window.addEventListener("load", function () {
    currentLang = getLang();
    currentLangCc = currentLang.cc;
    applyLang(currentLang);
    currentTheme = getTheme();
    applyTheme(currentTheme);
    getUrl(versionPath, function (x) {
	localStorage.setItem(versionStorage, x.responseText);
    });
});
closeBtn.addEventListener("click", function () {
    const parent = closeBtn.parentNode;
    parent.querySelector("#res").innerHTML = "";
    parent.style.display = "none";
});
planBtn.addEventListener("click", plan);
qFrm.addEventListener("submit", function (e) {
    e.preventDefault();
    find(qTxt.value, "#result", 10);
});
qTxt.addEventListener("keyup", function () {
    find(qTxt.value, "#result", 10);
});
themeBtn.addEventListener("click", function () {
    const icon = themeBtn.innerText;
    if(icon == "brightness_5brightness_2")
    {
	currentTheme = availableThemes.dark;
	themeBtn.innerText = currentTheme.icon;
	setTheme(currentTheme.name);
    }
    else if(icon == "brightness_2")
    {
	currentTheme = availableThemes.light;
	themeBtn.innerText = currentTheme.icon;
	setTheme(currentTheme.name);
    }
    else
    {
	localStorage.removeItem(themeStorage);
	currentTheme = getTheme();
	themeBtn.innerText = availableThemes.light.icon +
	    availableThemes.dark.icon;
    }
    applyTheme(currentTheme);
});
