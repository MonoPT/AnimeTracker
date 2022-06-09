export function manageAnimeList(animeId = 0) {

    let isOnAnimeList = ref(checkIfIsOnAnimeList(animeId));


    function getMyAnimeList() {
        if(process.client) {
            return JSON.parse(localStorage.getItem('myAnime')) || []
        }
        return []
    }

    function addAnimeToList(anime) { ///Add anime to list
        let my_anime = getMyAnimeList()
        
        my_anime.push({
            id: anime.mal_id,
            title: anime.title,
            image: anime.images.jpg.image_url,
            total_episodes: anime.episodes,
            watched_episodes: [],
            url:  anime.url.replace('https://myanimelist.net','')
        })

        if(process.client) localStorage.setItem('myAnime', JSON.stringify(my_anime))
        isOnAnimeList.value = true
    }

    function checkIfIsOnAnimeList(anime) {
        if(!anime.mal_id) return
        
        let animeId = anime.mal_id
        let found = false;

        getMyAnimeList().forEach(animeCheck => {
            if(animeCheck.id === animeId) {
                found = true
            } 
        });

        isOnAnimeList.value = found
        return found
    }

    function removeFromAnimeList(anime) {
        if(!anime.mal_id) return
        
        let newAnimeArr = []

        let animeId = anime.mal_id

        getMyAnimeList().forEach(animeCheck => {
            if(animeCheck.id !== animeId) {
                newAnimeArr.push(animeCheck)
            }
        });

        if(process.client) localStorage.setItem('myAnime', JSON.stringify(newAnimeArr))
        isOnAnimeList.value = false
    }

    function getWatchedEpisodesArr(animeId) {
        const animeList = getMyAnimeList();

        let ep = []

        animeList.forEach(anime => {
            if(anime.id === parseInt(animeId)) {
                ep = anime.watched_episodes;                 
            }
        });
        
        return ep
    }

    function addEpisodeToWatched(episode, animeId) {
        let my_anime = getMyAnimeList()

        let animeIdV = parseInt(animeId);
        let ep = episode;

        my_anime.forEach(anime => {
            if(anime.id === animeIdV) {
                anime.watched_episodes.push(ep);
                
            }
        });

        if(process.client) localStorage.setItem('myAnime', JSON.stringify(my_anime))
    }

    function removeEpisodefromWatched(episode, animeId) {
        let my_anime = getMyAnimeList()

        let animeIdV = parseInt(animeId);
        let ep = episode;

        my_anime.forEach(anime => {
            if(anime.id === animeIdV) {
                let epIndex = anime.watched_episodes.indexOf(ep)                
                anime.watched_episodes.splice(epIndex, 1)
                
            }
        });

        if(process.client) localStorage.setItem('myAnime', JSON.stringify(my_anime))
    }

    

    return {
        addAnimeToList,
        checkIfIsOnAnimeList,
        removeFromAnimeList,
        isOnAnimeList,
        getWatchedEpisodesArr,
        addEpisodeToWatched,
        removeEpisodefromWatched
    }
}