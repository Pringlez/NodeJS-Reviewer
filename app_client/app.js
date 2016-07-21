(function () {

angular.module('reviewerApp', []);

function config ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'home/home.view.html',
        controller: 'homeCtrl',
        controllerAs: 'vm'
      })
      .otherwise({redirectTo: '/'});
  }

  angular
    .module('reviewerApp')
    .config(['$routeProvider', config]);

 })();   
