/* Global Variables and Constants */

/* Paths */
const booksPath = 'data/books/tree'
const planPath = 'data/plan/plan.json'
const mapPath = 'data/map/map.json'
const versionPath = 'VERSION'
const versionBooksPath = 'data/books/VERSION'
const versionPlanPath = 'data/plan/VERSION'
const versionMapPath = 'data/map/VERSION'

/* Text Normalization */
const arSigns =['ِ', 'ُ', 'ٓ', 'ٰ', 'ْ', 'ٌ', 'ٍ', 'ً', 'ّ', 'َ']
const extras = ['\\?', '!', '#', '&', '\\*', '\\(', '\\)', '-', '\\+',
		'=', '_', '\\[', '\\]', '{', '}', '<', '>', '/',
		'|', '\'', '"', ';', ':', ',', '\\.', '~', '`',
		'؟', '،', '»', '«', 'ـ', '؛', '›', '‹', '•', '‌',
		'\u{200E}', '\u{200F}']
const _assoc = {
	en: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
	fa: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
	ckb: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
}
const from = ['ك',
	      'ي',
	      'ى',
	      'ھ']
const to = ['ک',
	    'ی',
	    'ی',
	    'ه']

/* Language */
let currentLang
let currentLangCc
const langStorage = 'lang'
const defaultLang = 'fa'
const availableLangs = {
	fa: {
		cc: 'fa',
		dir: 'rtl',
		lang: 'fa-IR',
		align: 'right',
		anti: 'left'
	}
}
const Ps = {
	'title': {
		fa: 'کتاب‌خانه دانشگاه آزاد اسلامی سردشت'
	},
	'header': {
		fa: 'کتابــــــ‌خانه'
	},
	'desc': {
		fa: 'کتاب‌خانه دانشگاه آزاد اسلامی سردشت'
	},
	'search in books': {
		fa: 'جست‌وجو در کتاب‌ها...'
	},
	'search': {
		fa: 'جست‌وجو'
	},
	'< back': {
		fa: 'بازگشت ›'
	},
	'plan': {
		fa: 'برنامه کاری کتاب‌خانه'
	},
	'not found': {
		fa: 'نتیجه‌ای یافت نشد.'
	},
	'set': {
		fa: 'مجموعه قفسه'
	},
	'col': {
		fa: 'ستون'
	},
	'row': {
		fa: 'قفسه'
	},
	'from right': {
		fa: 'از راست'
	},
	'from top': {
		fa: 'از بالا'
	}
}

/* HTML Elements */
const html = document.querySelector('html')
const head = document.head
const body = document.body
const defTargetId = '#result'
const defTarget = body.querySelector(defTargetId)
const qFrm = body.querySelector('#qFrm')
const qTxt = body.querySelector('#qTxt')
const closeBtn = body.querySelector('#close')
const planBtn = body.querySelector('#planBtn')
const themeBtn = body.querySelector('#themeBtn')
const codeBtn = body.querySelector('#codeBtn')

/* Lock */
const lockStorage = 'lock'
const lockTimeout = 1 * 60 * 1000  /* 1 min. */

/* Theme */
let currentTheme
const themeStorage = 'theme'
const availableThemes = {
	light: {
		name: 'light',
		icon: 'brightness_5',
		colors: ['#FFF',
			 '#000',
			 '#900',
			 '#eee',
			 'rgba(255, 255, 255, .94)']
	},
	dark: {
		name: 'dark',
		icon: 'brightness_2',
		colors: ['#222',
			 '#FFF',
			 '#6FF',
			 '#444',
			 'rgba(35, 35, 35, .97)']
	}
}

/* Other Constants */
const mainRepo = 'https://github.com/allekok/lib'

