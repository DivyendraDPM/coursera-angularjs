(function () {
    'use strict';

    angular.module('NarrowItDownApp', [])
        .controller('NarrowItDownController', NarrowItDownController)
        .service('MenuSearchService', MenuSearchService)
        .constant('ApiBasePath', "https://davids-restaurant.herokuapp.com")
        .directive('foundItems', FoundItemsDirective);


function FoundItemsDirective() {
    var ddo = {
        templateUrl: 'foundItems.html',
        Restrict: 'E',
        scope: {
            items: '<',     // attribute name for found-items directive, referenced as items in index.html and set to =narrowItDown.found, ref'd as items in foundItems.html  
            onRemove: '&',  // attribute name for found-items directive, referenced as on-remove in index.html and set to =narrowItDown.removeItem(index), ref'd as onRemove({index: $index}) in foundItems.html  
            isValid: '<'   // attribute name for found-items directive, referenced as is-valid in index.html and set to =narrowItDown.valid, ref'd as isValid in foundItems.html  
        }
    }; 
    return ddo;
}


NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController (MenuSearchService) {
    var menuSearch = this;

    menuSearch.valid = true;
    menuSearch.searchTerm = "";
    menuSearch.found = [];

    menuSearch.search = function() {

        if (searchIsEmpty(menuSearch.searchTerm))
        {
            menuSearch.found = [];
            menuSearch.valid = false;
            return;
        };

        var searchForItems = MenuSearchService.getMatchedMenuItems(menuSearch.searchTerm);

        searchForItems.then( function (result) {
            menuSearch.found = result;
            menuSearch.valid = (result.length > 0);
        })
        .catch(function(error) {
            console.log("MenuSearchService.getMatchedMenuItems returned an error");
        });
    };

    menuSearch.removeItem = function (index) {
        menuSearch.found.splice(index, 1);
    };


    function searchIsEmpty (searchString)
    {
        return searchString.replace(/\s/g,"").length === 0;
    };
}

MenuSearchService.$inject = ['$http', 'ApiBasePath']
function MenuSearchService ($http, ApiBasePath) {
    var service = this;

    service.getMatchedMenuItems = function (searchTerm) {

        return $http({
            method: "GET",
            url: (ApiBasePath + "/menu_items.json")
        }).then(function (response) {

            var allMenuItems = response.data.menu_items;

            return allMenuItems.filter( function (item) {
                return item.name.toLowerCase().includes(searchTerm.toLowerCase());
            });

        })
        .catch(function(error) {
            console.log("GET menu_items.json returned an error");
        });

    };

}

})();