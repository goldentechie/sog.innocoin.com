(function() {
  'use strict';

  angular
    .module('frontend')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $http, $q, $cookies, $timeout, $state, $stateParams, $location, uiGridConstants, lodash) {

    var vm = this;
    var _ = $scope._ = lodash;

    $scope.base = "https://sog.innocoin.com";
    $scope.api_full = $scope.base + '/api';
    $scope.api_rep = $scope.base + '/api/wallet';
    $scope.images_full = $scope.api_full + '/cards/';
    $scope.api_fetch = _.clone($scope.api_full);

    $scope.gridOptions = {};
    $scope.totalCards = 0;
    $scope.yourCards = 0;
    $scope.yourCompleteDecks = 0;
    $scope.wallet = $cookies.get('wallet') || null;
    $scope.ready = false;
    $scope.table = false;
    $scope.grid = false;
    $scope.text = false;
    $scope.cards_text = '';
    $scope.isSelection = false;
    $scope.basket = '';
    $scope.cards_count = 0;
    $scope.exclude = false;
    $scope.cards = [];


    $scope.clearCookie = function() {
      $scope.wallet = null;
      $cookies.remove('wallet');
      $stateParams.walletAddress = null;
    };

    $scope.changeView = function(view) {

      $scope.table = false;
      $scope.grid = false;
      $scope.text = false;
      $scope['view'] = view;
      $scope[view] = true;

      $scope.applyFilter();

    };


    $scope.applyFilter = function() {


      if($scope.view == 'text') {

        $scope.buildTextView($scope.cards);

      } else if ($scope.view == 'table') {

        $scope.adaptTableView();

      } else if ($scope.view == 'grid') {
        // automatic
      }

    };

    $scope.buildBasket = function(selection) {

      $scope.ready = false;

      var selection = _.sortBy(selection,'assetName');

      $scope.cards_count = selection.length;

      if(selection.length) {
        $scope.basket = '';

        for (var i in selection) {

            $scope.basket += selection[i].assetName + '\t x' + selection[i].quantity + '\n';

        }
      }

      $scope.ready = true;
    };


    $scope.buildTextView = function(cards) {
      $scope.ready = false;

      $scope.cards_text = "";

      for (var i in cards) {

        if (!$scope.exclude || ($scope.exclude && (cards[i].quantity > 0 && cards[i].quantity != null))) {
          $scope.cards_text += cards[i].assetName + '\t x' + cards[i].quantity + '\n';
        }
      }
      $scope.ready = true;
    };

    $scope.adaptTableView = function() {

        $scope.gridOptions.data = $scope.cards;
        var newCollection = [];

        for (var i in $scope.gridOptions.data) {

          if (!$scope.exclude || ($scope.exclude && ($scope.gridOptions.data[i].quantity > 0 && $scope.gridOptions.data[i].quantity != null))) {
            newCollection[i] = $scope.gridOptions.data[i];
          }
        }

        $scope.gridOptions.data = newCollection;

    };


    $scope.selection = function() {
      var selection = $scope.gridApi.selection.getSelectedRows();
      $scope.isSelection = selection.length ? true : false;
      $scope.buildBasket(selection);
    };

    $scope.update = function(address) {
      $scope.ready = false;
      $scope.cards_text = '';

      var address = address || $stateParams.walletAddress || $scope.wallet;

      if(address) {
         $scope.wallet = address;
         $scope.api_fetch = _.clone($scope.api_rep).replace('wallet', $scope.wallet);
         $cookies.put('wallet',address);
      } else {
        $scope.api_fetch = _.clone($scope.api_full);
      }

      var cards = $http({method: 'GET', url: $scope.api_fetch});

      $q.all([cards]).then(function (res) {

        $scope.cards = _.sortBy(res[0].data.cards, 'assetName');

        $scope.buildTextView($scope.cards);

        $scope.totalCards = $scope.cards.length;

        if(address) {
          $scope.yourCards = _.sum(_.map($scope.cards, 'quantity'));
          $scope.yourCompleteDecks = _.min(_.map($scope.cards, 'quantity'));
        }

        $scope.gridOptions = {
          enableRowSelection: true,
          multiSelect: true,
          enableFiltering: true,
          enableSorting: true,
          showColumnFooter: true,
          enableGridMenu: true,
          exporterCsvFilename: 'sog.csv',
          exporterPdfOrientation: 'landscape',
          exporterPdfPageSize: 'LETTER',
          exporterPdfMaxGridWidth: 500,

          onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
              $scope.selection();
            });

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
              $scope.selection();

            });

          },
          columnDefs: [

            {
              field: 'moongaId',
              displayName: 'Card',
              width: '100',
              enableFiltering: false,
              cellClass: 'moongaid',
              cellTemplate: '<img width="25px" ng-src="' + $scope.images_full + '{{COL_FIELD}}.jpg" ng-style="pic" ng-mouseenter="pic={ \'width\' : \'320px\', \'height\' : \'447px\', \'z-index\' : 10000, \'position\' : \'absolute\'}" ng-mouseleave="pic={}" " />'
            },
            {
              field: 'assetName',
              displayName: 'Card Code',
              sort: {direction: uiGridConstants.ASC, priority: 0}
            },
            {field: 'name', displayName: 'Card Name'},
            {field: 'rarity', displayName: 'Rarity'},
            {field: 'element', displayName: 'Element'},
            {field: 'evolutionRank', displayName: 'Evolution Rank'}

          ],
          data: $scope.cards
        };

        if ($scope.wallet) {
          $scope.gridOptions.columnDefs.push({
            name: 'quantity',
            aggregationType: uiGridConstants.aggregationTypes.sum,
            displayName: 'Number of Cards',
            cellName : 'quantity'
          });
        }

        $scope.gridOptions.data = _.sortBy($scope.gridOptions.data,'assetName');

       }).finally(function() {

        $timeout(function() {
          $scope.ready = true;
          $scope.api_fetch = _.clone($scope.api_full);

          $scope.text = false;
          $scope.grid = false;

          $scope.table = true;

          $scope.view = 'table';

          $scope.$apply();
        },0);
      });
    };

    $timeout(function() {
      $scope.update();


    },0);



  }
})();