/* Functions */
function getLang() {
	let lang = localStorage.getItem(langStorage)
	if(!(lang in availableLangs))
		lang = defaultLang
	return availableLangs[lang]
}
function setLang(lang) {
	localStorage.setItem(langStorage, lang)
}
function applyLang(lang) {
	html.setAttribute('lang', lang.lang)
	html.setAttribute('dir', lang.dir)
	head.querySelector('title').innerText = P('title')
	body.querySelector('header h1').innerText = P('header')
	body.querySelector('header h2').innerText = P('desc')
	body.querySelector('#qTxt').setAttribute('placeholder',
						 P('search in books'))
	body.querySelector('#close').innerText = P('< back')
	body.querySelector('#planBtn').innerText = P('plan')
}
function P(key) {
	try {
		return Ps[key][currentLangCc]
	}
	catch(e) {
		return ''
	}
}
function find(q, t, n=-1, firstChar=null) {
	const target = body.querySelector(t)
	q = sanitizeStr(q)
	if(!q) {
		target.innerHTML = ''
		return
	}
	if(!firstChar)
		firstChar = q[0]
	const path = `${booksPath}/${firstChar}/list`
	/* Loading... */
	loadItem(path, list => {
		let result = (list ?
			      _filter(q, firstChar, list, target, n) :
			      null)
		if(result) {
			target.innerHTML = result
			applyTheme(currentTheme)
		}
		else {
			target.innerHTML = ''
			const firstChars = downloadedListsFirstChars()
			n = Math.ceil(n / firstChars.length) + 1
			for(const c of firstChars) {
				loadItem(`${booksPath}/${c}/list`, list => {
					result = _filter(q, c, list, target, n)
					target.innerHTML += result
					applyTheme(currentTheme)
				})
			}
		}
	})
}
function _filter(q, firstChar, list, target, n) {
	let result = ''
	list = list.split('\n')
	for(let item of list) {
		if(n == 0)
			break
		item = item.split('\t')
		if(item.length < 3)
			continue
		const title = item[1]
		const sanTitle = item[2]
		if(sanTitle.indexOf(q) !== -1) {
			const id = item[0]
			const href = `${booksPath}/${firstChar}/${id}`
			result += (`<button type='button' ` +
				   `onclick='O("${href}")'>` +
				   `<i class='icon'>book</i> ${title}` +
				   `</button>`)
			n--
		}
	}
	return result
}
function O(path) {
	const D = body.querySelector('#D')
	const DRes = D.querySelector('#res')
	D.style.display = 'block'
	loadItem(path, item => {
		item = item.replace(/\n/g, '<br>')
		item = item.replace(/\[map_([^\]]+)\]/,
				    ('<button type="button" ' +
				     'class="icon mapBtn" ' +
				     'onclick=\'map("$1")\'>search</button>' +
				     '<div id="mapRes"></div>'))
		DRes.innerHTML = item
		applyTheme(currentTheme)
	})
}
function loadItem(path,
		  callback,
		  updCallback=x => null,
		  verPath=versionBooksPath)
{
	const item = localStorage.getItem(path)
	if(item === null)
		downloadItem(path, callback, verPath)
	else {
		callback(item)
		updateItem(path, updCallback, verPath)
	}
}
function downloadItem(path, callback, verPath=versionBooksPath) {
	lockedGetUrl(path, resp => {
		if(resp === null) {
			callback(null)
			return
		}
		let item = resp.status === 404 ? '' : resp.responseText
		if(item && path.endsWith('/list'))
			item = sanList(item)
		localStorage.setItem(path, item)
		callback(item)
		if(resp.status === 404)
			return
		lockedGetUrl(verPath, x => {
			if(x === null) {
				callback(null)
				return
			}
			const _v = parseInt(x.responseText)
			localStorage.setItem(`${path}_ver`, _v)
			/* (?) Maybe this "If" is unnecessary */
			if(_v > parseInt(localStorage.getItem(verPath)))
				localStorage.setItem(verPath, _v)
		}, `${path}_ver`)
	})
}
function lockedGetUrl(path, callback, lockPath=null) {
	if(!lockPath)
		lockPath = path
	if(isLOCK(lockPath)) {
		callback(null)
		return
	}
	LOCK(lockPath)
	getUrl(path, x => {
		unLOCK(lockPath)
		callback(x)
	})
}
function updateItem(path, callback=x => null, verPath=versionBooksPath) {
	const clientVersion = parseInt(localStorage.getItem(verPath))
	const itemVersion = parseInt(localStorage.getItem(`${path}_ver`))
	if(clientVersion > itemVersion)
		downloadItem(path, callback, verPath)
}
function sanitizeStr(s) {
	for(const extra of extras)
		s = s.replace(new RegExp(extra, 'g'), '')
	for(const arSign of arSigns)
		s = s.replace(new RegExp(arSign, 'g'), '')
	for(const i in from)
		s = s.replace(new RegExp(from[i], 'g'), to[i])
	s = s.toLowerCase()
	s = numConvert(s, 'fa', 'en')
	s = numConvert(s, 'ckb', 'en')
	s = s.replace(/\s+/g, '')
	return s
}
function numConvert(s, f, t) {
	for(const i in _assoc['en'])
		s = s.replace(new RegExp(_assoc[f][i], 'g'), _assoc[t][i])
	return s
}
function chars(str) {
	return str.split()
}
function makePath(str) {
	return chars(str).join('/')
}
function getUrl(url, callback) {
	const x = new XMLHttpRequest()
	x.open('get', NEW(url))
	x.onload = () => callback(x)
	x.send()
}
function plan() {
	const D = body.querySelector('#D')
	const DRes = D.querySelector('#res')
	function paintPlan(resp) {
		const objs = isJSON(resp)
		if(!objs)
			return null
		let text = ''
		let table = ''
		try {
			text = '<p>' + objs.text.join('<br>') + '</p>'
		}
		catch(e) {}
		try {
			for(const t of objs.table) {
				table += '<table>'
				for(const row of t)
					table += (`<tr><td>${row[0]}</td>` +
						  `<td>${row[1]}</td></tr>`)
				table += '</table>'
			}
		}
		catch(e) {}
		DRes.innerHTML = table + text
	}
	D.style.display = 'block'
	loadItem(planPath, paintPlan, paintPlan, versionPlanPath)
}
function setTheme(theme) {
	localStorage.setItem(themeStorage, theme)
}
function getTheme() {
	let theme = localStorage.getItem(themeStorage)
	if(!(theme in availableThemes))
		theme = timeTheme()
	return availableThemes[theme]
}
function timeTheme() {
	const D = new Date
	const H = D.getHours()
	if(H > 6 && H < 18)
		return 'light'
	return 'dark'
}
function applyTheme(theme) {
	setThemeIcon()

	const back = theme.colors[0]
	const fore = theme.colors[1]
	const key = theme.colors[2]
	const foreLight = theme.colors[3]
	const DBack = theme.colors[4]

	const close = body.querySelector('#close')
	const qTxt = body.querySelector('#qTxt')
	const D = body.querySelector('#D')
	const mapRes = body.querySelector('#D #mapRes')

	body.style.background = back
	body.style.color = fore
	body.querySelector('header h1').style.color = key
	D.style.background = DBack
	try {
		mapRes.style.background = foreLight
	}
	catch(e) {}
	qTxt.style.borderBottomColor = foreLight
	qTxt.addEventListener('focus',
			      () => qTxt.style.borderBottomColor = fore)
	qTxt.addEventListener('blur',
			      () => qTxt.style.borderBottomColor = foreLight)
	close.style.background = foreLight
	close.style.color = fore
	close.addEventListener('mouseenter', () => {
		close.style.background = fore
		close.style.color = back
	})
	close.addEventListener('mouseleave', () => {
		close.style.background = foreLight
		close.style.color = fore
	})
	body.querySelectorAll('button').forEach(o => {
		o.style.color = fore
		o.addEventListener('mouseenter', () => o.style.color = key)
		o.addEventListener('mouseleave', () => o.style.color = fore)
	})
	D.querySelectorAll('.mapBtn').forEach(o => o.style.color = key)
}
function setThemeIcon() {
	const themeBtn = body.querySelector('#themeBtn')
	if(!localStorage.getItem(themeStorage)) {
		themeBtn.innerText = (availableThemes.light.icon +
				      availableThemes.dark.icon)
	}
	else if(currentTheme.name == 'light')
		themeBtn.innerText = availableThemes.light.icon
	else
		themeBtn.innerText = availableThemes.dark.icon
}
function downloadedListsFirstChars() {
	const lists = []
	for(let i = 0; i < localStorage.length; i++) {
		const o = localStorage.key(i)
		if(o.endsWith("/list"))
			lists.push(o.substr(-6, 1))
	}
	return lists
}
function sanList(list) {
	list = list.split('\n')
	for(const i in list) {
		let line = list[i]
		line = line.split('\t')
		line[2] = sanitizeStr(line[1])
		line = line.join('\t')
		list[i] = line
	}
	list = list.join('\n')
	return list
}
function NEW(url) {
	return `${url}?${Date.now()}`
}
function isJSON(x) {
	try {
		const JS = JSON.parse(x)
		if(JS)
			return JS
		return {nil: null}
	}
	catch(e) {
		return {nil: null}
	}
}
function getLOCKS() {
	return isJSON(sessionStorage.getItem(lockStorage))
}
function setLOCKS(locks) {
	sessionStorage.setItem(lockStorage, JSON.stringify(locks))
}
function isLOCK(path) {
	const locks = getLOCKS()
	return (typeof(locks[path]) != 'undefined') &&
		((Date.now() - locks[path]) <= lockTimeout)
}
function LOCK(path) {
	const locks = getLOCKS()
	locks[path] = Date.now()
	setLOCKS(locks)
}
function unLOCK(path) {
	const locks = getLOCKS()
	delete locks[path]
	setLOCKS(locks)
}
function map(label) {
	const mapRes = body.querySelector('#D #mapRes')
	function mapPaint(resp) {
		resp = isJSON(resp)
		if(!resp)
			return null
		const L = resp[label]
		if(typeof(L) == 'undefined')
			return null
		let locations = ''
		for(const set in L) {
			locations += (`-&rsaquo; ${P('set')}: ` +
				      `${numConvert(set, 'en', 'fa')}<br>`)
			for(const col in L[set]) {
				locations += (`<i style="padding-right:2em">` +
					      `-&rsaquo; ${P('col')}: ` +
					      numConvert(col, 'en', 'fa') +
					      `</i><br>`)
				locations += (`<i class="icon" style="` +
					      `padding-right:4em">` +
					      `arrow_downward</i> <i>` +
					      `${P("row")}: ` +
					      numConvert(L[set][col].
							 join(', '),
							 'en',
							 'fa') +
					      `</i><br>`)
			}
		}
		mapRes.innerHTML = locations
		mapRes.style.display = 'block'
	}
	loadItem(mapPath, mapPaint, mapPaint, versionMapPath)
}

