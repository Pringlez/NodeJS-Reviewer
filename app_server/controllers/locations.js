var request = require('request');
// The API connection address + port
var apiOptions = {
  server : "http://localhost:3000"
};

/** Checking if passed var is a number */
var _isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/** Formatting distance to a specific unit, km or miles */
var _formatDistance = function (distance) {
  var numDistance, unit;
  if (distance && _isNumeric(distance)) {
    if (distance > 1) {
      numDistance = parseFloat(distance).toFixed(1);
      unit = 'km';
    } else {
      numDistance = parseInt(distance * 1000,10);
      unit = 'm';
    }
    return numDistance + unit;
  } else {
    return "?";
  }
};

/** This function handles error messages */
var _showError = function (req, res, status) {
  var title, content;
  // Different error types available
  if (status === 404) {
    title = "404, No Page Here!";
    content = "No page exists here, Sorry";
  } else if (status === 500) {
    title = "500, Server Error!";
    content = "Opps, there was any error, Sorry";
  } else {
    title = status + ", Error";
    content = "Something went wrong, Sorry";
  }
  res.status(status);
  res.render('generic-text', {
    title : title,
    content : content
  });
};

/** This function renders the home page */
var renderHomepage = function(req, res, responseBody){
  // Render the 'location-list' view, passing title, pageHeader, sidebar, locations and message variables
  res.render('locations-list', {
    title: 'Reviewer - Find great places to eat & drink',
    pageHeader: {
      title: 'Reviewer',
      strapline: ' - Find great places to eat & drink'
    },
    sidebar: "Looking for wifi and a seat? Reviewer helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Reviewer help you find the place you're looking for.",
    locations: responseBody
  });
};

/** Gets the location data from a specific record */
var getLocationInfo = function (req, res, callback) {
  var requestOptions, path;
  path = "/api/locations/" + req.params.locationid;
  // Setting the request type + address
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  // Sending a location API request to server, anonymous function handles response
  request(
    requestOptions,
    function(err, response, body) {
      var data = body;
      if (response.statusCode === 200) {
        data.coords = {
          lng : body.coords[0],
          lat : body.coords[1]
        };
        callback(req, res, data);
      } else {
        _showError(req, res, response.statusCode);
      }
    }
  );
};

/** This function renders the details page for a specific record */
var renderDetailPage = function (req, res, locDetail) {
  // Render the 'location-info' view, passing title, pageHeader, sidebar and location variables
  res.render('location-info', {
    title: locDetail.name,
    pageHeader: {title: locDetail.name},
    sidebar: {
      context: 'is on Reviewer because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
    },
    location: locDetail
  });
};

/** This function renders the review form the user interacts with to add reviews */
var renderReviewForm = function (req, res, locDetail) {
  // Render the 'add-review' view, passing title, pageHeader and error variables
  res.render('add-review', {
    title: 'Review ' + locDetail.name + ' on Reviewer',
    pageHeader: { title: 'Review ' + locDetail.name },
    error: req.query.err,
    url: req.originalUrl
  });
};

/* Sending a GET request to render the 'home' page */
module.exports.homelist = function(req, res){
  renderHomepage(req, res);
};

/* Sending a GET request to render the location 'details' page */
module.exports.locationInfo = function(req, res){
  getLocationInfo(req, res, function(req, res, responseData) {
    renderDetailPage(req, res, responseData);
  });
};

/* Renders the 'Add review' page */
module.exports.addReview = function(req, res){
  getLocationInfo(req, res, function(req, res, responseData) {
    renderReviewForm(req, res, responseData);
  });
};

/* Sending a POST request to send data from the 'Add review' page */
module.exports.doAddReview = function(req, res){
  var requestOptions, path, locationid, postdata;
  locationid = req.params.locationid;
  path = "/api/locations/" + locationid + '/reviews';
  // Building the data in an object to be sent
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  // Building the request with the data and setting request type
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postdata
  };
  // If theres an error with the data then re-direct
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect('/location/' + locationid + '/reviews/new?err=val');
  } else {
    // Else, send the request to the API server, callback handles the response from the server
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/location/' + locationid);
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
          res.redirect('/location/' + locationid + '/reviews/new?err=val');
        } else {
          console.log(body);
          // If theres was an error display message
          _showError(req, res, response.statusCode);
        }
      }
    );
  }
};
