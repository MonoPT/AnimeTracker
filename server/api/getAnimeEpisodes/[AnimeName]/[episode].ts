import { Browser } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const browserIsHeadless = true
const puppeterArgs = [
    '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
  '--enable-features=NetworkService'
]

export default defineEventHandler(async event => {
    const animeName = event.context.params.AnimeName
    const episode = event.context.params.episode
    const PageToScrap = `https://animesonline.org/episodio/${animeName}-episodio-${episode}/`;

    let data:any = []

    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
        headless: browserIsHeadless,
        args: puppeterArgs,
        ignoreHTTPSErrors: true
    })

    const page = await browser.newPage()
    
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if(request.headers().referer === "https://animesonline.org/") {
            if (request.resourceType() === 'script') request.abort();
            else request.continue();
        }

        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font' || request.resourceType() === 'media' || request.resourceType() === 'websocket' || request.resourceType() === 'fetch' || request.resourceType() === 'other') request.abort();
        else request.continue();
    });

    
    await page.goto(PageToScrap)
        
    const list = await page.evaluate(() => {
        let List:any = [];

        let i = 0;

        let elements = document.querySelectorAll('.source-box a');

        elements.forEach(element => {
            List.push({
                title: document.querySelector(`#playeroptionsul .dooplay_player_option:nth-child(${i + 1}) .flag.resol`).textContent,
                link: element.getAttribute('href')
            })
            

            i++
        });

        return List
        
    });
    
    let browsers = []

    await Promise.all(list.map(async (player) => {

        let Newbrowser, pagePlayer

        if(player === list[0]) { ///If is first player load on first browser, else make a new one
            Newbrowser = browser
            pagePlayer = page
        } else {
            Newbrowser = await puppeteer.launch({ 
                headless: browserIsHeadless,
                args: puppeterArgs,
                ignoreHTTPSErrors: true
            })

            pagePlayer = await Newbrowser.newPage()

            await pagePlayer.setRequestInterception(true);
            pagePlayer.on('request', (request) => {
                if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font' || request.resourceType() === 'media' || request.resourceType() === 'websocket' || request.resourceType() === 'fetch' || request.resourceType() === 'other' ) request.abort();
                else request.continue();
            });
        }

        browsers.push(Newbrowser)

        await pagePlayer.goto('https://www.skipdns.link/');

        try {
            await pagePlayer.evaluate(val => (document.querySelector('#i-url') as HTMLFormElement).value = val, player.link);

            await pagePlayer.keyboard.press('Enter');
            await pagePlayer.waitForSelector('#copy-form-container input')

            const DNSSkipLink = await pagePlayer.evaluate(() => {
                return (document.querySelector('#copy-form-container input') as HTMLFormElement).value
            } );

            await pagePlayer.goto(`https://${DNSSkipLink}`);
            
            await pagePlayer.waitForSelector(".card-body .form-row.mt-4 .col-12.col-md-6.mt-3.mt-md-0 button")
            await pagePlayer.click('.card-body .form-row.mt-4 .col-12.col-md-6.mt-3.mt-md-0 button')

            await pagePlayer.waitForSelector('#player iframe')

            player.link = await pagePlayer.evaluate(() => {
                return document.querySelector("#player iframe").getAttribute('src')
            })
        } catch {
            player.link = "error"
        }
    }))

    browsers.forEach(element => {
        element.close()
    });

    

    
    
    
    














    data = list

    return {
        page: PageToScrap,
        data: data
    }

    
})

