/* Grab the 'home' page */
module.exports.homelist = function (req, res) {
  res.render('locations-list', { title: 'Home' });
};

/* Grab the 'locations' page */
module.exports.locationInfo = function (req, res) {
  res.render('locations-info', { title: 'Location Info' });
};

/* Grab the 'Add review' page */
module.exports.addReview = function (req, res) {
  res.render('add-review', { title: 'Add Review' });
};