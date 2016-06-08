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
        this.formFields = {};
        this.version = version;
        this.getFieldsRules();
        this.addFormEvents();
        this.addFieldEvents();
    }

    FormData.prototype.getFieldsRules = function() {
        var self, i, $field, fieldName, rule, ruleName, ruleOpt = null;
        self = this;
        this.fieldsRules = [];
        i = 0;
        this.$fields.each(function() {
            $field = $(this);
            rule = $field.data(self.options.validDataAttr) || null;
            $field.data('field-id', i);
            $field.attr('aria-invalid', 'false');
            fieldName = $field.attr('name');
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
            self.formFields[fieldName] = $field;
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
        this.showHideFormErrors();
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
        return isValid ? this.removeErrorFromLog() : this.addErrorToLog();
    };

    FormData.prototype.addErrorToLog = function() {
        if (this.$field.prop('disabled')) { return; }
        this.message = this.$field.data('message') ? this.$field.data('message') : this.validationRule.message;
        if (typeof this.opt === "string") {
            this.message = this.message.replace(/{\w+}/i, this.opt);
        }
        if (this.opt && typeof this.opt === "object") {
            for (var i = 0; i < this.opt.length; i++ ) {
                this.message = this.message.replace(/{\w+}/i, this.opt[i]);
            }
        }
        this.formLog[this.fieldName] = this.message;
    };

    FormData.prototype.removeErrorFromLog = function() {
        delete this.formLog[this.fieldName];
    };

    FormData.prototype.showHideFormErrors = function() {
        var i, errorPlace, errCount;
        errCount = 0;
        for (i in this.formFields) {
            if (this.formFields.hasOwnProperty(i)) {
                this.$field = this.formFields[i];
                if (this.formLog[i]) {
                    this.message = this.formLog[i];
                    this.showFieldError();
                } else {
                    this.hideFieldError();
                }
                errCount++;
            }
        }

        if (this.options.placeForError != 'afterInput') {
            errorPlace = this.$form.find(this.options.placeForError);
            if (errorPlace.length) {
                errorPlace.html(errCount ? this._renderErrorTpl(this._getFirstLogError()) : '');
            }
        }
    };

    FormData.prototype.showFieldError = function() {
        this.$field.removeClass(this.options.classSuccess);
        this.$field.addClass(this.options.classError);
        this.$field.attr('aria-invalid', 'true');

        if (this.options.placeForError == 'afterInput') {
            if (this.$field.next().data('inserted')) {
                this.$field.next().remove();
            }
            this.$field.after(this._renderErrorTpl(this.message))
        }
        return this;
    };

    FormData.prototype.hideFieldError = function() {
        this.$field.removeClass(this.options.classError);
        this.$field.addClass(this.options.classSuccess);
        this.$field.attr('aria-invalid', 'false');
        if (this.options.placeForError == 'afterInput') {
            this.$field.next().remove();
        }
    };

    FormData.prototype._getFirstLogError = function() {
        var i;
        for (i in this.formLog) {
            return this.formLog[i];
            break;
        }
        return null;
    };

    FormData.prototype._renderErrorTpl = function(message) {
        return $(this.options.tpl.error.replace(/{message}/i, message)).data('inserted', true);
    };

    FormData.prototype.parseErrors = function(errors) {
        return typeof errors == "string" ? JSON.parse(errors) : errors;
    };

    FormData.prototype.setErrors = function(errors) {
        this.formLog = $.extend(this.formLog, this.parseErrors(errors));
        this.showHideFormErrors();
        if (this.parseFormLog()) {
            this.$form.addClass(this.options.classFormError);
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

    $.FormData = FormData;

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
