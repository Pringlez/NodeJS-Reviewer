(function() {

  angular
    .module('reviewerApp')
    .service('reviewerData', reviewerData);

  reviewerData.$inject = ['$http'];
  function reviewerData ($http) {
    var locationByCoords = function (lat, lng) {
      return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=20000');
    };
    return {
      locationByCoords : locationByCoords
    };
  }

})();
