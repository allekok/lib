const booksPath="data/books/tree",planPath="data/plan/plan.json",mapPath="data/map/map.json",versionPath="VERSION",versionBooksPath="data/books/VERSION",versionPlanPath="data/plan/VERSION",versionMapPath="data/map/VERSION",arSigns=["ِ","ُ","ٓ","ٰ","ْ","ٌ","ٍ","ً","ّ","َ"],extras=["\\?","!","#","&","\\*","\\(","\\)","-","\\+","=","_","\\[","\\]","{","}","<",">","/","|","'",'"',";",":",",","\\.","~","`","؟","،","»","«","ـ","؛","›","‹","•","‌","‎","‏"],_assoc={en:["0","1","2","3","4","5","6","7","8","9"],fa:["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"],ckb:["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"]},from=["ك","ي","ى","ھ"],to=["ک","ی","ی","ه"];let currentLang,currentLangCc;const langStorage="lang",defaultLang="fa",availableLangs={fa:{cc:"fa",dir:"rtl",lang:"fa-IR",align:"right",anti:"left"}},Ps={title:{fa:"کتاب‌خانه دانشگاه آزاد اسلامی سردشت"},header:{fa:"کتابــــــ‌خانه"},desc:{fa:"کتاب‌خانه دانشگاه آزاد اسلامی سردشت"},"search in books":{fa:"جست‌وجو در کتاب‌ها..."},search:{fa:"جست‌وجو"},"< back":{fa:"بازگشت ›"},plan:{fa:"برنامه کاری کتاب‌خانه"},"not found":{fa:"نتیجه‌ای یافت نشد."},set:{fa:"مجموعه قفسه"},col:{fa:"ستون"},row:{fa:"قفسه"},"from right":{fa:"از راست"},"from top":{fa:"از بالا"}},html=document.querySelector("html"),head=document.head,body=document.body,defTargetId="#result",defTarget=body.querySelector("#result"),qFrm=body.querySelector("#qFrm"),qTxt=body.querySelector("#qTxt"),closeBtn=body.querySelector("#close"),planBtn=body.querySelector("#planBtn"),themeBtn=body.querySelector("#themeBtn"),codeBtn=body.querySelector("#codeBtn"),lockStorage="lock",lockTimeout=6e4;let currentTheme;const themeStorage="theme",availableThemes={light:{name:"light",icon:"brightness_5",colors:["#FFF","#000","#900","#eee","rgba(255, 255, 255, .94)"]},dark:{name:"dark",icon:"brightness_2",colors:["#222","#FFF","#6FF","#444","rgba(35, 35, 35, .97)"]}},mainRepo="https://github.com/allekok/lib";function getLang(){let e=localStorage.getItem(langStorage);return e in availableLangs||(e=defaultLang),availableLangs[e]}function setLang(e){localStorage.setItem(langStorage,e)}function applyLang(e){html.setAttribute("lang",e.lang),html.setAttribute("dir",e.dir),head.querySelector("title").innerText=P("title"),body.querySelector("header h1").innerText=P("header"),body.querySelector("header h2").innerText=P("desc"),body.querySelector("#qTxt").setAttribute("placeholder",P("search in books")),body.querySelector("#close").innerText=P("< back"),body.querySelector("#planBtn").innerText=P("plan")}function P(e){try{return Ps[e][currentLangCc]}catch(e){return""}}function find(e,t,n=-1,o=null){const r=body.querySelector(t);(e=sanitizeStr(e))?(o||(o=e[0]),loadItem(`${booksPath}/${o}/list`,t=>{let a=t?_filter(e,o,t,r,n):null;if(a)r.innerHTML=a,applyTheme(currentTheme);else{r.innerHTML="";const t=downloadedListsFirstChars();n=Math.ceil(n/t.length)+1;for(const o of t)loadItem(`${booksPath}/${o}/list`,t=>{a=_filter(e,o,t,r,n),r.innerHTML+=a,applyTheme(currentTheme)})}})):r.innerHTML=""}function _filter(e,t,n,o,r){let a="";n=n.split("\n");for(let o of n){if(0==r)break;if((o=o.split("\t")).length<3)continue;const n=o[1];if(-1!==o[2].indexOf(e)){const e=o[0];a+="<button type='button' "+`onclick='O("${`${booksPath}/${t}/${e}`}")'>`+`<i class='icon'>book</i> ${n}`+"</button>",r--}}return a}function O(e){const t=body.querySelector("#D"),n=t.querySelector("#res");t.style.display="block",loadItem(e,e=>{e=(e=e.replace(/\n/g,"<br>")).replace(/\[map_([^\]]+)\]/,'<button type="button" class="icon mapBtn" onclick=\'map("$1")\'>search</button><div id="mapRes"></div>'),n.innerHTML=e,applyTheme(currentTheme)})}function loadItem(e,t,n=(e=>null),o=versionBooksPath){const r=localStorage.getItem(e);null===r?downloadItem(e,t,o):(t(r),updateItem(e,n,o))}function downloadItem(e,t,n=versionBooksPath){lockedGetUrl(e,o=>{if(null===o)return void t(null);let r=404===o.status?"":o.responseText;r&&e.endsWith("/list")&&(r=sanList(r)),localStorage.setItem(e,r),t(r),404!==o.status&&lockedGetUrl(n,o=>{if(null===o)return void t(null);const r=parseInt(o.responseText);localStorage.setItem(`${e}_ver`,r),r>parseInt(localStorage.getItem(n))&&localStorage.setItem(n,r)},`${e}_ver`)})}function lockedGetUrl(e,t,n=null){n||(n=e),isLOCK(n)?t(null):(LOCK(n),getUrl(e,e=>{unLOCK(n),t(e)}))}function updateItem(e,t=(e=>null),n=versionBooksPath){parseInt(localStorage.getItem(n))>parseInt(localStorage.getItem(`${e}_ver`))&&downloadItem(e,t,n)}function sanitizeStr(e){for(const t of extras)e=e.replace(new RegExp(t,"g"),"");for(const t of arSigns)e=e.replace(new RegExp(t,"g"),"");for(const t in from)e=e.replace(new RegExp(from[t],"g"),to[t]);return e=numConvert(e=e.toLowerCase(),"fa","en"),e=(e=numConvert(e,"ckb","en")).replace(/\s+/g,"")}function numConvert(e,t,n){for(const o in _assoc.en)e=e.replace(new RegExp(_assoc[t][o],"g"),_assoc[n][o]);return e}function chars(e){return e.split()}function makePath(e){return chars(e).join("/")}function getUrl(e,t){const n=new XMLHttpRequest;n.open("get",NEW(e)),n.onload=(()=>t(n)),n.send()}function plan(){const e=body.querySelector("#D"),t=e.querySelector("#res");function n(e){const n=isJSON(e);if(!n)return null;let o="",r="";try{o="<p>"+n.text.join("<br>")+"</p>"}catch(e){}try{for(const e of n.table){r+="<table>";for(const t of e)r+=`<tr><td>${t[0]}</td>`+`<td>${t[1]}</td></tr>`;r+="</table>"}}catch(e){}t.innerHTML=r+o}e.style.display="block",loadItem(planPath,n,n,versionPlanPath)}function setTheme(e){localStorage.setItem(themeStorage,e)}function getTheme(){let e=localStorage.getItem(themeStorage);return e in availableThemes||(e=timeTheme()),availableThemes[e]}function timeTheme(){const e=(new Date).getHours();return e>6&&e<18?"light":"dark"}function applyTheme(e){setThemeIcon();const t=e.colors[0],n=e.colors[1],o=e.colors[2],r=e.colors[3],a=e.colors[4],l=body.querySelector("#close"),s=body.querySelector("#qTxt"),c=body.querySelector("#D"),i=body.querySelector("#D #mapRes");body.style.background=t,body.style.color=n,body.querySelector("header h1").style.color=o,c.style.background=a;try{i.style.background=r}catch(e){}s.style.borderBottomColor=r,s.addEventListener("focus",()=>s.style.borderBottomColor=n),s.addEventListener("blur",()=>s.style.borderBottomColor=r),l.style.background=r,l.style.color=n,l.addEventListener("mouseenter",()=>{l.style.background=n,l.style.color=t}),l.addEventListener("mouseleave",()=>{l.style.background=r,l.style.color=n}),body.querySelectorAll("button").forEach(e=>{e.style.color=n,e.addEventListener("mouseenter",()=>e.style.color=o),e.addEventListener("mouseleave",()=>e.style.color=n)}),c.querySelectorAll(".mapBtn").forEach(e=>e.style.color=o)}function setThemeIcon(){const e=body.querySelector("#themeBtn");localStorage.getItem(themeStorage)?"light"==currentTheme.name?e.innerText=availableThemes.light.icon:e.innerText=availableThemes.dark.icon:e.innerText=availableThemes.light.icon+availableThemes.dark.icon}function downloadedListsFirstChars(){const e=[];for(let t=0;t<localStorage.length;t++){const n=localStorage.key(t);n.endsWith("/list")&&e.push(n.substr(-6,1))}return e}function sanList(e){e=e.split("\n");for(const t in e){let n=e[t];(n=n.split("\t"))[2]=sanitizeStr(n[1]),n=n.join("\t"),e[t]=n}return e=e.join("\n")}function NEW(e){return`${e}?${Date.now()}`}function isJSON(e){try{const t=JSON.parse(e);return t||{nil:null}}catch(e){return{nil:null}}}function getLOCKS(){return isJSON(sessionStorage.getItem(lockStorage))}function setLOCKS(e){sessionStorage.setItem(lockStorage,JSON.stringify(e))}function isLOCK(e){const t=getLOCKS();return void 0!==t[e]&&Date.now()-t[e]<=lockTimeout}function LOCK(e){const t=getLOCKS();t[e]=Date.now(),setLOCKS(t)}function unLOCK(e){const t=getLOCKS();delete t[e],setLOCKS(t)}function map(e){const t=body.querySelector("#D #mapRes");function n(n){if(!(n=isJSON(n)))return null;const o=n[e];if(void 0===o)return null;let r="";for(const e in o){r+=`-&rsaquo; ${P("set")}: `+`${numConvert(e,"en","fa")}<br>`;for(const t in o[e])r+='<i style="padding-right:2em">'+`-&rsaquo; ${P("col")}: `+numConvert(t,"en","fa")+"</i><br>",r+='<i class="icon" style="padding-right:4em">arrow_downward</i> <i>'+`${P("row")}: `+numConvert(o[e][t].join(", "),"en","fa")+"</i><br>"}t.innerHTML=r,t.style.display="block"}loadItem(mapPath,n,n,versionMapPath)}window.addEventListener("load",()=>{currentLang=getLang(),currentLangCc=currentLang.cc,applyLang(currentLang),applyTheme(currentTheme=getTheme()),getUrl("VERSION",e=>{const t=e.responseText.split("\n");localStorage.setItem(versionBooksPath,t[0]),localStorage.setItem(versionPlanPath,t[1]),localStorage.setItem(versionMapPath,t[2])})}),closeBtn.addEventListener("click",()=>{const e=closeBtn.parentNode;e.querySelector("#res").innerHTML="",e.style.display="none"}),planBtn.addEventListener("click",plan),qFrm.addEventListener("submit",e=>{e.preventDefault(),find(qTxt.value,"#result",10)}),qTxt.addEventListener("keyup",()=>find(qTxt.value,"#result",10)),themeBtn.addEventListener("click",()=>{const e=themeBtn.innerText;"brightness_5brightness_2"==e?(currentTheme=availableThemes.dark,themeBtn.innerText=currentTheme.icon,setTheme(currentTheme.name)):"brightness_2"==e?(currentTheme=availableThemes.light,themeBtn.innerText=currentTheme.icon,setTheme(currentTheme.name)):(localStorage.removeItem(themeStorage),currentTheme=getTheme(),themeBtn.innerText=availableThemes.light.icon+availableThemes.dark.icon),applyTheme(currentTheme)}),codeBtn.addEventListener("click",()=>window.location=mainRepo);