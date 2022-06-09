<template>
    <div>
        <div class="goBack"><Nuxt-Link to="/">&lt; Go back to main page</Nuxt-Link></div>
        <div class="popUpWindow" v-if="openTrailer || openEpisode">
            <div class="close" @click="openTrailer = false; openEpisode = false">X</div>
            <iframe v-if="openTrailer" :src="animeData.trailer" frameborder="0" allowfullscreen style="position:absolute;top:0%;left:0%;width:100%;height:100%;"></iframe>
            <iframe v-if="openEpisode" :src="episodePlaying" frameborder="0" allowfullscreen style="position:absolute;top:0%;left:0%;width:100%;height:100%;"></iframe>
            
            
        </div>

        <div class="animeWrapper contentContainer">
            <img :src="animeData.url" alt="">
            <div class="info-container">
                <div class="title">{{animeData.animeName}}</div>
                <div class="Originaltitle">{{animeData.originalTitle}}</div>
                <div class="year">{{animeData.year}}</div>
                <div class="rate">
                    <div class="rate-box">{{(animeData.score > 0) ? animeData.score : '--'}}</div>

                    <div class="wrapper">
                        <div class="progress" :style="`--progress:${animeData.score * 10}%`"></div>
                        <span class="material-symbols-outlined" v-for="index in 10" :key="index">grade</span>
                    </div>
                </div>
                <div class="genres">
                    <div class="genre" v-for="genre in animeData.genres" :key="genre">
                        {{genre}}
                    </div>
                </div>
                <div class="addToAnimeList">
                    <div class="btn-wrapper">
                        <button class="trailerBTN" v-if="animeData.trailer" @click="loadTrailer(animeData.trailer)">Watch trailer <span class="material-symbols-outlined">smart_display</span></button>                  
                    </div>
                    

                    <div class="btn-wrapper list">
                        <button class="button " @click="addAnimeToList(anime)" v-if="!isInAnimeList">Add to my anime list</button>
                        <button class="button " @click="removeFromAnimeList(anime)" v-else>Remove from my anime list</button>
                    </div>
                    
                </div>
                
            </div>
        </div>

        <div class="synopsis contentContainer">
            <h2>Synopsis</h2>
            <p>{{animeData.synopsis.replace("(Source: ANN)", '').replace('[Written by MAL Rewrite]', '').replace("(Source: MAL News)", '') }}</p>        
        </div>

        <div class="status contentContainer">
            <h2>Information</h2>
            <div class="info-container">
                <span>Status</span>
                <div class="wrapper">
                    <span :class="`${animeData.info.status === 'Currently Airing' ? 'active' : animeData.info.status === 'Finished Airing' ? 'finished' : 'upcoming'  }`">
                    {{animeData.info.status}}</span>
                </div>

                <span>Rating</span>
                <div class="wrapper">
                    <span>{{animeData.info.rating}}</span>
                </div>

                <span>Release date</span>
                <div class="wrapper">
                    <span>{{animeData.info.status === 'Not yet aired' ? new Date(animeData.info.release).getFullYear() : new Date(animeData.info.release).toLocaleDateString("pt-PT")}}</span>
                </div>

                <span v-if="animeData.info.status === 'Finished Airing'">Last episode release</span>
                <div class="wrapper" v-if="animeData.info.status === 'Finished Airing'">
                    <span>{{new Date(animeData.info.lastEpisode).toLocaleDateString("pt-PT")}}</span>
                </div>

                <span v-if="animeData.info.status === 'Currently Airing'">Next episode</span>
                <div class="wrapper" v-if="animeData.info.status === 'Currently Airing'">
                    <span>{{animeData.info.broadcast}}</span>
                </div>

                <span>Source</span>
                <div class="wrapper">
                    <span>{{animeData.info.source}}</span>
                </div>

                <span>Studio(s)</span>
                <div class="wrapper">
                    <span> <template v-for="(studio, index) in animeData.info.studios">{{studio.name}}<template v-if="index !== animeData.info.studios.length - 1">, </template></template> </span>
                </div>
            </div>
        </div>

        <div class="gallery contentContainer">
            <h2>Gallery</h2>
            <div class="imageWrapper">
                <div class="image" v-for="picture in animeData.pictureGallery">
                    <img :src="picture" loading="lazy">
                </div>
            </div>
        </div>

        
        <div class="episodes contentContainer">
            <div class="wrap"><h2>Episodes</h2><span>{{watchedEpisodes.length}}/{{episodes.length}}</span></div>
            <div class="episode-wrapper">

                <div class="episode" v-for="(ep, index) in episodes" :key="index">
                    <div class="epN">{{ep.epNumber}} |</div>
                    <div class="epData">
                        <span class="name">{{ep.title}}</span>
                        <div class="originalName">{{ep.originalTitle}}</div>
                        <div class="tags">
                            <span class="filler" v-if="ep.filler">Filler</span>
                            <span class="recap"  v-if="ep.recap">Recap</span>
                        </div>
                        <div class="date">{{new Date(ep.airedDate).toLocaleDateString("pt-PT")}}</div>
                    </div>
                    <div class="buttons">
                        <span class="watchToggle" v-if="isInAnimeList"><span class="material-symbols-outlined" @click="watchedEpisodes.includes(ep.epNumber) ? removeEpfromViewdLsit(ep.epNumber, animeId) : addEpToViewdLsit(ep.epNumber, animeId)"> {{watchedEpisodes.includes(ep.epNumber) ? 'done' : 'close'}} </span></span><!--done/close-->
                        <span class="openEpisodesList"><button class="button " @click="showEpisodeOptions(`${ep.epNumber}`)">Watch</button></span>
                    </div>
                    <div class="watchOptions" :class="`episodeWatchOptions${ep.epNumber}`" data-active="false" data-calledLoad="false">
                        <div class="loader"><span class="material-symbols-outlined"> atr </span> Loading</div>
                        <div class="wrapper">                            
                        </div>
                        <div class="error">Couldn´t load episode</div>
                    </div>
                </div>

            </div>
        </div>



    </div>
