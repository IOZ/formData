/**
 * formData - Form validation based on data attributes
 * @date - Tue Jan 06 2015 12:46:59 GMT+0100 (Central Europe Standard Time)
 * @version - 1.0.1
 */
;(function($, win, doc) {
    'use strict';

    var defaultOptions, coreOptions, pluginName, version, RE, Locale;

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

    RE = {
        email : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        float : /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,
        number : /^\d+$/
    };

    Locale = {
        empty : 'This is a required field.',
        email : 'Please enter a valid email address. For example name@site.com',
        min : 'You should fill minimum {min} characters',
        max : 'You should fill maximum {max} characters',
        range : 'You should fill from {min} to {max} characters'
    };

    function FormData(element, options) {
        this.$form = $(element);
        this.options = $.extend(true, {}, defaultOptions, options);
        this.$fields = this.$form.find('[data-' + this.options.validDataAttr + ']');
        this.isFormValid = false;
        this.formLog = {};
        this.version = version;
        this.getFieldsRules();
        this.addFormEvents();
        this.addFieldEvents();
    }

    FormData.setup = function(options) {
        defaultOptions = $.extend(true, {}, defaultOptions, options);
    };

    FormData.prototype.getFieldsRules = function() {
        var self, i, $field, rule, ruleName, ruleOpt = null;
        self = this;
        this.fieldsRules = [];
        i = 0;
        this.$fields.each(function() {
            $field = $(this);
            rule = $field.data(self.options.validDataAttr) || null;
            $field.data('field-id', i);
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
        this.fieldValue = $.trim(this.$field.val());
        this.fieldRuleOpt = this.fieldsRules[this.fieldId].opt;

        this.fieldRuleName = this.fieldsRules[this.fieldId].name
            ? this.fieldsRules[this.fieldId].name
            : 'empty';

        switch (this.fieldRuleName) {
            case 'email':
                this.isFieldValid(RE.email.test(this.fieldValue));
                break;
            case 'min':
                this.isFieldValid(this.fieldValue.length >= Math.floor(this.fieldRuleOpt));
                break;
            case 'max':
                this.isFieldValid(this.fieldValue.length <= Math.floor(this.fieldRuleOpt) && this.fieldValue.length);
                break;
            case 'range':
                this.isFieldValid(
                    this.fieldValue.length >= Math.floor(this.fieldRuleOpt[0])
                    && this.fieldValue.length <= Math.floor(this.fieldRuleOpt[1])
                );
                break;
            default:
                this.isFieldValid(this.fieldValue.length);
                break;
        }
    };

    FormData.prototype.isFieldValid = function(isValid) {
        return isValid ? this.hideFieldError() : this.showFieldError();
    };

    FormData.prototype.showFieldError = function() {
        if (this.formLog[this.fieldName] || this.$field.prop('disabled')) { return; }
        this.$field.removeClass(this.options.classSuccess);
        this.$field.addClass(this.options.classError);

        if (this.$field.data('message')) {
            this.showFieldErrorMessage(this.$field.data('message'))
        } else {
            this.showFieldErrorMessage(Locale[this.fieldRuleName]);
        }
    };

    FormData.prototype.hideFieldError = function() {
        this.$field.removeClass(this.options.classError);
        this.$field.addClass(this.options.classSuccess);
        this.hideFieldErrorMessage();
    };

    FormData.prototype.showFieldErrorMessage = function(message) {
        var tpl, i, optLength;
        if (typeof this.fieldRuleOpt === "string") {
            message = message.replace(/{\w+}/i, this.fieldRuleOpt);
        }
        if (this.fieldRuleOpt && typeof this.fieldRuleOpt === "object") {
            i = 0;
            optLength = this.fieldRuleOpt.length;
            for ( i; i < optLength; i++ ) {
                message = message.replace(/{\w+}/i, this.fieldRuleOpt[i]);
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
