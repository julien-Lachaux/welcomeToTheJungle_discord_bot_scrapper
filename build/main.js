'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getJobsOffers = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(villes, contrats, pagination) {
        var query = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
        var callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function (result) {};

        var browser, page, url, urlParam, i, _i, html, offres, _i2, poste, entreprise, logo, href, data, contrat, ville, date, id, offre, result;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _puppeteer2.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

                    case 2:
                        browser = _context.sent;
                        _context.next = 5;
                        return browser.newPage();

                    case 5:
                        page = _context.sent;


                        // construction de l'url à scrapper
                        url = 'https://www.welcometothejungle.co/jobs';
                        urlParam = {
                            refinementList: {
                                office: { district: villes },
                                contract_type_names: { fr: contrats }
                            },
                            page: pagination.page,
                            configure: {
                                filters: "website.reference%3Awttj_fr",
                                hitsPerPage: pagination.hitsPerPage
                            },
                            query: query
                        };


                        url = url + '?';

                        // les villes
                        for (i = 0; i < urlParam.refinementList.office.district.length; i++) {
                            if (i >= 1) {
                                url = url + '&';
                            }
                            url = url + 'refinementList[office.district][' + i + ']=' + urlParam.refinementList.office.district[i];
                        }

                        // les types de contrats
                        for (_i = 0; _i < urlParam.refinementList.contract_type_names.fr.length; _i++) {
                            url = url + '&';
                            url = url + 'refinementList[contract_type_names.fr][' + _i + ']=' + urlParam.refinementList.contract_type_names.fr[_i];
                        }

                        // la pagination est les filtres supplémentaires
                        url = url + '&configure%5Bfilters%5D=' + urlParam.configure.filters;
                        url = url + '&configure%5BhitsPerPage%5D=' + urlParam.configure.hitsPerPage;
                        url = url + '&page=' + urlParam.page;

                        // recherche
                        url = url + '&query=' + urlParam.query;

                        // console.log(url)

                        _context.next = 17;
                        return page.goto(url);

                    case 17:
                        _context.next = 19;
                        return page.screenshot({ path: "data/screenshot.png" });

                    case 19:
                        _context.next = 21;
                        return page.$$('.ais-Hits-item');

                    case 21:
                        html = _context.sent;
                        offres = [];
                        _i2 = 0;

                    case 24:
                        if (!(_i2 < html.length)) {
                            _context.next = 55;
                            break;
                        }

                        _context.next = 27;
                        return html[_i2].$eval('h3 .ais-Highlight-nonHighlighted', function (e) {
                            return e.innerText;
                        });

                    case 27:
                        poste = _context.sent;
                        _context.next = 30;
                        return html[_i2].$eval('h4 .ais-Highlight-nonHighlighted', function (e) {
                            return e.innerText;
                        });

                    case 30:
                        entreprise = _context.sent;
                        _context.next = 33;
                        return html[_i2].$eval('img.zphx8j-4', function (e) {
                            return e.src;
                        });

                    case 33:
                        logo = _context.sent;
                        _context.next = 36;
                        return html[_i2].$eval('a', function (e) {
                            return e.href;
                        });

                    case 36:
                        href = _context.sent;
                        _context.next = 39;
                        return html[0].$$('.sc-bXGyLb');

                    case 39:
                        data = _context.sent;
                        _context.next = 42;
                        return data[0].$eval('.sc-cbkKFq span', function (e) {
                            return e.innerText;
                        });

                    case 42:
                        contrat = _context.sent;
                        _context.next = 45;
                        return data[1].$eval('.sc-cbkKFq', function (e) {
                            return e.innerText;
                        });

                    case 45:
                        ville = _context.sent;
                        _context.next = 48;
                        return data[2].$eval('.sc-cbkKFq span', function (e) {
                            return e.innerText;
                        });

                    case 48:
                        date = _context.sent;
                        id = entreprise + ' - ' + poste;
                        offre = { id: id, poste: poste, entreprise: entreprise, logo: logo, href: href, contrat: contrat, ville: ville, date: date };


                        offres.push(offre);

                    case 52:
                        _i2++;
                        _context.next = 24;
                        break;

                    case 55:
                        _context.next = 57;
                        return browser.close();

                    case 57:
                        if (!(offres.length === 0)) {
                            _context.next = 61;
                            break;
                        }

                        console.log('SCRAPPING FAILED !!');
                        _context.next = 68;
                        break;

                    case 61:
                        result = [];

                        if (!_fs2.default.existsSync('data/history.json')) {
                            _context.next = 67;
                            break;
                        }

                        _context.next = 65;
                        return _fs2.default.readFile('data/history.json', function (err, data) {
                            if (err) throw err;

                            data = JSON.parse(data.toString());
                            offres.forEach(function (offre) {
                                var test = data.filter(function (element) {
                                    return element.id === offre.id;
                                });
                                if (test.length === 0) {
                                    result.push(offre);
                                }
                            });
                            _fs2.default.writeFile('data/history.json', JSON.stringify(offres), function (err) {
                                if (err) throw err;
                                callback(result);
                                console.log('New scrapping result write (nbr of results: ' + result.length + ')');
                            });
                        });

                    case 65:
                        _context.next = 68;
                        break;

                    case 67:
                        _fs2.default.writeFile('data/history.json', JSON.stringify(offres), function (err) {
                            if (err) throw err;
                            result = offres;
                            callback(result);
                            console.log('New scrapping result write (nbr of results: ' + result.length + ')');
                        });

                    case 68:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getJobsOffers(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

// discord bot


var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _nodeCron = require('node-cron');

var _nodeCron2 = _interopRequireDefault(_nodeCron);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('BOT ONLINE');
});

