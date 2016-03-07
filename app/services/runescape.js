'use strict';

var Client = require('node-rest-client').Client;
var alphabet = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ');
var cache = window.sessionStorage;

class RunescapeService {

    constructor() {

        this.headers = {'Accept': 'application/json'};
        this.client = new Client();

        this.categories = [
            'Miscellaneous',
            'Ammo',
            'Arrows',
            'Bolts',
            'Construction materials',
            'Construction projects',
            'Cooking ingredients',
            'Costumes',
            'Crafting materials',
            'Familiars',
             'Farming produce',
             'Fletching materials',
             'Food and drink',
             'Herblore materials',
             'Hunting equipment',
             'Hunting produce',
             'Jewellery',
             'Mage armour',
             'Mage weapons',
             'Melee armour - low level',
             'Melee armour - mid level',
             'Melee armour - high level',
             'Melee weapons - low level',
             'Melee weapons - mid level',
             'Melee weapons - high level',
             'Mining and smithing',
             'Potions',
             'Prayer armour',
             'Prayer materials',
             'Range armour',
             'Range weapons',
             'Runecrafting',
             'Runes, Spells and Teleports',
             'Seeds',
             'Summoning scrolls',
             'Tools and containers',
             'Woodcutting product',
             'Pocket items'
        ];

        this.client.registerMethod('getCategoryDetail', "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json", "GET");
        this.client.registerMethod("searchItems", "http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json", "GET");
        this.client.registerMethod("getItemDetail", "http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json", "GET");
    }

    getCategories() {
        return this.categories;
    }

    getCategoryDetail(categoryId, callback) {
        var parameters = {category: categoryId};

        this.cachedCall(parameters, this.client.methods.getCategoryDetail, function(data) {
            var count = 0;

            if(data.hasOwnProperty('alpha')) {
                for(var key in data['alpha']) {
                    if('items' in data['alpha'][key]) {
                        count += data['alpha'][key].items;
                    }
                }
            }

            callback(count);
        });
    }


    getItemDetail(itemId, callback) {
        var params = {item: itemId};
        this.cachedCall(params, this.client.methods.getItemDetail, callback);
    }

    searchItems(categories, term, callback) {

        var that = this;

        var terms = [];

        if(term === '') {
            terms = alphabet;
        } else {
            terms.push(term);
        }

        if(categories === '' || categories === null || categories === undefined || categories.length === 0) {
            categories = [];
            for(var i = 0; i < this.getCategories().length; i++) {
                categories.push(i);
            }
        }

        terms.forEach(function(term) {
            categories.forEach(function(categoryId) {
                var parameters = {category: categoryId.toString(), alpha: term.toString(), page: 1};

                if(term === '' || !term) {
                    callback({});
                }

                that.cachedCall(parameters, that.client.methods.searchItems, callback);
            });
        });

    }


    cachedCall(parameters, method, callback) {
        var args = { parameters: parameters, headers: this.headers };
        var key = JSON.stringify(parameters);

        if(cache.getItem(key)) {
            return callback(JSON.parse(cache.getItem(key)));
        } else {
            return method(args, function(data) {
                if(data.length) {
                    cache.setItem(key, JSON.stringify(JSON.parse(data)));
                    callback(JSON.parse(cache.getItem(key)));
                } else {
                    callback({});
                }
            });
        }
    }

}




module.exports = RunescapeService;