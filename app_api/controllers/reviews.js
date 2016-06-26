var mongoose = require('mongoose');
var reviewer = mongoose.model('Location');

/** Send result back to user */
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/** Adding a new review, providing a locationid */
/** Route - /api/locations/:locationid/reviews */
module.exports.reviewsCreate = function(req, res) {
  if (req.params.locationid) {
    // Creating a new review document / object by locating record by 'locationid' variable
    reviewer
      .findById(req.params.locationid)
      .select('reviews')
      .exec(
        function(err, location) {
          if (err) {
            sendJSONresponse(res, 400, err);
          } else {
            // Pass the location to be updated with the new review
            doAddReview(req, res, location);
          }
        }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid required"
    });
  }
};

var doAddReview = function(req, res, location) {
  // If the location is not null then continue
  if (!location) {
    sendJSONresponse(res, 404, "locationid not found");
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
  console.log("Update rating average for", locationid);
  // Find location by 'locationid'
  reviewer
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
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  // Find the location by 'locationid' record
  reviewer
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        var thisReview;
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          thisReview = location.reviews.id(req.params.reviewid);
          if (!thisReview) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            thisReview.author = req.body.author;
            thisReview.rating = req.body.rating;
            thisReview.reviewText = req.body.reviewText;
            location.save(function(err, location) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 200, thisReview);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to update"
          });
        }
      }
  );
};

// This function returns one specific review record by 'locationid' variable
module.exports.reviewsReadOne = function(req, res) {
  console.log("Getting single review");
  if (req.params && req.params.locationid && req.params.reviewid) {
    reviewer
      .findById(req.params.locationid)
      .select('name reviews')
      .exec(
        function(err, location) {
          console.log(location);
          var response, review;
          if (!location) {
            sendJSONresponse(res, 404, {
              "message": "locationid not found"
            });
            return;
          } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
          }
          if (location.reviews && location.reviews.length > 0) {
            review = location.reviews.id(req.params.reviewid);
            if (!review) {
              sendJSONresponse(res, 404, {
                "message": "reviewid not found"
              });
            } else {
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
            sendJSONresponse(res, 404, {
              "message": "No reviews found"
            });
          }
        }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
  }
};

// Delete a review
// Route - /api/locations/:locationid/reviews/:reviewid
module.exports.reviewsDeleteOne = function(req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  reviewer
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          if (!location.reviews.id(req.params.reviewid)) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            location.reviews.id(req.params.reviewid).remove();
            location.save(function(err) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
  );
};
