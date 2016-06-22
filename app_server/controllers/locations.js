var request = require('request');
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
  var message;
  // If the body is not an instance of an Array, theres an issue with the API
  if (!(responseBody instanceof Array)) {
    message = "API Lookup Error!";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No Places Found!";
    }
  }
  res.render('locations-list', {
    title: 'Reviewer - Find great places to eat & drink',
    pageHeader: {
      title: 'Reviewer',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Reviewer helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Reviewer help you find the place you're looking for.",
    locations: responseBody,
    message: message
  });
};

/** Gets the location data from a specific record */
var getLocationInfo = function (req, res, callback) {
  var requestOptions, path;
  path = "/api/locations/" + req.params.locationid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
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
  res.render('location-review-form', {
    title: 'Review ' + locDetail.name + ' on Reviewer',
    pageHeader: { title: 'Review ' + locDetail.name },
    error: req.query.err
  });
};

/* Sending a GET request to render the 'home' page */
module.exports.homelist = function(req, res){
  var requestOptions, path;
  path = '/api/locations';
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {
      lng : -0.7992599,
      lat : 51.378091,
      maxDistance : 20
    }
  };
  request(
    requestOptions,
    function(err, response, body) {
      var i, data;
      data = body;
      if (response.statusCode === 200 && data.length) {
        for (i=0; i<data.length; i++) {
          data[i].distance = _formatDistance(data[i].distance);
        }
      }
      renderHomepage(req, res, data);
    }
  );
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
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect('/location/' + locationid + '/reviews/new?err=val');
  } else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/location/' + locationid);
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
          res.redirect('/location/' + locationid + '/reviews/new?err=val');
        } else {
          console.log(body);
          _showError(req, res, response.statusCode);
        }
      }
    );
  }
};
