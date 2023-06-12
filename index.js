const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cheerio = require('cheerio');

const app = express();
const PORT = 8080;

app.use(cors());
dotenv.config();
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));

const urlApi = 'https://www.leagueoflegends.com/vi-vn/champions/';

// get all champions
app.get('/', (req, resp) => {
    const listChampions = [];

    try {
        axios(urlApi).then(res => {
            const html = res.data;
            const $ = cheerio.load(html);

            $('a.style__Wrapper-n3ovyt-0', html).each(function () {
                const name = $(this).find('span.style__Text-n3ovyt-3').text();
                const urlChampion = $(this).attr('href');
                // const image = $(this).find('span > img').attr('src');

                listChampions.push({
                    name: name,
                    url: 'http://localhost:8080/' + urlChampion.split('/')[3],
                    // image: image
                });
            });

            resp.status(200).json(listChampions);
        });
    } catch (error) {
        resp.status(500).json(error);
    }
});

// get a champion
app.get('/:champion', (req, resp) => {
    const url = urlApi + req.params.champion;

    let championDetails = {};

    let abilities = {};
    const passive = {};
    const q = {};
    const w = {};
    const e = {};
    const r = {};
    const abilityName = [];
    const abilityDescription = [];

    const skins = [];
    const skinName = [];
    const skinImg = [];

    try {
        axios(url).then(res => {
            const html = res.data;
            const $ = cheerio.load(html);

            $('.style__Main-nag7bg-1.bILiti', html).each(function () {
                const name = $(this).find('.style__Heading-sc-1h71ys8-1 > strong').text();
                const role = $(this).find('.style__SpecsItem-sc-8gkpub-12.hsnFYj > .style__SpecsItemValue-sc-8gkpub-15.kPaHxk').text();
                const difficulty = $(this).find('.style__SpecsItem-sc-8gkpub-12.kZfoPV > .style__SpecsItemValue-sc-8gkpub-15.kPaHxk').text();

                //get chapmion's abilities
                $(this).find('.style__AbilityInfoList-sc-1bu2ash-7 > li > h5').each(function () {
                    abilityName.push($(this).text());
                });

                $(this).find('.style__AbilityInfoList-sc-1bu2ash-7 > li > p').each(function () {
                    abilityDescription.push($(this).text());
                });

                passive[abilityName[0]] = abilityDescription[0];
                q[abilityName[1]] = abilityDescription[1];
                w[abilityName[2]] = abilityDescription[2];
                e[abilityName[3]] = abilityDescription[3];
                r[abilityName[4]] = abilityDescription[4];

                abilities = {
                    passive: passive,
                    q: q,
                    w: w,
                    e: e,
                    r: r
                };

                //get champion's skins
                $(this).find('.swiper-wrapper > li > button > label').each(function () {
                    skinName.push($(this).text());
                });

                $(this).find('.style__SlideshowItem-gky2mu-3 > div > img').each(function () {
                    skinImg.push($(this).attr('src'));
                });

                for (let i = 0; i < skinName.length; i++) {
                    skins.push({
                        [skinName[i]]: skinImg[i],
                    });
                }

                championDetails = {
                    name: name,
                    image: skinImg[0],
                    role: role,
                    difficulty: difficulty,
                    abilities: abilities,
                    skins: skins
                };
            });

            resp.status(200).json(championDetails);
        });
    } catch (error) {
        resp.status(500).json(error);
    }
});

app.listen(process.env.PORT || PORT, () => {
    console.log("Server is running...")
});
