##Formdata-

Simple in use form validation, based on data- attributes

###Getting started
include to your project next files
```html
<!-- load jQuery from CDN -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>

<!-- Form data plugin -->
<script type="text/javascript" src="../dest/formData.min.js"></script>
```

### Validation rules
	
```html
<input data-valid="" data-message="" type="text" name="email">

// simple checking to empty field
data-valid

// email
data-valid="email"

// min chars
data-valid="min|2"

// max chars
data-valid="max|10"

// range chars
data-valid="range|2|10"
```

### Options
```javascript
$('form').FormData({
	keyup: false,             // validate field on keyuo event  
        blur: true,               // validate field when user focus out from field
        validDataAttr : 'valid',  // validate data- attribute, by defaul "data-valid"
        classSuccess : 'success', // add class when field is valid
        classError : 'error',     // add class when field invalid
        tpl : {                   // error template view
            error : '<span class="form-error">{message}</span>'
        },
        preventSubmit : false,    // if form is valid, prevent submit it
        onError : null,           // execute every time when form submiting with invalid data
        onSuccess : null          // if form fill correctly, execute this function
});
```
