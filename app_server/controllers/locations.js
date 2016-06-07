/* Grab the 'home' page */
module.exports.homelist = function (req, res) {
  res.render('index', { title: 'Home' });
};

/* Grab the 'locations' page */
module.exports.locationInfo = function (req, res) {
  res.render('index', { title: 'Location Info' });
};

/* Grab the 'Add review' page */
module.exports.addReview = function (req, res) {
  res.render('index', { title: 'Add Review' });
};