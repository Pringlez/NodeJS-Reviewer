/* Grab the 'home' page */
module.exports.homelist = function (req, res) {
  res.render('locations-list', {
    title: 'Reviewer - find a place near you!',
    pageHeader: {
      title: 'Reviewer',
      strapline: ' - Find and review places near you!'
    },
    locations: [{
            name: 'Starcups',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '100m'
        }, {
            name: 'Cafe Hero',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 4,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '200m'
        }, {
            name: 'Burger Queen',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 2,
            facilities: ['Food', 'Premium wifi'],
            distance: '250m'
        }]
  });
};

/* Grab the 'locations' page */
module.exports.locationInfo = function (req, res) {
  res.render('locations-info', { title: 'Location Info' });
};

/* Grab the 'Add review' page */
module.exports.addReview = function (req, res) {
  res.render('add-review', { title: 'Add Review' });
};