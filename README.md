##Formdata-

Simple in use form validation, based on data- attributes

###Getting started
1. include to your project next files:
```html
<!-- load jQuery from CDN -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>

<!-- Form data plugin -->
<script type="text/javascript" src="../dest/formData.min.js"></script>
```
2. Add to your form classname **formdata** and set to input validation rules:
```html
<form action="/" method="post" class="formdata">
    <div class="form-row">
        <label> Username </label>
        <input  data-valid="range|2-10" type="text" name="name">
    </div>
    <div class="form-row">
        <label> Email </label>
        <input data-valid="email" type="text" name="email">
    </div>
    <div class="form-row">
        <label> Password </label>
        <input data-valid="min|6" type="text" name="min">
    </div>
    <button>Send</button>
</form>
```
3. Reload page. Plugin was automatically initialized for all forms which contains class **formdata**.

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

### Base Options
```javascript
{
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
}
```

Also you can override base options, insert following code outside jQuery DOM ready function:
```javascript
FormData.setup({
    preventSubmit : true,
    onSuccess : function(form) {
        // ajax query or other operation
        
        form.slideUp(function() {
            form.after('<p>Thank you for register.</p>');
        });
    }
});
```
