(function($){

	$.fn.fromData = function(param){
		
		'use strict';

		/**
		 * Helpers methods
		 */
		$.extend($.fn, {
			formDataValid : function(){
				var form = $(this);
				if(form.data('init')){
					form.submit();
				} else {
					return 'Error: form dont init';
				}
			}
		});

		var defaults = {
			blur              : true,
			validSuccessClass : 'success',
			validErrClass     : 'error',
			tpl : {
				error : '<span class="form-error">{message}</span>'
			},
			error : function(log){},
			success : function(param){}
		};
		
		var settings   = $.extend( {}, defaults, param ),
			formArrLog = [];

		/* regular extensions */
		var re_email  = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			re_number = /^\d+$/,
			re_float  = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;

		var SVmodel = {
			clearErr : function(obj){
				obj 
					.addClass(settings.validSuccessClass)
					.removeClass(settings.validErrClass)
					.next()
					.remove();

			},
			setErr : function(obj, str){
				obj
					.removeClass(settings.validSuccessClass)
					.addClass(settings.validErrClass)
					.after(str);

				// write error to log
				var arr = [obj.attr('name'), str];
				formArrLog.push(arr);

			},
			valid : function(obj){

				var valid        = obj.data('valid'),
					valid_text   = obj.data('message'),
					value        = $.trim(obj.val()),
					args,
					error;

				// split data params
				valid_text = valid_text.split('|');
				args  = valid.split('|');	

				// validate fields
				if(!value.length){
					error = settings.tpl.error.replace('{message}', valid_text[0]);
					SVmodel.setErr(obj, error);
				} else if (value.length>0) {

					// validation type
					switch(args[0]){
						case 'email':
							if( !re_email.test(value) ){
								error = settings.tpl.error.replace('{message}', valid_text[1]);
								SVmodel.setErr(obj, error);
							} else {
								SVmodel.clearErr(obj);
							}
							break;

						case 'float':
							if( !re_float.test(value) ){
								error = settings.tpl.error.replace('{message}', valid_text[1]);
								SVmodel.setErr(obj, error);
							} else {
								SVmodel.clearErr(obj);
							}

							break;

						case 'number':
							if( !re_number.test(value) ){
								error = settings.tpl.error.replace('{message}', valid_text[1]);
								SVmodel.setErr(obj, error);
							} else {
								SVmodel.clearErr(obj);
							}
							break;
						case 'range':
							if ( value.length < parseInt(args[1]) || value.length > parseInt(args[2]) ) {
								error = settings.tpl.error
										.replace('{message}', valid_text[1])
										.replace('{0}', args[1])
										.replace('{1}', args[2]);
								SVmodel.setErr(obj, error);
							} else {
								SVmodel.clearErr(obj);
							}
							break;
						case 'min':
							if ( value.length < parseInt(args[1]) ) {
								error = settings.tpl.error
										.replace('{message}', valid_text[1])
										.replace('{0}', args[1]);
								SVmodel.setErr(obj, error);
							} else {
								SVmodel.clearErr(obj);
							}
							break;
						case 'max':
							if ( value.length > parseInt(args[1]) ) {
								error = settings.tpl.error
										.replace('{message}', valid_text[1])
										.replace('{0}', args[1]);
								SVmodel.setErr(obj, error);
							} else {
								SVmodel.clearErr(obj);
							}
							break;

						default:

							SVmodel.clearErr(obj);
							
							if(obj.is(':checkbox')){
								if(!obj.is(':checked')){
									error = settings.tpl.error.replace('{message}', valid_text[0]);
									SVmodel.setErr(obj, error);
								} else {
									SVmodel.clearErr(obj);
								}
							} 

							
							break;
					}
				}
			}
		};

		return this.each(function(){
			
			var form   = $(this),
				fields = form.find('[data-valid]');

				form.data('init', true);

				// check field on blur (optional)
				if( settings.blur ){
					fields.on('blur', function(){
						$(this).next().remove();
						SVmodel.valid($(this));
					});
				}

				// check field on submit
				form.on('submit', function(e){

					// clear error log
					formArrLog = [];	

					// clear error messages			
					SVmodel.clearErr(fields);

					// revalidate fields
					fields.each(function(){
						SVmodel.valid($(this));
					});

					// if error log has errors, stop submit
					if(formArrLog.length){
						e.preventDefault();
						e.stopPropagation();

						if( typeof settings.error == "function" ){
							settings.error.call(this, formArrLog);
						}

						return false;
					}  else {
						// TODO: success callback
						if( typeof settings.success == "function" ){
							var param  = form.serialize();
							settings.success.call(this, param);
							return false;
						}
					}
				});
		});
	};
})(jQuery);



