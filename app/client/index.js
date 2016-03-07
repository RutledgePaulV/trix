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
var detail = require('../markup/templates/item-modal.hbs');

var Items = Handlebars.compile(items);
var Categories = Handlebars.compile(categories);
var Detail = Handlebars.compile(detail);



$(document).ready(function() {

    var showDetailModal = function(data) {
        var item = data.item;
        item.members = item.members === 'true';
        var modal = $(Detail(item));
        $('body').append(modal);
        modal.modal('show');
    };


    var service = new Runescape();

    var results = $('#results');
    var search = $('#item-search');
    var categorySelect = $('#categories');

    categorySelect.html(Categories({categories: service.getCategories()}));

    categorySelect.dropdown({
        action: 'activate',
        onChange: function(value) {
            loadResults(search.val(), value);
        }
    });

    var searchContainer = $('#search-container');

    search.keypress(function(e) {
        if(e.which == 13){
            var selectedCategories = categorySelect.dropdown('get value');
            loadResults($(e.target).val(),  selectedCategories[selectedCategories.length - 1]);
        }
    });

    var loadResults = function(term, categories) {
        searchContainer.addClass('loading');
        results.empty();

        service.searchItems(categories, term, function(result) {
            searchContainer.removeClass('loading');
            results.append(Items(result));

            var buttons = $('.js-duplicate');

            buttons.unbind('click');

            buttons.click(function(e) {
                service.getItemDetail($(e.target).data('id'), function(data) {
                    showDetailModal(data);
                })
            });
        });
        
    };

    categorySelect.dropdown('set selected', 30);
    loadResults('', [30]);

});


