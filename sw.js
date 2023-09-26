const staticCacheName = "version-1"
const urlsToCache = [
    "/reactProject_BR#/",
    //'/react-basic/static/media/logo.6ce24c58023cc2f8fd88fe9d219db6c6.svg',
    '/reactProject_BR/static/js/bundle.js',
    //'/react-basic/icons/logo-192x192.png',
    '/reactProject_BR/manifest.json'
]

const dynamicCache = "dynamicCache";


const limitCacheSize = (name, size)=>{
    
    caches.open(name).then(cache=>{
        cache.keys().then(keys=>{
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name,size))
            }
        })
    })
}

this.addEventListener('install', (event)=>{
    console.log('install');
    
    event.waitUntil(
        caches.open(staticCacheName).then((cache)=>{
            console.log('Opend Cache')
            return cache.addAll(urlsToCache);
        })
        )
    })
    
    this.addEventListener('fetch', event => {
        console.log('fetch');
        
        event.respondWith(
            caches.match(event.request).then(cacheRes=>{
                return cacheRes || fetch(event.request).then(fetchRes=>{
                    return caches.open(dynamicCache).then(cache => {
                        cache.put(event.request.url, fetchRes.clone());
                        limitCacheSize(dynamicCache,10); //캐시가 10개가 등록되고 더 등록되면 삭제됨
                        return fetchRes;
                    })
                })
            }).catch(()=>{
                if(event.request.url.indexOf('.html') > -1){
                    return caches.match('/fallback.html')    
                }            
            })
            )
        })
        
        this.addEventListener('activate', event=>{
            console.log('activate');
            
            event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key=> key !== staticCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
})