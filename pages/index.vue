<template>
    <main>
        <div>
            <h1>My anime Tracker</h1>
            <form @submit.prevent="searchAnime">
                <input type="text" placeholder="Search for an anime..." v-model="query" @input="handleInput">
                <button type="submit" class="button">Search</button>
            </form>

            <div class="results" v-if="search_results.length > 0 && query.length > 0">
                <div class="result" v-for="anime in search_results">
                    <img loading="lazy" :src="anime.images.jpg.image_url"/>
                    <div class="details">
                        <h3><Nuxt-Link :to="anime.url.replace('https://myanimelist.net','')">{{anime.title}}</Nuxt-Link></h3>
                        <p :title="anime.synopsis" v-if="anime.synopsis">{{anime.synopsis.slice(0,120)}}...</p>
                        <span class="flex-1"></span>
                        <button @click="addAnime(anime)" class="button" v-if="(!checkIfIsOnAnimeList(anime))">Add to my anime list</button>
                        <button @click="removeAnime(anime)" class="button" v-else>Remove from my anime list</button>
                    </div>
                </div>
            </div>

            <div class="myAnime" v-if="my_anime.length > 0">
                <h2>My anime</h2>
                <div class="anime" v-for="anime in my_anime_asc">
                    <img :src="anime.image"/>
                    <h3 class="flex-1"><Nuxt-Link :to="anime.url">{{anime.title}}</Nuxt-Link></h3>
                    <span class="episodes">
                        {{anime.watched_episodes.length}} / {{anime.total_episodes}}
                    </span>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
    import {manageAnimeList} from '@/composables/manageAnimeList'

    const {addAnimeToList, checkIfIsOnAnimeList, removeFromAnimeList, isOnAnimeList} = manageAnimeList()

    const query = ref("")
    const my_anime = ref([])
    const search_results = ref([])

    const my_anime_asc = computed(() => {
        return my_anime.value.sort((a,b) => {
            return a.title.localeCompare(b.title)
        })
    })

    const searchAnime = () => {
        const url = `https://api.jikan.moe/v4/anime?q=${query.value}`
        fetch(url).then(res => res.json())
            .then(res => {
                search_results.value = res.data
            })
    }

    const handleInput = e => {
        if(!e.target.value) {
            search_results.value = []
        }
    }

    const addAnime = anime => {
        search_results.value = []
        query.value = ''
        addAnimeToList(anime)
        updateAnimeList()
    }

    const removeAnime = anime => {
        search_results.value = []
        query.value = ''
        removeFromAnimeList(anime)
        updateAnimeList()
    }

    const increaseWatch = anime => {
        anime.watched_episodes.push(1)
        localStorage.setItem('myAnime', JSON.stringify(my_anime.value))
    }

    const decreaseWatch = anime => {
        anime.watched_episodes--
        localStorage.setItem('myAnime', JSON.stringify(my_anime.value))
    }

    function updateAnimeList() {
        my_anime.value = JSON.parse(localStorage.getItem('myAnime')) || []
    }

    onMounted(() => {
        updateAnimeList()
    })

</script>

<style lang="scss">
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Fira-sans', sans-serif;
    }

    body {
        background-color: #EEE;
    }

    main {
        margin: 0 auto;
        max-width: 768px;
        padding: 1.5rem
    }

    h1 {
        text-align: center;
        margin-bottom: 1.5rem;
    }

    form {
        display: flex;
        max-width: 480px;
        margin: 0 auto 1.5rem;

        input {
            appearance: none;
            outline: none;
            border: none;
            background: #FFFF;
            display: block;
            color: #888;
            font-size: 1.125rem;
            padding: .5rem 1rem;
            width: 100%;
        }
    }

    .button {
        appearance: none;
        outline: none;
        border: none;
        cursor: pointer;
        background: none;
        padding: .5rem 1rem;
        background-image: linear-gradient(to right, deeppink 50%, darkviolet 50%);
        background-size: 200%;
        color: #FFF;
        font-size: 1.125rem;
        font-weight: 700;
        text-transform: uppercase;
        transition: 0.4s;
    }

    .button:hover {
        background-position: right;
    }

    .results {
        background-color: #FFF;
        border-radius: .5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-height: 480px;
        overflow-y: scroll;
        margin-bottom: 1.5rem;

        .result {
            display: flex;
            margin: 1rem;
            padding: 1rem;
            border: 1px solid #DDD;
            border-radius: 0.5rem;
            transition: 0.4s;

            img {
                width: 100px;
                border-radius: 1rem;
                margin-right: 1rem;
            }

            .details {
                flex: 1 1 0%;
                display: flex;
                align-items: flex-start;
                flex-direction: column;

                h3 {
                    font-size: 1.25rem;
                    margin-bottom: 0.5rem;
                    color: #000;
                    cursor: pointer;
                    transition: .2s;

                    &:hover {
                        color: rgb(120, 120, 120);
                    }

                    a{
                        color: inherit;
                        text-decoration: none;
                        transition: .2s;
                    }
                }

                p {
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                }

                .button {
                    margin-left: auto;
                }
            }
        }
    }

    .flex-1 {
        flex: 1 1 0%;
    }

    .myAnime {
        h2 {
            color: #888;
            font-weight: 400;
            margin-bottom: 1.5rem;

        }

        .anime {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            background-color: #FFF;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;

            img {
                width: 72px;
                height: 72px;
                object-fit: cover;
                border-radius: 0 1rem 1rem 0;
                margin-right: 1rem;
            }

            h3 {
                color: #888;
                font-size: 1.125rem;
                transition: .2s;
                cursor: pointer;


                a {
                    text-decoration: none;
                    color: inherit;
                    transition: .2s;
                }

                &:hover {
                    color: rgb(88, 88, 88);
                }
            }
            

            .episodes {
                margin-right: 1rem;
                color: #888;
            }

            .button {
                margin-right: 1rem;
            }

        }
    }

</style>