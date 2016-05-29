;(function($, win, doc) {
    'use strict';

    var defaultOptions, coreOptions, pluginName, version, rules;

    rules = {};

    pluginName = 'FormData';
    version = '1.0.3';
    coreOptions = {
        validFormClass : 'formdata'
    };
    defaultOptions = {
        keyup: false,
        blur: true,
        validDataAttr : 'valid',
        classSuccess : 'fd-success',
        classError : 'fd-error',
        classFormError : 'fd-form-invalid',
        placeForError: 'afterInput',
        tpl : {
            error : '<span class="form-error">{message}</span>'
        },
        preventSubmit : false,
        onError : null,
        onSuccess : null
    };

    function FormData(element, options) {
        this.$form = $(element);
        this.$form.attr('novalidate', true);
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
            if (self.options.preventSubmit) {
                e.preventDefault();
            }
            if (!self.validate()) {
                e.preventDefault();
            }
        });
    };

    FormData.prototype.validate = function() {
        var self = this;
        this.$fields.each(function() {
            self.validateField(this);
        });
        this.isFormValid = !this.parseFormLog();
        if (!this.isFormValid) {
            this.$form.addClass(this.options.classFormError);
            if (typeof self.options.onError == "function") {
                this.options.onError(this.formLog);
            }
        } else {
            this.$form.removeClass(this.options.classFormError);
            if (typeof self.options.onSuccess == "function") {
                this.options.onSuccess(this.$form);
            }
        }
        return this.isFormValid;
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

    FormData.prototype.getFirstLogError = function() {
        var i;
        for (i in this.formLog) {
            return this.formLog[i];
            break;
        }
        return null;
    };

    FormData.prototype.showFieldError = function(message) {
        if (this.$field.prop('disabled')) { return; }
        this.$field.removeClass(this.options.classSuccess);
        this.$field.addClass(this.options.classError);
        this.$field.attr('aria-invalid', 'true');

        if (message) {
            this.showFieldErrorMessage(message);
        } else if (this.$field.data('message')) {
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
        var tpl, i, optLength, errorPlace;
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

        message = this.options.placeForError == 'afterInput' ? message : this.getFirstLogError();
        tpl = $(this.options.tpl.error.replace(/{message}/i, message)).data('inserted', true);
        if (this.options.placeForError == 'afterInput') {
            if (this.$field.next().data('inserted')) {
                this.$field.next().remove();
            }
            this.$field.after(tpl)
        } else {
            errorPlace = this.$form.find(this.options.placeForError);
            if (errorPlace.length) {
                errorPlace.html(tpl);
            }
        }
        return tpl;
    };

    FormData.prototype.hideFieldErrorMessage = function() {
        var errorPlace;
        delete this.formLog[this.fieldName];
        if (this.options.placeForError == 'afterInput') {
            this.$field.next().remove();
        } else {
            errorPlace = this.$form.find(this.options.placeForError);
            if (errorPlace.length) {
                errorPlace.html('');
            }
        }
        return this;
    };

    FormData.prototype.parseErrors = function(errors) {
        return typeof errors == "string" ? JSON.parse(errors) : errors;
    };

    FormData.prototype.setErrors = function(errors) {
        var i, errorsObject;
        errorsObject = this.parseErrors(errors);
        for (i in errorsObject) {
            if (errorsObject.hasOwnProperty(i)) {
                this.fieldName = i;
                this.$field = this.$fields.filter('[name="'+ i +'"]');
                this.showFieldError(errorsObject[i]);
            }
        }
        this.$form.addClass(this.options.classFormError);
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
