/**
 * formData - Form validation based on data attributes
 * @date - Thu Jul 30 2015 14:48:55 GMT+0200 (Central Europe Daylight Time)
 * @version - 1.0.1
 */
;(function($, win, doc) {
    'use strict';

    var defaultOptions, coreOptions, pluginName, version, rules;

    rules = {};

    pluginName = 'FormData';
    version = '1.0.1';
    coreOptions = {
        validFormClass : 'formdata'
    };
    defaultOptions = {
        keyup: false,
        blur: true,
        validDataAttr : 'valid',
        classSuccess : 'success',
        classError : 'error',
        tpl : {
            error : '<span class="form-error">{message}</span>'
        },
        preventSubmit : false,
        onError : null,
        onSuccess : null
    };

    function FormData(element, options) {
        this.$form = $(element);
        this.options = $.extend(true, {}, defaultOptions, options);
        this.$fields = this.$form.find('[data-' + this.options.validDataAttr + '], [required]');
        this.isFormValid = false;
        this.formLog = {};
        this.version = version;
        this.getFieldsRules();
        this.addFormEvents();
        this.addFieldEvents();
    }

    FormData.prototype.getFieldsRules = function() {
        var self, i, $field, rule, ruleName, ruleOpt = null;
        self = this;
        this.fieldsRules = [];
        i = 0;
        this.$fields.each(function() {
            $field = $(this);
            rule = $field.data(self.options.validDataAttr) || null;
            $field.data('field-id', i);
            $field.attr('aria-invalid', 'false');
            if (/\|/.test(rule)) {
                rule = rule.split('|');
                ruleName = rule[0];
                ruleOpt = rule[1];
                if (/\-/.test(ruleOpt)) {
                    ruleOpt = ruleOpt.split('-');
                }
            } else {
                ruleName = rule;
            }
            self.fieldsRules.push({
                name : ruleName,
                opt : ruleOpt
            });
            i++;
        });
    };

    FormData.prototype.addFieldEvents = function() {
        var self = this;
        this.$fields.on({
            'keyup' : function(e) {
                if (e.keyCode !== 9 && self.options.keyup) {
                    self.validateField(this);
                }
            },
            'blur' : function() {
                return self.options.blur ? self.validateField(this) : false;
            }
        });
    };

    FormData.prototype.addFormEvents = function() {
        var self = this;
        this.$form.on('submit', function(e) {
            self.submitForm();
            if (!self.isFormValid) {
                e.preventDefault();
                if (typeof self.options.onError == "function") {
                    self.options.onError(self.formLog);
                }
            } else {
                if (typeof self.options.onSuccess == "function") {
                    e.preventDefault();
                    self.options.onSuccess(self.$form);
                }
            }
        });
    };

    FormData.prototype.submitForm = function() {
        var self = this;
        this.$fields.each(function() {
            self.validateField(this);
        });
        this.isFormValid = !this.parseFormLog();
    };

    FormData.prototype.parseFormLog = function() {
        var i, errorsCount;
        errorsCount = 0;
        for (i in this.formLog) {
            if (this.formLog[i]) {
                errorsCount += 1;
            }
        }
        return errorsCount;
    };

    FormData.prototype.validateField = function(field) {
        this.$field = $(field);
        this.fieldId = this.$field.data('field-id');
        this.fieldName = this.$field.attr('name');
        this.value = $.trim(this.$field.val());
        this.opt = this.fieldsRules[this.fieldId].opt;

        this.fieldRuleName = this.fieldsRules[this.fieldId].name
            ? this.fieldsRules[this.fieldId].name
            : 'required';

        this.validationRule = FormData.getRule(this.fieldRuleName);
        this.isFieldValid(this.validationRule.fn.call(this));         
    };

    FormData.prototype.isFieldValid = function(isValid) {
        return isValid ? this.hideFieldError() : this.showFieldError();
    };

    FormData.prototype.showFieldError = function() {
        if (this.formLog[this.fieldName] || this.$field.prop('disabled')) { return; }
        this.$field.removeClass(this.options.classSuccess);
        this.$field.addClass(this.options.classError);
        this.$field.attr('aria-invalid', 'true');

        if (this.$field.data('message')) {
            this.showFieldErrorMessage(this.$field.data('message'))
        } else {
            this.showFieldErrorMessage(this.validationRule.message);
        }
    };

    FormData.prototype.hideFieldError = function() {
        this.$field.removeClass(this.options.classError);
        this.$field.addClass(this.options.classSuccess);
        this.$field.attr('aria-invalid', 'false');
        this.hideFieldErrorMessage();
    };

    FormData.prototype.showFieldErrorMessage = function(message) {
        var tpl, i, optLength;
        if (typeof this.opt === "string") {
            message = message.replace(/{\w+}/i, this.opt);
        }
        if (this.opt && typeof this.opt === "object") {
            i = 0;
            optLength = this.opt.length;
            for ( i; i < optLength; i++ ) {
                message = message.replace(/{\w+}/i, this.opt[i]);
            }
        }
        this.formLog[this.fieldName] = message;
        tpl = this.options.tpl.error.replace(/{message}/i, message);
        return this.$field.after(tpl);
    };

    FormData.prototype.hideFieldErrorMessage = function() {
        this.formLog[this.fieldName] = null;
        return this.$field.next().remove();
    };

    FormData.prototype.parseErrors = function(errors) {
        return typeof errors == "string" ? JSON.parse(errors) : errors;
    };

    FormData.prototype.setErrors = function(errors) {
        var i, errorsObject;
        errorsObject = this.parseErrors(errors);
        for (i in errorsObject) {
            if (errorsObject.hasOwnProperty(i)) {
                this.$field = this.$fields.filter('[name='+ i +']');
                this.showFieldErrorMessage(errorsObject[i]);
            }
        }
    };

    FormData.setup = function(options) {
        defaultOptions = $.extend(true, {}, defaultOptions, options);
    };

    FormData.addRule = function(name, fn, message) {
        if (rules[name]) {
            throw new Error('Validation rule:' + name + ' already added.');
        }

        if (typeof fn != 'function') {
            throw new Error('Rule function not defined.');
        }

        rules[name] = {
            fn: fn,
            message: message || 'Error'
        };
    };

    FormData.getRule = function(name) {
        if (!rules[name]) {
            throw new Error('Validation rule:' + name + ' doesn\'t exist.');
        }

        return rules[name];
    };

    window.FormData = FormData;

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            var $this, formData;
            $this = $(this);
            formData = $this.data(pluginName);
            if (!formData) {
                $this.data(pluginName, new FormData(this, options));
            }
        });
    };

    $(function() {
        $('.' + coreOptions.validFormClass).FormData();
    });

})(jQuery, window, document);

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
