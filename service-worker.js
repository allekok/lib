const cache_ver = 'v2'

self.addEventListener('install', event => {
	event.waitUntil(caches.open(cache_ver).then(function(cache) {
		return cache.addAll([
			'/lib/code/client/style/camel-comp.css?v10',
			'/lib/code/client/script/app-comp.js?v19',
			'/lib/code/client/style/DroidNaskh-Regular.woff2',
			'/lib/code/client/style/Material-Icons.woff2',
		])
	}))
})

self.addEventListener('activate', event => {
	const cacheWhitelist = [cache_ver]
	event.waitUntil(caches.keys().then(keyList => {
		return Promise.all(keyList.map(key => {
			if(cacheWhitelist.indexOf(key) === -1)
				return caches.delete(key)
		}))
	}))
})

self.addEventListener('fetch', event => {
	event.respondWith(caches.match(event.request).then(resp => {
		return resp || fetch(event.request).then(_ => _)
	}).catch(() => ''))
})
