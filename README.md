##Formdata-

Simple in use form validation, based on data- attributes

###Getting started
basic usage:

	$('form').fromData();

usage with params:	

	$('form').fromData({
		blur: true, // check field on blur
		error: function(log){}, // on error callback
		success: function(param){} // on success callback
	});


### Validation rules
	
	<input data-valid="" data-message="" type="text" name="email">
	
	// email
	data-valid="email"
	data-message="empty error|format error"

	// number
	data-valid="number"
	data-message="empty error|format error"

	// float
	data-valid="float"
	data-message="empty error|format error"

	// min chars
	data-valid="min|2"
	data-message="empty error|format error, placeholder {0}"

	// max chars
	data-valid="max|10"
	data-message="empty error|format error, placeholder {0}"

	// range chars
	data-valid="range|2|10"
	data-message="empty error|format error, and placeholders {0} {1}"