</template>

<script setup lang="ts">
    import {manageAnimeList} from '@/composables/manageAnimeList'

    const {addAnimeToList, checkIfIsOnAnimeList, removeFromAnimeList, isOnAnimeList, getWatchedEpisodesArr, addEpisodeToWatched, removeEpisodefromWatched} = manageAnimeList()

    const isInAnimeList = ref(isOnAnimeList);

    const route = useRoute()
    const animeId = ref(route.params.animeId)

    const openEpisode = ref(false)
    const episodePlaying = ref('')

    const animeData = ref({
        url: '',
        animeName: '',
        originalTitle: '',
        title: '',
        year: 0,
        score: 0,
        genres: [],
        synopsis: '',
        trailer: null,
        pictureGallery: [],
        info: {
            status: '',
            release: '',
            broadcast: '',
            rating: '',
            source: '',
            studios: [],
            lastEpisode: ''
        },
        episodes: []
    })

    const openedEpisodes = ref([])
    const watchedEpisodes = ref(getWatchedEpisodesArr(animeId.value));
    
    const EnglishName = ref('')
    

    const anime = ref({})

    const episodes = ref([])

    onMounted(() => {
        const url = `https://api.jikan.moe/v4/anime/${animeId.value}` ///Get anime base data
        fetch(url).then(res => res.json())
            .then(res => {
                anime.value = res.data
                checkIfIsOnAnimeList(anime.value)
                console.log(animeData)
                animeData.value.url = res.data.images.jpg.large_image_url
                animeData.value.animeName = res.data.title
                animeData.value.originalTitle = res.data.title_japanese
                animeData.value.year = res.data.year
                animeData.value.score = res.data.score
                animeData.value.synopsis = res.data.synopsis
                animeData.value.trailer = res.data.trailer.embed_url
                animeData.value.info.status = res.data.status
                animeData.value.info.release = res.data.aired.from
                animeData.value.info.lastEpisode = res.data.aired.to
                animeData.value.info.broadcast = res.data.broadcast.string
                animeData.value.info.rating = res.data.rating
                animeData.value.info.source = res.data.source
                animeData.value.info.studios = res.data.studios
                EnglishName.value = res.data.title_english
                animeData.value.title = res.data.title

                res.data.genres.forEach(genre => {
                    animeData.value.genres.push(genre.name)
                });
            }) 

        const urlPictures = `https://api.jikan.moe/v4/anime/${animeId.value}/pictures` ///Get image gallery
        fetch(urlPictures).then(res => res.json())
            .then(res => {
                Array.from(res.data).forEach((pic:any) => {
                    if(pic.jpg.large_image_url) {
                        animeData.value.pictureGallery.push(pic.jpg.large_image_url)    
                    }
                });
            }) 

        
        fetchEpisodes(1, animeId.value)///Get episodes
    })

    async function fetchEpisodes(page, animeId) { ///FetchEpisodes
        const urlEpisodes = `https://api.jikan.moe/v4/anime/${animeId}/episodes?page=${page}` ///Get episodes
        await fetch(urlEpisodes).then(res => res.json())
            .then(res => {
                Array.from(res.data).forEach((ep:any) => {
                    episodes.value.push({
                        epNumber: ep.mal_id,
                        title: ep.title,
                        originalTitle: ep.title_romanji,
                        filler: ep.filler,
                        recap: ep.recap,
                        airedDate: ep.aired
                    })
                });

                
                if(res.pagination.has_next_page) {
                    setTimeout(function(){
                        fetchEpisodes(page + 1, animeId)
                    }, 1200)
                    
                }
            })         
    }

    const openTrailer = ref(false)
    function loadTrailer(url) {
        openTrailer.value = true
        console.log(url)
    }

    function addEpToViewdLsit(epNumber, animeId) {
        addEpisodeToWatched(epNumber, animeId)
        watchedEpisodes.value = getWatchedEpisodesArr(animeId)
    }

     function removeEpfromViewdLsit(epNumber, animeId) {
        removeEpisodefromWatched(epNumber, animeId)
        watchedEpisodes.value = getWatchedEpisodesArr(animeId)
    }

    function showEpisodeOptions(episode) {
        let el:any = document.querySelector(`.episodeWatchOptions${episode}`)
        el.dataset.active = !JSON.parse(el.dataset.active.toLowerCase())

        const animeName = animeData.value.title

        console.log(animeName)

        const nameToSearch = animeName.toLowerCase().replaceAll('×','x').replaceAll(" ", "-");
        
        console.log(JSON.parse(el.getAttribute('data-calledLoad')))
        if(!JSON.parse(el.getAttribute('data-calledLoad'))) loadEpisode(nameToSearch, episode, `.episodeWatchOptions${episode}`)

        el.setAttribute('data-calledLoad', true);

        
       
    }

    async function loadEpisode(searchName, episode, container) {
        let reg = new RegExp('(season\s\d{1})')

        console.log(searchName)



        fetch(`../../api/getAnimeEpisodes/${searchName}/${episode}`)
        .then(response => response.json())
        .then(data => {
            data.data.forEach(player => {
                let containerEl = document.querySelector(`${container} .wrapper`)
            
                let playerBTN:any = document.createElement("button")
                playerBTN.innerText = player.title;
                playerBTN.setAttribute('data-url', player.link)
                playerBTN.classList.add("button")


                playerBTN.onclick = function() {
                    showEpisode(player.link)
                }

                containerEl.appendChild(playerBTN)



                document.querySelector(`${container}`).classList.add("loaded")
            });

            console.log(data.data)

            if(data.data.length < 1) {
                document.querySelector(`${container}`).classList.add("error")
                document.querySelector(`${container}`).classList.add("loaded")
            }
        })
        .catch(err => {
            document.querySelector(`${container}`).classList.add("error")
            document.querySelector(`${container}`).classList.add("loaded")    
        });

    }

    function showEpisode(url) {
        console.log("open episode")
        openEpisode.value = true;
        episodePlaying.value = url
        //openEpisode
    }
    

