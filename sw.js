//sw.js(서비스워커(sw) 작성한 거)

const staticCacheName = "version-1"
const urlsToCache = [
    "/reactProject_BR#/",
    //'/react-basic/static/media/logo.6ce24c58023cc2f8fd88fe9d219db6c6.svg',
    '/reactProject_BR/static/js/bundle.js',
    //'/react-basic/icons/logo-192x192.png',
    '/reactProject_BR/manifest.json'
]

const dynamicCache = "dynamicCache";


const limitCacheSize = (name, size) => {
    
    caches.open(name).then(cache=>{
        cache.keys().then(keys=>{
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name,size)) //0 번 삭제
            }
        })
    })
}//limitCacheSize() 함수정의



this.addEventListener('install', (event)=>{ //install에서 캐시 열고
    console.log('install');
    
    event.waitUntil( // 서비스 워커(캐시) 열기
        caches.open(staticCacheName).then((cache)=>{ //오픈된 캐시가 들어옮
            console.log('Opend Cache')
            return cache.addAll(urlsToCache); //연 후에, 위에 등록한 배열에 적힌 url 전부 넣기
        })
    ) 
})//this.addEventListener('install'
    
this.addEventListener('fetch', event => { //다이나믹 캐시 생성해서 동적으로 캐시 등록
    console.log('fetch');
    
    event.respondWith(//respondWith
        caches.match(event.request).then(cacheRes=>{
                               //인더넷이 되었을 경우
            return cacheRes || fetch(event.request).then(fetchRes=>{
                return caches.open(dynamicCache).then(cache => { // 내 현 캐시 daynamicCache에 넣기
                    cache.put(event.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCache, 500); //캐시가 10개가 등록되고 더 등록되면 삭제됨 //0번째부터 삭제됨 (위에 limitCacheSize함수 확인)
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
            console.log('배열', keys);
            return Promise.all(keys //"version-1"과 같지 않은 모든 캐시(이전에 있었던 다른 앱들의 dynamicCache들) 제거
                .filter(key=> key !== staticCacheName) //"version-1"과 같지 않으므로 "dynamicCache"을 뜻함, 
                .map(key => caches.delete(key)) //"version-1"만 남기고 지우겠다
            )
        })
    )
})