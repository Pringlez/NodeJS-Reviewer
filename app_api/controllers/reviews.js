var mongoose = require('mongoose');
var locationMod = mongoose.model('Location');
var userMod = mongoose.model('User');

/** Send result back to user */
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/** Adding a new review, providing a locationid */
/** Route - /api/locations/:locationid/reviews */
module.exports.reviewsCreate = function(req, res) {
  getAuthor(req, res, function (req, res, userName) {
    if (req.params.locationid) {
      // Creating a new review document / object by locating record by 'locationid' variable
      locationMod
        .findById(req.params.locationid)
        .select('reviews')
        .exec(
          function(err, location) {
            // If theres an error display message
            if (err) {
              sendJSONresponse(res, 400, err);
            } else {
              // Pass the location to be updated with the new review
              doAddReview(req, res, location);
            }
          }
      );
    } else {
      // Else location ID not found, return error message
      sendJSONresponse(res, 404, {
        "message": "Not found, location ID required!"
      });
    }
  });
};

/** Checking if the email sent is registered */
var getAuthor = function(req, res, callback) {
  console.log("Finding author with email " + req.payload.email);
  if (req.payload.email) {
    userMod
      .findOne({ email : req.payload.email })
      .exec(function(err, user) {
        if (!user) {
          sendJSONresponse(res, 404, {
            "message": "User not found"
          });
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        console.log(user);
        callback(req, res, user.name);
      });

  } else {
    sendJSONresponse(res, 404, {
      "message": "User not found"
    });
    return;
  }
};

var doAddReview = function(req, res, location, author) {
  // If the location is not null then continue
  if (!location) {
    sendJSONresponse(res, 404, "Location ID not found!");
  } else {
    // Add / push the new review to the location document / object
    location.reviews.push({
      // The request variable contains the author, rating & review text
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    // Commit / save the changes made to the document
    location.save(function(err, location) {
      var thisReview;
      // If there was an error then display message
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        // Else update average rating & display review response
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};

// This function updates the location's average rating
var updateAverageRating = function(locationid) {
  console.log("Update average rating for record", locationid);
  // Find location by 'locationid'
  locationMod
    .findById(locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        // If no errors found then update
        if (!err) {
          doSetAverageRating(location);
        }
      });
};

// The function calculate the average rating
var doSetAverageRating = function(location) {
  var i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    // Save the rating to the document
    location.save(function(err) {
      // Output to console if theres an error
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

// This function allows the user to update a review
module.exports.reviewsUpdateOne = function(req, res) {
  // If no location or review record was found then output error message
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, location ID and review ID are both required!"
    });
    return;
  }
  // Find the location by 'locationid' record
  locationMod
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        var thisReview;
        // If the location is null return error message
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "Location ID not found!"
          });
          return;
        } else if (err) {
          // Else if error found, return message
          sendJSONresponse(res, 400, err);
          return;
        }
        // If the location has any reviews then continue
        if (location.reviews && location.reviews.length > 0) {
          thisReview = location.reviews.id(req.params.reviewid);
          // Checking if the review is null
          if (!thisReview) {
            sendJSONresponse(res, 404, {
              "message": "Review ID not found!"
            });
          } else {
            // Updating the review data
            thisReview.author = req.body.author;
            thisReview.rating = req.body.rating;
            thisReview.reviewText = req.body.reviewText;
            // Saving the new data to the database
            location.save(function(err, location) {
              // If theres an error display message
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                // Update average rating, send response back with review
                updateAverageRating(location._id);
                sendJSONresponse(res, 200, thisReview);
              }
            });
          }
        } else {
          // Else return error message
          sendJSONresponse(res, 404, {
            "message": "No review to update!"
          });
        }
      }
  );
};

// This function returns one specific review record by 'locationid' variable
module.exports.reviewsReadOne = function(req, res) {
  // If the 'locationid' or 'reviewid' variables in the request are null, then display error
  if (req.params && req.params.locationid && req.params.reviewid) {
    // Find a review by 'locationid' variable
    locationMod
      .findById(req.params.locationid)
      .select('name reviews')
      .exec(
        function(err, location) {
          console.log(location);
          var response, review;
          // If the location is null, display error message
          if (!location) {
            sendJSONresponse(res, 404, {
              "message": "Location ID not found!"
            });
            return;
          } else if (err) {
            // Else if error found, return message
            sendJSONresponse(res, 400, err);
            return;
          }
          // If the location has any reviews then continue 
          if (location.reviews && location.reviews.length > 0) {
            review = location.reviews.id(req.params.reviewid);
            // Checking if the review is null
            if (!review) {
              sendJSONresponse(res, 404, {
                "message": "Review ID not found!"
              });
            } else {
              // Building the response & returning the review
              response = {
                location: {
                  name: location.name,
                  id: req.params.locationid
                },
                review: review
              };
              sendJSONresponse(res, 200, response);
            }
          } else {
            // Else return error message
            sendJSONresponse(res, 404, {
              "message": "No reviews found!"
            });
          }
        }
    );
  } else {
    // Else return error message
    sendJSONresponse(res, 404, {
      "message": "Not found, location ID and review ID are both required!"
    });
  }
};

// Delete a review
// Route - /api/locations/:locationid/reviews/:reviewid
module.exports.reviewsDeleteOne = function(req, res) {
  // If the 'locationid' or 'reviewid' variables in the request are null, then display error
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, location ID and review ID are both required!"
    });
    return;
  }
  // Deleting a review by first finding the location document by the 'locationid' variable
  locationMod
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        // If the location is not null then continue
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "Location ID not found!"
          });
          return;
        } else if (err) {
          // Else if error found, return message
          sendJSONresponse(res, 400, err);
          return;
        }
        // If the location has any reviews then continue
        if (location.reviews && location.reviews.length > 0) {
          // Return an error message if the specific review is not found
          if (!location.reviews.id(req.params.reviewid)) {
            sendJSONresponse(res, 404, {
              "message": "Review ID not found!"
            });
          } else {
            // Else, the specific review was found and will be deleted
            location.reviews.id(req.params.reviewid).remove();
            // Commit changes to the document, save document to database API
            location.save(function(err) {
              // If there was an error, then display
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                // Update the average rating after the review has been removed
                updateAverageRating(location._id);
                sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          // Else return error message
          sendJSONresponse(res, 404, {
            "message": "No review to delete!"
          });
        }
      }
  );
};