</script>

<style scoped lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200");

    .goBack {
        display: block;
        width: 100%;
        height: 40px;
        font-size: 1.125rem;
        line-height: 45px;
        background: rgb(38, 38, 38);
        color: #FFF;
        padding-left: 30px;
        transition: .2s;

        &:hover {
            color: rgb(177, 177, 177);
        }

        a {
            color: inherit;
            text-decoration: none;
             transition: .2s;
        }
    }

    .contentContainer {
        margin: 0 auto;
        width: 80%;
        padding: 1.5rem;
        background: #FFF;
        border-radius: .5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,.1);
        margin-top: 20px;

        h2 {
            color: #888;
            font-weight: 400;
            margin-bottom: 1.5rem;
        }

        @media (max-width: 550px) {
            width: 95%;
        }
    }

    .animeWrapper {
        
        
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 20px;

        img {
            width: 190px;
            min-height: 30px;
            background: #ccc;
            border-radius: 1rem;
            object-fit: cover;
        }

        .info-container {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;

            .title {
                font-size: 1.75rem;
                font-weight: 700;
            }
            .Originaltitle {
                font-size: .75em;
                color: rgb(157, 157, 157);
            }

            .year {
                margin-top: 8px;
                color: #333;
                font-size: .9em;
            }

            .rate {
                margin-top: 25px;
                display: flex;
                align-items: center;
                .rate-box {
                    display: block;
                    width: 52px;
                    height: 52px;
                    line-height: 52px;
                    border-radius: .5rem;
                    background: #222;
                    text-align: center;
                    color: #fff;
                    font-size: 1.5em;

                    @media (max-width:768px) {
                        width: 45px;
                        height: 45px;
                        line-height: 45px;
                        font-size: 1em;
                    }
                }

                .wrapper {
                    position: relative;
                    display: inline-block;

                    .progress {
                        width: var(--progress);
                        display: block;
                        position: absolute;
                        left: 0;
                        top: 0;
                        height: 100%;
                        background: #FFD700;
                        mix-blend-mode: screen;

                        transition: .2s;
                    }
                }

                .material-symbols-outlined{
                    
                    color: rgb(114, 114, 114);

                    &:first-of-type {
                        margin-left: 4px;
                    }

                    @media (max-width:768px) {
                        font-size: 18px;
                    }
                }
            }

            .genres {
                display: flex;
                flex-wrap: wrap;
                position: relative;
                margin-top: 16px;

                .genre {
                    display: block;
                    position: relative;
                    background: rgb(212, 212, 212);
                    padding: 6px;
                    border-radius: .15rem;
                    margin-top: 6px;

                    &:not(:first-of-type) {
                        margin-left: 15px;
                    }

                    @media (max-width:768px) {
                        font-size: .8em;
                    }
                }
            }

            .addToAnimeList {
                display: grid;
                grid-template-columns: 1fr 1fr;
                margin-top: auto;

                .btn-wrapper.list {
                    display: flex;
                    justify-content: flex-end;
                }

                @media (max-width:768px) {
                    margin-top: 15px;
                    grid-template-columns: 1fr;

                    button {
                        width: 100%;
                    }

                    .trailerBTN {
                        justify-content: center;
                        margin-bottom: 8px;
                    }
                }
            }
        }

        @media (max-width:768px) {
            grid-template-columns: 1fr;

            img {
                margin: 0 auto;
            }

            .title {
                text-align: center;
                margin-top: 8px;
            }

            .Originaltitle, .year {
                text-align: center;
            }

            
        }
    }

    .synopsis {
        p {
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            line-height: 1.4;
        }
    }

    .trailerBTN {
        display: flex;
        align-items: center;
        appearance: none;
        outline: none;
        border: none;
        cursor: pointer;
        background: none;
        padding: .5rem 1rem;
        background-image: linear-gradient(to right, rgb(255, 20, 20) 50%, rgb(211, 0, 63) 50%);
        background-size: 200%;
        color: #FFF;
        font-size: 1.125rem;
        font-weight: 700;
        text-transform: uppercase;
        transition: 0.4s;

        span {
            margin-left: 8px;
        }
    }

    .trailerBTN:hover {
        background-position: right;
    }

    .popUpWindow {
        position: fixed;
        display: grid;
        justify-content: center;
        align-items: center;
        width: 95vw;
        height: 95vh;
        left: 2.5vw;
        top: 2.5vh;
        background: rgb(0, 0, 0);
        z-index: 95;
        border-radius: .5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,.1);
        padding: 20px;
        overflow: hidden;

        .close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 1.5em;
            cursor: pointer;
            color: #555;
            z-index: 98;

            transition: .4s;
            &:hover {
                color: #ccc;
            }
        }

        iframe {
            width: 100%;
            appearance: none;
            border: none;
        }
    }

    .gallery {
        .imageWrapper {
            display: flex;
            flex-flow: row;
            width: 100%;
            min-height: 20px;
            overflow: hidden;
            overflow-x: scroll;

            .image {
                $width: 210px;
                display: block;
                width: 200px;
                height: 280px;
                background: #ccc;
                flex: 0 0 auto;
                border-radius: .5rem;
                overflow: hidden;

                &:not(:first-of-type) {
                    margin-left: 15px;
                }

                img {
                    appearance: none;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border: none;
                }
            }
        }
    }

    .status {
        .info-container {
            display: grid;
            grid-template-columns: auto 1fr;
            
            gap: 12px;

            span {
                padding: 5px;
                box-sizing: border-box;
                height: 28px;
                line-height: 28px;
            }

            > span {
                display: inline-block;
                color: #333;
                font-size: 1.2em;
                line-height: 1;
            }

            .wrapper span {
                border-radius: .2rem;
                color: rgb(31, 31, 31);

                &.active {
                    color: #fff;
                    background-color: rgb(25, 255, 68);
                }

                &.finished {
                    color: #fff;
                    background-color: rgb(25, 117, 255);
                }

                &.upcoming {
                    color: #fff;
                    background-color: rgb(216, 213, 22);
                }
            }
        }
    }

    .episodes {
        .wrap {
            display: grid;
            grid-template-columns: auto auto;

            span {
                display: flex;
                justify-content: flex-end;
                color: #ccc;
                font-size: 1.2em;
            }
        }
        .episode {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 22px;
            width: 100%;
            background: #eee;
            min-height: 22px;
            padding: 12px;
            border-radius: .25rem;

            &:not(:first-of-type) {
                margin-top: 15px;
            }

            .epN {
                font-size: 1.4em;
            }

            .name {
                font-size: 1.12em;
            }

            .originalName {
                color: rgb(75, 75, 75);
                font-size: .75em;
            }

            .date {
                margin-top: 20px;
                font-size: .9em;
                color: rgb(75, 75, 75);
            }

            .tags{
                display: flex;
                position: relative;
                margin-top: 5px;

                span {
                    display: block;
                    padding: 6px;
                    background: rgb(228, 34, 34);
                    border-radius: .22rem;
                    color: #fff;

                    &:not(:first-of-type) {
                        margin-left: 12px;
                    }

                    &.recap {
                        background: rgb(194, 26, 194);
                    }
                }
            }

            .buttons {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: flex-end;

                .watchToggle {
                    margin-bottom: 20px;
                    
                    span {
                        cursor: pointer;
                        font-size: 1.8em;
                        color: rgb(155, 155, 155);
                    }
                }
            }
        }
    }

    .watchOptions {
        display: block;
        width: 100%;
        
        grid-column-end: 3;

        transition: 0.4s;
        overflow: hidden;

        .error {
            display: none;
        }

        &.error {
            .error {
                display: block;
                margin-top: 15px;
                color: rgba(255, 0, 0, 0.686);
                font-size: .9em;
            }
        }

        .wrapper {
            display: flex;
            margin-top: 15px;
            column-gap: 15px;
        }

        .loader {
            color: rgb(147, 147, 147);
            display: none;

            span {
                margin-right: 12px;
            }
        }

        &:not(.loaded) {
            .wrapper {
                display: none;
            }

            .loader {
                display: flex;
                justify-content: left;
                align-items: center;

                span {
                    animation-name: spin;
                    animation-duration: 2000ms;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                } 
            }
        }

        

        &[data-active="false"] {
            height: 0;
            display: none;
        }

        &[data-active="true"] {
            min-height: 50px;
        }
    }

    @keyframes spin {
        from {
            transform:rotate(0deg);
        }
        to {
            transform:rotate(360deg);
        }
    }
</style>