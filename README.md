##Formdata-

Simple in use form validation, based on data- attributes

###Getting started
basic usage:
	
```javascript
$('form').formData();
```

usage with params:	

```javascript
$('form').formData({
	
	// Options
	blur: true, // check field on blur
	
	// Views
	validSuccessClass : 'success',
	validErrClass     : 'error',
	tpl : {
		error : '<span class="form-error">{message}</span>'
	},
	
	// Callback's
	error: function(log){}, // on error callback
	success: function(param){} // on success callback

});
```

### Validation rules
	
```html
<input data-valid="" data-message="" type="text" name="email">

// email
data-valid="email"
data-message="This field is required.|Please enter a valid email address."

// number
data-valid="number"
data-message="This field is required.|Please enter a valid number."

// float number
data-valid="float"
data-message="This field is required.|Please enter a valid number."

// min chars
data-valid="min|2"
data-message="This field is required.|Please enter a value greater than or equal to {0}."

// max chars
data-valid="max|10"
data-message="This field is required.|Please enter a value less than or equal to {0}."

// range chars
data-valid="range|2|10"
data-message="This field is required.|Please enter a value between {0} and {1} characters long."
```

### Plugin methods

```javascript
// external validate form 
$('#form').formDataValid();
``` 

