'use strict';

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;
const tg = new Telegram.Telegram('252576423:AAH3XCqItcmZlVwKmo1fhbcLB3a4DVgFUTs');

const request = require('request');
const _ = require('lodash');


class CardController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
    sogHandler($) {

        var card = $.query.card.toLowerCase();
        var url = 'https://sog.innocoin.com/api/cards/' + card + '.jpg';
        var api = 'https://sog.innocoin.com/api/';

        $.sendMessage(card.toUpperCase());

        request(api, function(error, response, body) {

           var data = JSON.parse(body).cards;

           var card_data = _.filter(data, { assetName : card.toUpperCase() });

           var base = card_data[0];

           $.sendMessage('\nElement : '+base.element + '\nAttack : '+base.levels[0].attack + '\nHealth : '+base.levels[0].health + '\nSpeed : '+base.levels[0].speed);

            $.sendPhoto({ url: url, filename: card + '.jpg'});


        });


        /*$.sendMessage("SOG bot by Innocoin.com");*/
    }


    get routes() {
        return {
            '/show :card' : 'sogHandler'
        }
    }
}

class CollectionController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */

    collectionHandler($) {

        var address = $.query.address || '';

        var url = 'https://sog.innocoin.com/telegram/' + address;

        request(url, function(error, response, body) {

            var cards = JSON.parse(body).cards;


            if(address) {
                var text = "";
                var total = 0;

                for (var i in cards) {
                    text += cards[i].assetName + ' \t x' + cards[i].quantity + '\n';
                    total += cards[i].quantity;
                }

                if (cards.length) {
                    $.sendMessage("This address owns a total of " + total + " Spell of Genesis cards:\n\n" + text + "\n" + address + "\nSOG bot by Innocoin.com");
                } else {
                    $.sendMessage("Address owns 0 cards or not recognized");
                }
            }
        });
    }

    listHandler($) {

        var url = 'https://sog.innocoin.com/telegram/';

        request(url, function(error, response, body) {

            var cards = JSON.parse(body).cards;

            var count = 0;
            var text = "";


            for (var i in cards) {
                text += cards[i].assetName + '\n';
                count += 1;
            }

            $.sendMessage("Currently there are " + count + " Spell of Genesis cards. This is the list of cards: \n\n" + text + "\n" +
                "SOG powertool: sog.innocoin.com");

        });

    }


    get routes() {
        return {
            '/collection :address' : 'collectionHandler',
            '/list' : 'listHandler'
        }
    }
}


class HelpController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
    helpHandler($) {
        $.sendMessage(
            'SOG bot 0.1 - brought to you by Innocoin.com \n\n' +
            '/list - show all Spell of Genesis cards \n' +
            '/collection :counterparty address - show the number of cards in a specific collection (by address) \n' +
            '/show :card name - shows an image card of choice\n\n' +
            'Power tool for managing collections: sog.innocoin.com\n\n' +
            'More features to come ...\n\n' +
            'Bot programming by @cr-mn, contact for question, support or features');
    }

    get routes() {
        return {
            '/help' : 'helpHandler'
        }
    }
}


tg.router
    .when(['/show :card'], new CardController())
    .when(['/collection :address','/list'], new CollectionController())
    .when(['/help'], new HelpController())



