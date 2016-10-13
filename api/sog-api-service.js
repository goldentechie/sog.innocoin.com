var express = require('express');
var app = express();
var balance = require('quantum-crypto');
var request = require('request');
var fs = require('fs');
var api = "https://spellsofgenesis.com/api/v7/?action=get_all_cards&client_version=0.807&store_status=1";


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


var cards = [];

setInterval(function () {

    request(api, function (error, response, body) {
        base = JSON.parse(body).cards;

        for (var z in base) {
            if (base[z].hasOwnProperty('assetName')) {
                cards.push(base[z]);

                var filename = base[z].moongaId + '.jpg';
                var savename = base[z].assetName.toLowerCase() + '.jpg';

                var uri = 'http://api.moonga.com/RCT/cp/cards/view/normal/large/en/' + filename;

                var download = function (uri, filename, callback) {
                    request.head(uri, function (err, res, body) {
                        /*       console.log('content-type:', res.headers['content-type']);
                         console.log('content-length:', res.headers['content-length']);*/

                        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                    });
                };

                if (!fileExists('images/' + savename)) {
                    download(uri, 'images/' + savename, function () {
                       /* console.log('done');*/
                    });
                }


            }
        }

    });

}, 4000000);