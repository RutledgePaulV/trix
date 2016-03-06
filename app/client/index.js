var Runescape = require('../services/runescape');
var Handlebars = require('handlebars');
var path = require('path');
const fs = require('fs');

// allow reading handlebars as text
require.extensions['.hbs'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var items = require('../markup/templates/item-card.hbs');
var categories = require('../markup/templates/category-dropdown.hbs');
var Items = Handlebars.compile(items);
var Categories = Handlebars.compile(categories);

var alphabet = 'a b c d e f g h i j k l mn o p q r s t u v w x y z';

$(document).ready(function() {


    var service = new Runescape();

    var results = $('#results');
    var search = $('#item-search');
    var categorySelect = $('#categories');

    categorySelect.html(Categories({categories: service.getCategories()}));

    categorySelect.dropdown({
        action: 'activate',
        onChange: function(value) {
            var query = (!search.val()) ? alphabet.split(' ') : [search.val()];
            loadResults(query, value);
        }
    });

    var searchContainer = $('#search-container');

    search.keypress(function(e) {
        if(e.which == 13){
            var query = (!search.val()) ? alphabet.split(' ') : [search.val()];
            var selectedCategories = categorySelect.dropdown('get value');
            loadResults(query,  selectedCategories[selectedCategories.length - 1]);
        }
    });

    var loadResults = function(searchTerms, selectedCategories) {
        searchContainer.addClass('loading');
        results.empty();

        service.searchItems(selectedCategories, searchTerms, function(result) {
            searchContainer.removeClass('loading');
            results.append(Items(result));

            var buttons = $('.js-duplicate');

            buttons.unbind('click');

            buttons.click(function(e) {
                service.getItemDetail($(e.target).data('id'), function(data) {
                    console.log(data);
                })
            });
        });
        
    };

    categorySelect.dropdown('set selected', 30);
    loadResults(alphabet.split(' '), [30]);

});


