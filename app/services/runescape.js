'use strict';

var Client = require('node-rest-client').Client;

class RunescapeService {

    constructor() {

        this.cache = {};
        this.headers = {'Accept': 'application/json'};
        this.client = new Client();

        this.categories = {
            0: 'Miscellaneous',
            1: 'Ammo',
            2: 'Arrows',
            3: 'Bolts',
            4: 'Construction materials',
            5: 'Construction projects',
            6: 'Cooking ingredients',
            7: 'Costumes',
            8: 'Crafting materials',
            9: 'Familiars',
            10: 'Farming produce',
            11: 'Fletching materials',
            12: 'Food and drink',
            13: 'Herblore materials',
            14: 'Hunting equipment',
            15: 'Hunting produce',
            16: 'Jewellery',
            17: 'Mage armour',
            18: 'Mage weapons',
            19: 'Melee armour - low level',
            20: 'Melee armour - mid level',
            21: 'Melee armour - high level',
            22: 'Melee weapons - low level',
            23: 'Melee weapons - mid level',
            24: 'Melee weapons - high level',
            25: 'Mining and smithing',
            26: 'Potions',
            27: 'Prayer armour',
            28: 'Prayer materials',
            29: 'Range armour',
            30: 'Range weapons',
            31: 'Runecrafting',
            32: 'Runes, Spells and Teleports',
            33: 'Seeds',
            34: 'Summoning scrolls',
            35: 'Tools and containers',
            36: 'Woodcutting product',
            37: 'Pocket items'
        };

        this.client.registerMethod('getCategoryDetail', "http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json", "GET");
        this.client.registerMethod("searchItems", "http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json", "GET");
        this.client.registerMethod("getItemDetail", "http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json", "GET");
    }

    getCategories() {
        return this.categories;
    }

    getCategoryDetail(categoryId, callback) {
        var parameters = {category: categoryId};

        this.cachedCall(parameters, this.client.methods.getCategoryInformation, function(data) {
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

    searchItems(categories, terms, callback) {

        var that = this;

        terms.forEach(function(term) {
            categories.forEach(function(categoryId) {
                var parameters = {category: categoryId, alpha: term, page: 1};

                if(term === '' || !term) {
                    callback({});
                }

                that.cachedCall(parameters, that.client.methods.searchItems, callback);
            });
        });

    }


    cachedCall(parameters, method, callback) {
        var args = { parameters: parameters, headers: this.headers };
        var key = JSON.stringify({args: args, method: method});

        if(key in this.cache) {
            return callback(this.cache[key]);
        } else {
            var that = this;
            return method(args, function(data) {
                that.cache[key] = JSON.parse(data);
                callback(that.cache[key]);
            });
        }
    }

}




module.exports = RunescapeService;