var express = require('express');
var app = express();
var balance = require('quantum-crypto');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var api = "https://spellsofgenesis.com/api/v7/?action=get_all_cards&client_version=0.807&store_status=1";
var burn = "https://counterpartychain.io/api/balances/1BURNSogXXXXXXXXXXXXXXXXXXXXW3ny2Y";

/*
var privateKey = fs.readFileSync( '/etc/letsencrypt/live/sog.innocoin.com/privkey.pem' );
var certificate = fs.readFileSync( '/etc/letsencrypt/live/sog.innocoin.com/fullchain.pem' );
*/


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api/images', express.static('images'));

app.get('/api/:counterpartyAddress?', function(req, res) {

    var cards = [];
    var balances = null;
    var address = req.params.counterpartyAddress;

    request(api, function(error, response, body) {
        base = JSON.parse(body).cards;

        for(var z in base) {
            if(base[z].hasOwnProperty('assetName')) {
                cards.push(base[z]);

            }
        }

        if(address) {

            balance(address, function(error, balances) {

                for(var i in cards) {
                    cards[i].quantity = 0;
                    cards[i].quan = cards[i].assetName + '\t x0';

                    for(var x in balances) {

                        if(cards[i].assetName === balances[x].asset) {
                            cards[i].quantity = parseInt(balances[x].quantity,0);
                            cards[i].quan = cards[i].assetName + '\t x' + cards[i].quantity;
                        }
                    }
                }

                return res.json({
                        address: req.params.counterpartyAddress,
                        cards : _.sortBy(cards, 'assetName')
                    });


            });

        } else {

            for(var i in cards) {
                cards[i].quantity = 0;
                cards[i].quan = cards[i].assetName + '\t x0';
            }

            return res.json({
                address: null,
                cards : cards
            });
        }


    });

});

app.get('/telegram/:counterpartyAddress?', function(req, res) {

    var cards = [];
    var newCards = [];

    var balances = null;
    var address = req.params.counterpartyAddress;

    request(api, function(error, response, body) {
        base = JSON.parse(body).cards;

        for(var z in base) {
            if(base[z].hasOwnProperty('assetName')) {
                cards.push(base[z]);
            }
        }

        if(address) {

            balance(address, function(error, balances) {

                for(var i in cards) {

                    for(var x in balances) {

                        if(cards[i].assetName === balances[x].asset) {

                            if(parseInt(balances[x].quantity,0) != 0) {
                                newCards.push({
                                    assetName: cards[i].assetName,
                                    quantity: parseInt(balances[x].quantity, 0)
                                });
                            }
                        }
                    }
                }
                return res.json({
                    address: req.params.counterpartyAddress,
                    cards : _.sortBy(newCards, 'assetName')
                });



            });

        } else {
            for(var i in cards) {

                newCards.push({
                    assetName: cards[i].assetName
                });
            }

            return res.json({
                address: null,
                cards : _.sortBy(newCards, 'assetName')
            });

        }


    });

});

app.listen(8080, function () {
    console.log('App listening on port 8080!');
});