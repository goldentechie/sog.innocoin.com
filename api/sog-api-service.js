let express = require('express');
let app = express();
let balance = require('quantum-crypto');
let request = require('request');
let fs = require('fs');
let _ = require('lodash');


const sogapi = "https://spellsofgenesis.com/api/v7/?action=get_all_cards&client_version=0.807&store_status=1";
const pepeapi = "http://rarepepedirectory.com/json/pepelist.json";

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}


let cards = [];
let pepes = [];

setInterval(function () {

    request(sogapi, function (error, response, body) {
        base = JSON.parse(body).cards;

        for (var z in base) {
            if (base[z].hasOwnProperty('assetName')) {
                cards.push(base[z]);

                let filename = base[z].moongaId + '.jpg';
                let savename = base[z].assetName.toLowerCase() + '.jpg';

                let uri = 'http://api.moonga.com/RCT/cp/cards/view/normal/large/en/' + filename;

                let download = function (uri, filename, callback) {
                    request.head(uri, function (err, res, body) {
                        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                    });
                };

                if (!fileExists('images/sog/' + savename)) {
                    download(uri, 'images/sog/' + savename, function () {
                       /* console.log('done');*/
                    });
                }
            }
        }
    });


    request(pepeapi, function (error, response, body) {
        base = JSON.parse(body);

        pepes = _.values(base);

        for (let z in base) {

            let savenames = [], uri, download;

                savenames.push(z.toLowerCase() + base[z].slice(-4));

                uri = base[z];

                download = function (uri, filename, callback) {
                    request.head(uri, function (err, res, body) {
                        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                    });
                };

                for(let i=0; i < savenames.length; i++ ) {
                    if (!fileExists('images/pepes/' + savenames[i])) {
                        download(uri, 'images/pepes/' + savenames[i], function () {
                            /* console.log('done');*/
                        });
                    }
                }
       }

    });

}, 5000);