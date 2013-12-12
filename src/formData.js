(function($){

	$.fn.fromData = function(param){

		var defaults = {
			blur              : true,
			validSuccessClass : 'success',
			validErrClass     : 'error',
			tpl : {
				error : '<span class="form-error">{message}</span>'
			},
			error : function(log){
				// do some
			},
			callback : function(param){
				// do some
			}
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
					arguments,
					error;

				// split data params
				valid_text = valid_text.split('|');
				arguments  = valid.split('|');	

				// validate fields

				if(!value.length){
					error = settings.tpl.error.replace('{message}', valid_text[0]);
					SVmodel.setErr(obj, error);
				} else if (value.length>0) {

					// validation type
					switch(arguments[0]){
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

						default:
							SVmodel.clearErr(obj);
							break;
					}
				}
			}
		};

		return this.each(function(){
			
			var that   = $(this),
				fields = that.find('[data-valid]');

				that.data('init', true);

				// check field on blur (optional)
				if( settings.blur ){
					fields.on('blur', function(){
						$(this).next().remove();
						SVmodel.valid($(this));
					});
				}

				// check field on submit
				that.on('submit', function(e){

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
						if( typeof settings.callback == "function" ){
							var param  = that.serialize();
							settings.callback.call(this, param);
							return false;
						}
					}
				});
		});

	};

})(jQuery);



	$('form').fromData({
		blur: true,
		error: function(ErrLog){
			console.log(ErrLog);
		},
		callback: function(param){
			console.log(param);
		}

	});