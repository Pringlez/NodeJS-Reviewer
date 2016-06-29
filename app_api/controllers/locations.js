var mongoose = require('mongoose');
var reviewer = mongoose.model('Location');

/** Send result back to user */
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/** Calculate earth distances */
var theEarth = (function() {
  var earthRadius = 6371;

  var getDistanceFromRads = function(rads) {
    return parseFloat(rads * earthRadius);
  };

  var getRadsFromDistance = function(distance) {
    return parseFloat(distance / earthRadius);
  };

  return {
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance
  };
})();

/* List of locations */
module.exports.locationsListByDistance = function(req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  var maxDistance = parseFloat(req.query.maxDistance);
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  var geoOptions = {
    spherical: true,
    maxDistance: theEarth.getRadsFromDistance(maxDistance),
    num: 10
  };
  // If any data is missing, display error
  if (!lng || !lat || !maxDistance) {
    console.log('locationsListByDistance missing variables!');
    sendJSONresponse(res, 404, {
      "message": "The variables lng, lat and maxDistance are all required for the query!"
    });
    return;
  }
  // Call geoNear to calculate the position of the user, send results back to build the list of locations
  reviewer.geoNear(point, geoOptions, function(err, results, stats) {
    var locations;
    console.log('Geo Results', results);
    console.log('Geo Stats', stats);
    // If theres an error then output to console
    if (err) {
      console.log('geoNear error:', err);
      sendJSONresponse(res, 404, err);
    } else {
      locations = buildLocationList(req, res, results, stats);
      sendJSONresponse(res, 200, locations);
    }
  });
};

/** Builds and returns a list of locations */
var buildLocationList = function(req, res, results, stats) {
  var locations = [];
  // Building the list of locations from the 'results' variable
  results.forEach(function(doc) {
    locations.push({
      distance: theEarth.getDistanceFromRads(doc.dis),
      name: doc.obj.name,
      address: doc.obj.address,
      rating: doc.obj.rating,
      facilities: doc.obj.facilities,
      _id: doc.obj._id
    });
  });
  return locations;
};

/* Returns one location by the id */
module.exports.locationsReadOne = function(req, res) {
  console.log('Finding location...', req.params);
  if (req.params && req.params.locationid) {
    // Find a specific record by id
    reviewer
      .findById(req.params.locationid)
      .exec(function(err, location) {
        // If not found or theres an error then output message
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "Location ID not found!"
          });
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        // If there was no error then return location
        console.log(location);
        sendJSONresponse(res, 200, location);
      });
  } else {
    console.log('No location ID specified!');
    // Else no record with that ID exists
    sendJSONresponse(res, 404, {
      "message": "No location ID in request!"
    });
  }
};

/* Add a new location */
/* Route - /api/locations */
module.exports.locationsCreate = function(req, res) {
  console.log(req.body);
  // Creating a new location document / object
  // Using variables passed in the request
  reviewer.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) {
    // Output error message if problem found
    if (err) {
      console.log(err);
      sendJSONresponse(res, 400, err);
    } else {
      // If no error is found, output result back to console & user
      console.log(location);
      sendJSONresponse(res, 201, location);
    }
  });
};

/* Update a location */
/* Route - /api/locations/:locationid */
module.exports.locationsUpdateOne = function(req, res) {
  if (!req.params.locationid) {
    sendJSONresponse(res, 404, {
      "message": "Location ID not found, it is required!"
    });
    return;
  }
  // Updating a request document / object using the 'locationid' variable
  reviewer
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec(
      function(err, location) {
        // Handle the response from the server
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "Location ID not found!"
          });
          return;
        } else if (err) {
          // If theres an error then display message
          sendJSONresponse(res, 400, err);
          return;
        }
        // Updating the variables with new data passed in the request
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        // Saving the location record to API database, display errors if found
        location.save(function(err, location) {
          if (err) {
            sendJSONresponse(res, 404, err);
          } else {
            sendJSONresponse(res, 200, location);
          }
        });
      }
  );
};

/* Delete a location */
/* Route - /api/locations/:locationid */
module.exports.locationsDeleteOne = function(req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    // Deleting a record from the database using the 'locationid' variable
    reviewer
      .findByIdAndRemove(locationid)
      .exec(
        function(err, location) {
          // If theres an error then display message
          if (err) {
            console.log(err);
            sendJSONresponse(res, 404, err);
            return;
          }
          console.log("Location ID " + locationid + " was deleted!");
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    // Else there was no record
    sendJSONresponse(res, 404, {
      "message": "No locationid found!"
    });
  }
};