app.listen(port, function () {
    console.log('App listening on port ' + port);
});

require('dotenv').config();

console.log('config \r');
console.log(process.env.BOT_TOKEN);

var Discord = require('discord.js');
var bot = new Discord.Client();

// client.channels.get(channelID).send('My Message')
// ecriture du message
bot.on('message', function (message) {

    if (message.content === '!activeJobsBot') {
        if (!message.guild.channels.exists("name", "jobs")) {
            var server = message.guild;
            server.createChannel("jobs", "text");
        }

        _nodeCron2.default.schedule('0,30 * * * *', function () {
            getJobsOffers(["Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne"], ["CDI", "CDD%20%2F%20Temporaire"], { page: 1, hitsPerPage: 30 }, '', function (result) {
                console.log('running a task every 30 mins');
                if (result.length !== 0) {
                    bot.channels.find("name", "jobs").send(result.length + ' new jobs found ! \r\r');
                    result.forEach(function (job) {
                        bot.channels.find("name", "jobs").send(':computer: ' + job.entreprise + ' : ' + job.poste + ' \r:clock8: ' + job.ville + ' - ' + job.date + ' \r:link: ' + job.href + ' \r');
                    });
                } else {
                    bot.channels.find("name", "jobs").send('PAS DE NOUVEAUX JOBS');
                }
            });
        });
    }

    if (message.content === '!getJobs') {
        getJobsOffers(["Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne"], ["CDI", "CDD%20%2F%20Temporaire"], { page: 1, hitsPerPage: 30 }, '', function (result) {
            if (result.length !== 0) {
                message.channel.send(result.length + ' new jobs found ! \r\r');
                result.forEach(function (job) {
                    message.channel.send(':computer: ' + job.entreprise + ' : ' + job.poste + ' \r:clock8: ' + job.ville + ' - ' + job.date + ' \r:link: ' + job.href + ' \r');
                });
            } else {
                message.channel.send('PAS DE NOUVEAUX JOBS');
            }
        });
    }
});

bot.login(process.env.BOT_TOKEN);