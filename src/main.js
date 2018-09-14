import fs           from 'fs'
import path         from 'path'
import puppeteer from 'puppeteer'
import cron from 'node-cron'

async function getJobsOffers(villes, contrats, pagination, query = '', callback = (result) => {}) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // construction de l'url à scrapper
    let url = 'https://www.welcometothejungle.co/jobs'
    let urlParam = {
        refinementList: {
            office : { district: villes },
            contract_type_names: { fr: contrats }
        },
        page: pagination.page,
        configure: {
            filters: "website.reference%3Awttj_fr",
            hitsPerPage: pagination.hitsPerPage
        },
        query
    }

    url = url + '?'

    // les villes
    for (let i = 0; i < urlParam.refinementList.office.district.length; i++) {
        if(i >= 1) {
            url = url + '&'
        }
        url = `${url}refinementList[office.district][${i}]=${urlParam.refinementList.office.district[i]}`
    }

    // les types de contrats
    for (let i = 0; i < urlParam.refinementList.contract_type_names.fr.length; i++) {
        url = url + '&'
        url = `${url}refinementList[contract_type_names.fr][${i}]=${urlParam.refinementList.contract_type_names.fr[i]}`
    }

    // la pagination est les filtres supplémentaires
    url = url + '&configure%5Bfilters%5D=' + urlParam.configure.filters
    url = url + '&configure%5BhitsPerPage%5D=' + urlParam.configure.hitsPerPage
    url = url + '&page=' + urlParam.page

    // recherche
    url = url + '&query=' + urlParam.query

    // console.log(url)

    await page.goto(url);
    await page.screenshot({ path: "data/screenshot.png" })

    let html = (await page.$$('.ais-Hits-item'))
    var offres = [];

    for (let i=0; i < html.length; i++) {
        let poste = await html[i].$eval('h3 .ais-Highlight-nonHighlighted', e => e.innerText)
        let entreprise = await html[i].$eval('h4 .ais-Highlight-nonHighlighted', e => e.innerText)
        let logo = await html[i].$eval('img.zphx8j-4', e => e.src)
        let href = await html[i].$eval('a', e => e.href)
        
        let data = await html[0].$$('.sc-bXGyLb')
        let contrat = await data[0].$eval('.sc-cbkKFq span', e => e.innerText)
        let ville = await data[1].$eval('.sc-cbkKFq', e => e.innerText)
        let date = await data[2].$eval('.sc-cbkKFq span', e => e.innerText)
        
        let id = `${entreprise} - ${poste}`

        let offre = { id, poste, entreprise, logo, href, contrat, ville, date }

        offres.push(offre)
    }

    await browser.close();

    if (offres.length === 0) {
        console.log('SCRAPPING FAILED !!')
    } else {
        var result = []
        if (fs.existsSync('data/history.json')) {
            await fs.readFile('data/history.json', (err, data) => {
                if(err) throw err
    
                data = JSON.parse(data.toString())
                offres.forEach((offre) => {
                    let test = data.filter(element => element.id === offre.id)
                    if(test.length === 0) {
                        result.push(offre)
                    }
                });
                fs.writeFile('data/history.json', JSON.stringify(offres), (err) => {
                    if (err) throw err
                    callback(result)
                    console.log(`New scrapping result write (nbr of results: ${result.length})`)
                })
            })
        } else {
            fs.writeFile('data/history.json', JSON.stringify(offres), (err) => {
                if (err) throw err
                result = offres
                callback(result)
                console.log(`New scrapping result write (nbr of results: ${result.length})`)
            })
        }
    }


}


// discord bot
const Discord = require('discord.js')
const bot = new Discord.Client()

// client.channels.get(channelID).send('My Message')
// ecriture du message
bot.on('message', message => {

    if (message.content === '!activeJobsBot') {
        if (!message.guild.channels.exists("name","jobs")) {
            var server = message.guild
            server.createChannel("jobs", "text")
        }

        cron.schedule('0,30 * * * *', () => {
            getJobsOffers(["Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne"], ["CDI", "CDD%20%2F%20Temporaire"], {page: 1, hitsPerPage: 30}, '', result => {
                console.log('running a task every 30 mins');
                if(result.length !== 0) {
                    bot.channels.find("name","jobs").send(`${result.length} new jobs found ! \r\r`)
                    result.forEach(job => {
                        bot.channels.find("name","jobs").send(`:computer: ${job.entreprise} : ${job.poste} \r:clock8: ${job.ville} - ${job.date} \r:link: ${job.href} \r`)
                    });
                } else {
                    bot.channels.find("name","jobs").send('PAS DE NOUVEAUX JOBS')
                }
            })
        })
    }

    if (message.content === '!getJobs') {
        getJobsOffers(["Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne"], ["CDI", "CDD%20%2F%20Temporaire"], {page: 1, hitsPerPage: 30}, '', result => {
            if(result.length !== 0) {
                message.channel.send(`${result.length} new jobs found ! \r\r`)
                result.forEach(job => {
                    message.channel.send(`:computer: ${job.entreprise} : ${job.poste} \r:clock8: ${job.ville} - ${job.date} \r:link: ${job.href} \r`)
                });
            } else {
                message.channel.send('PAS DE NOUVEAUX JOBS')
            }
        })
    }
})

bot.login(process.env.BOT_TOKEN)