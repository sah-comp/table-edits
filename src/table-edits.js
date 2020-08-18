;
(function($, window, document, undefined) {
    var pluginName = "editable",
        defaults = {
            keyboard: true,
            dblclick: true,
            button: true,
            buttonSelector: ".edit",
            maintainWidth: true,
            dropdowns: {},
            edit: function() {},
            save: function() {},
            cancel: function() {}
        };

    function editable(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    editable.prototype = {
        init: function() {
            this.editing = false;

            if (this.options.dblclick) {
                $(this.element)
                    .css('cursor', 'pointer')
                    .bind('dblclick', this.toggle.bind(this));
            }

            if (this.options.button) {
                $(this.options.buttonSelector, this.element)
                    .bind('click', this.toggle.bind(this));
            }
        },

        toggle: function(e) {
            e.preventDefault();

            this.editing = !this.editing;

            if (this.editing) {
                this.edit();
            } else {
                this.save();
            }
        },

        edit: function() {
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var input,
                    opt,
                    cval = 0,
                    id = $(this).parent('tr').data('id'),
                    field = $(this).data('field'),
                    value = $(this).text(),
                    width = $(this).width();

                values[field] = value;

                $(this).empty();

                if (instance.options.maintainWidth) {
                    $(this).width(width);
                }

                if (field in instance.options.dropdowns) {
                    input = $('<select></select>');
                    input.attr('id', 'foxy-' + id + '-' + field);
                    input.attr('name', field);
                    input.attr('autocomplete', 'off');
                    $(instance.options.dropdowns[field]).each(function() {
                        opt = $("<option></option>");
                        opt.attr('value', this.val).text(this.text);
                        if (value == this.text) {
                            cval = this.val; //memorize the current value
                            console.log('The value of ' + field + '#' + id + ' equals ' + cval);
                        }
                        opt.appendTo(input);
                    });
                    input.val(value)
                        .data('old-value', value)
                        .dblclick(instance._captureEvent);

                } else {
                    input = $('<input type="text" />')
                        .val(value)
                        .data('old-value', value)
                        .dblclick(instance._captureEvent);
                }

                input.appendTo(this);
                //marked the option with the current value as selected
                console.log('Value is ' + cval);
                $('#foxy-' + id + '-' + field + ' > option[value="' + cval + '"]').attr("selected", "selected");

                if (instance.options.keyboard) {
                    input.keydown(instance._captureKey.bind(instance));
                }
            });

            this.options.edit.bind(this.element)(values);
        },

        save: function() {
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var value = $(':input', this).val();
                var seltext = '';
                var field = $(this).data('field');

                values[field] = value;

                if (field in instance.options.dropdowns) {
                    $(instance.options.dropdowns[field]).each(function() {
                        if ((this).val == value) {
                            seltext = (this).text;
                        }
                    })
                    $(this).empty().text(seltext);
                } else {
                    $(this).empty().text(value);
                }
            });

            this.options.save.bind(this.element)(values);
        },

        cancel: function() {
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var value = $(':input', this).data('old-value');

                values[$(this).data('field')] = value;

                $(this).empty()
                    .text(value);
            });

            this.options.cancel.bind(this.element)(values);
        },

        _captureEvent: function(e) {
            e.stopPropagation();
        },

        _captureKey: function(e) {
            if (e.which === 13) {
                this.editing = false;
                this.save();
            } else if (e.which === 27) {
                this.editing = false;
                this.cancel();
            }
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new editable(this, options));
            }
        });
    };

})(jQuery, window, document);
