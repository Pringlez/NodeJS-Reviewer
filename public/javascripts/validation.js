/** This file validates the input fields when data is submitted to the API server */
$('#addReview').submit(function (e) {
  $('.alert.alert-danger').hide();
  // If the name, rating or the review text is null / empty then display error message
  if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {
    if ($('.alert.alert-danger').length) {
      $('.alert.alert-danger').show();
    } else {
      $(this).prepend('<div role="alert" class="alert alert-danger">All input fields are required, please check you submission!</div>');
    }
    return false;
  }
});