/* Event Listeners */
window.addEventListener('load', () => {
	currentLang = getLang()
	currentLangCc = currentLang.cc
	applyLang(currentLang)
	currentTheme = getTheme()
	applyTheme(currentTheme)
	getUrl(versionPath, x => {
		const verObj = x.responseText.split('\n')
		localStorage.setItem(versionBooksPath, verObj[0])
		localStorage.setItem(versionPlanPath, verObj[1])
		localStorage.setItem(versionMapPath, verObj[2])
	})
})
closeBtn.addEventListener('click', () => {
	const parent = closeBtn.parentNode
	parent.querySelector('#res').innerHTML = ''
	parent.style.display = 'none'
})
planBtn.addEventListener('click', plan)
qFrm.addEventListener('submit', e => {
	e.preventDefault()
	find(qTxt.value, '#result', 10)
})
qTxt.addEventListener('keyup', () => find(qTxt.value, '#result', 10))
themeBtn.addEventListener('click', () => {
	const icon = themeBtn.innerText
	if(icon == 'brightness_5brightness_2') {
		currentTheme = availableThemes.dark
		themeBtn.innerText = currentTheme.icon
		setTheme(currentTheme.name)
	}
	else if(icon == 'brightness_2') {
		currentTheme = availableThemes.light
		themeBtn.innerText = currentTheme.icon
		setTheme(currentTheme.name)
	}
	else {
		localStorage.removeItem(themeStorage)
		currentTheme = getTheme()
		themeBtn.innerText = (availableThemes.light.icon +
				      availableThemes.dark.icon)
	}
	applyTheme(currentTheme)
})
codeBtn.addEventListener('click', () => window.location = mainRepo)
