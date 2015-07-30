(function($) {
    FormData.addRule('required', function() {
        return this.value.length;
    }, 'This field is required.');

    FormData.addRule('email', function() {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(this.value);
    }, 'Please enter a valid email address. For example user@site.com');

    FormData.addRule('number', function() {
        var re = /^\d+$/;
        return re.test(this.value);
    }, 'Please enter numbers only.');

    FormData.addRule('float', function() {
        var re = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
        return re.test(this.value);
    }, 'Please enter numbers with float point.');

    FormData.addRule('min', function() {
        return this.value.length >= Math.floor(this.opt);
    }, 'You should fill minimum {min} characters.');

    FormData.addRule('max', function() {
        return this.value.length <= Math.floor(this.opt) && this.value.length;
    }, 'You should fill maximum {max} characters');

    FormData.addRule('range', function() {
        return this.value.length >= Math.floor(this.opt[0])
                && this.value.length <= Math.floor(this.opt[1]);
    }, 'You should fill from {min} to {max} characters.');

})(jQuery);
