/**
 * @package   PickMeUp - jQuery datepicker plugin
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @author    Stefan Petre <www.eyecon.ro>
 * @copyright Copyright (c) 2013-2016, Nazar Mokrynskyi
 * @copyright Copyright (c) 2008-2009, Stefan Petre
 * @license   MIT License, see license.txt
 */

/*(function (d) {
    function getMaxDays() {
        var tmpDate = new Date(this.toString()),
            d = 28,
            m = tmpDate.getMonth();
        while (tmpDate.getMonth() == m) {
            ++d;
            tmpDate.setDate(d);
        }
        return d - 1;
    }

    d.addDays = function (n) {
        this.setDate(this.getDate() + n);
    };
    d.addMonths = function (n) {
        var day = this.getDate();
        this.setDate(1);
        this.setMonth(this.getMonth() + n);
        this.setDate(Math.min(day, getMaxDays.apply(this)));
    };
    d.addYears = function (n) {
        var day = this.getDate();
        this.setDate(1);
        this.setFullYear(this.getFullYear() + n);
        this.setDate(Math.min(day, getMaxDays.apply(this)));
    };
    d.getDayOfYear = function () {
        var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
        var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
        var time = now - then;
        return Math.floor(time / 24 * 60 * 60 * 1000);
    };
})(Date.prototype);

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var instances_count = 0;
    $.pickmeup = $.extend($.pickmeup || {}, {
        date: new Date,
        default_date: new Date,
        flat: false,
        first_day: 1,
        prev: '&#9664;',
        next: '&#9654;',
        mode: 'single',
        select_year: true,
        select_month: true,
        select_day: true,
        view: 'days',
        calendars: 1,
        format: 'd-m-Y',
        title_format: 'B, Y',
        position: 'bottom',
        trigger_event: 'click touchstart',
        class_name: '',
        separator: ' - ',
        hide_on_select: false,
        min: null,
        max: null,
        render: function () {
        },
        change: function () {

            //;

            var i;

            return true;
        },
        before_show: function () {
            return true;
        },
        show: function () {
            return true;
        },
        hide: function () {
            return true;
        },
        fill: function () {
            return true;
        },
        locale: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    });
    var views = {
            years: 'pmu-view-years',
            months: 'pmu-view-months',
            days: 'pmu-view-days'
        },
        tpl = {
            wrapper: '<div class="pickmeup" />',
            head: function (d) {
                var result = '';
                for (var i = 0; i < 7; ++i) {
                    result += '<div>' + d.day[i] + '</div>'
                }
                return '<div class="pmu-instance">' +
                    '<nav>' +
                    '<div class="pmu-prev pmu-button">' + d.prev + '</div>' +
                    '<div class="pmu-month pmu-button" />' +
                    '<div class="pmu-next pmu-button">' + d.next + '</div>' +
                    '</nav>' +
                    '<nav class="pmu-day-of-week">' + result + '</nav>' +
                    '</div>';
            },
            body: function (elements, container_class_name) {
                var result = '';
                for (var i = 0; i < elements.length; ++i) {
                    result += '<div class="' + elements[i].class_name + ' pmu-button">' + elements[i].text + '</div>'
                }
                return '<div class="' + container_class_name + '">' + result + '</div>';
            }
        };

    function namespaced_events(events, namespace) {
        events = events.split(' ');
        for (var i = 0; i < events.length; ++i) {
            events[i] += namespace;
        }
        return events.join(' ');
    }

    function fill() {

        var options = $(this).data('pickmeup-options'),
            pickmeup = this.pickmeup,
            current_cal = Math.floor(options.calendars / 2),
            actual_date = options.date,
            current_date = options.current,
            min_date = options.min ? new Date(options.min) : null,
            max_date = options.max ? new Date(options.max) : null,
            local_date,
            header,
            html,
            instance,
            today = (new Date).setHours(0, 0, 0, 0).valueOf(),
            shown_date_from,
            shown_date_to,
            tmp_date;
        if (min_date) {
            min_date.setDate(1);
            min_date.addMonths(1);
            min_date.addDays(-1);
        }
        if (max_date) {
            max_date.setDate(1);
            max_date.addMonths(1);
            max_date.addDays(-1);
        }

        /!**
         * Remove old content except header navigation
         *!/
        pickmeup.find('.pmu-instance > :not(nav)').remove();
        /!**
         * If several calendars should be shown
         *!/
        for (var i = 0; i < options.calendars; i++) {
            local_date = new Date(current_date);
            instance = pickmeup.find('.pmu-instance').eq(i);
            if (pickmeup.hasClass('pmu-view-years')) {
                local_date.addYears((i - current_cal) * 12);
                header = (local_date.getFullYear() - 6) + ' - ' + (local_date.getFullYear() + 5);
            } else if (pickmeup.hasClass('pmu-view-months')) {
                local_date.addYears(i - current_cal);
                header = local_date.getFullYear();
            } else if (pickmeup.hasClass('pmu-view-days')) {
                local_date.addMonths(i - current_cal);
                header = formatDate(local_date, options.title_format, options.locale);
            }
            if (!shown_date_to) {
                if (max_date) {
                    // If all dates in this month (months in year or years in years block) are after max option - set next month as current
                    // in order not to show calendar with all disabled dates
                    tmp_date = new Date(local_date);
                    if (options.select_day) {
                        tmp_date.addMonths(options.calendars - 1);
                    } else if (options.select_month) {
                        tmp_date.addYears(options.calendars - 1);
                    } else {
                        tmp_date.addYears((options.calendars - 1) * 12);
                    }
                    if (tmp_date > max_date) {
                        --i;
                        current_date.addMonths(-1);
                        shown_date_to = undefined;
                        continue;
                    }
                }
            }
            shown_date_to = new Date(local_date);
            if (!shown_date_from) {
                shown_date_from = new Date(local_date);
                // If all dates in this month are before min option - set next month as current in order not to show calendar with all disabled dates
                shown_date_from.setDate(1);
                shown_date_from.addMonths(1);
                shown_date_from.addDays(-1);
                if (min_date && min_date > shown_date_from) {
                    --i;
                    current_date.addMonths(1);
                    shown_date_from = undefined;
                    continue;
                }
            }
            instance
                .find('.pmu-month')
                .text(header);
            html = '';

            //;

            var is_year_selected = function (year) {
                return (
                        options.mode == 'range' &&
                        year >= new Date(actual_date[0]).getFullYear() &&
                        year <= new Date(actual_date[1]).getFullYear()
                    ) ||
                    (
                        options.mode == 'multiple' &&
                        actual_date.reduce(function (prev, current) {
                            prev.push(new Date(current).getFullYear());
                            return prev;
                        }, []).indexOf(year) !== -1
                    ) ||
                    new Date(actual_date).getFullYear() == year;
            };
            var is_months_selected = function (year, month) {
                var first_year = new Date(actual_date[0]).getFullYear(),
                    lastyear = new Date(actual_date[1]).getFullYear(),
                    first_month = new Date(actual_date[0]).getMonth(),
                    last_month = new Date(actual_date[1]).getMonth();
                return (
                        options.mode == 'range' &&
                        year > first_year &&
                        year < lastyear
                    ) ||
                    (
                        options.mode == 'range' &&
                        year == first_year &&
                        year < lastyear &&
                        month >= first_month
                    ) ||
                    (
                        options.mode == 'range' &&
                        year > first_year &&
                        year == lastyear &&
                        month <= last_month
                    ) ||
                    (
                        options.mode == 'range' &&
                        year == first_year &&
                        year == lastyear &&
                        month >= first_month &&
                        month <= last_month
                    ) ||
                    (
                        options.mode == 'multiple' &&
                        actual_date.reduce(function (prev, current) {
                            current = new Date(current);
                            prev.push(current.getFullYear() + '-' + current.getMonth());
                            return prev;
                        }, []).indexOf(year + '-' + month) !== -1
                    ) ||
                    (
                        new Date(actual_date).getFullYear() == year &&
                        new Date(actual_date).getMonth() == month
                    )
            };

            (function () {
                var years = [],
                    start_from_year = local_date.getFullYear() - 6,
                    min_year = new Date(options.min).getFullYear(),
                    max_year = new Date(options.max).getFullYear(),
                    year;
                for (var j = 0; j < 12; ++j) {
                    year = {
                        text: start_from_year + j,
                        class_name: []
                    };
                    if (
                        (
                            options.min && year.text < min_year
                        ) ||
                        (
                            options.max && year.text > max_year
                        )
                    ) {
                        year.class_name.push('pmu-disabled');
                    } else if (is_year_selected(year.text)) {
                        year.class_name.push('pmu-selected');
                    }
                    year.class_name = year.class_name.join(' ');
                    years.push(year);
                }
                html += tpl.body(years, 'pmu-years');
            })();
            (function () {
                var months = [],
                    current_year = local_date.getFullYear(),
                    min_year = new Date(options.min).getFullYear(),
                    min_month = new Date(options.min).getMonth(),
                    max_year = new Date(options.max).getFullYear(),
                    max_month = new Date(options.max).getMonth(),
                    month;
                for (var j = 0; j < 12; ++j) {
                    month = {
                        text: options.locale.monthsShort[j],
                        class_name: []
                    };
                    if (
                        (
                            options.min &&
                            (
                                current_year < min_year ||
                                (
                                    j < min_month && current_year == min_year
                                )
                            )
                        ) ||
                        (
                            options.max &&
                            (
                                current_year > max_year ||
                                (
                                    j > max_month && current_year >= max_year
                                )
                            )
                        )
                    ) {
                        month.class_name.push('pmu-disabled');
                    } else if (is_months_selected(current_year, j)) {
                        month.class_name.push('pmu-selected');
                    }
                    month.class_name = month.class_name.join(' ');
                    months.push(month);
                }
                html += tpl.body(months, 'pmu-months');
            })();
            (function () {
                var days = [],
                    current_month = local_date.getMonth(),
                    day;
                // Correct first day in calendar taking into account first day of week (Sunday or Monday)
                (function () {
                    local_date.setDate(1);
                    var day = (local_date.getDay() - options.first_day) % 7;
                    local_date.addDays(-(day + (day < 0 ? 7 : 0)));
                })();
                for (var j = 0; j < 42; ++j) {
                    day = {
                        text: local_date.getDate(),
                        class_name: []
                    };
                    if (current_month != local_date.getMonth()) {
                        day.class_name.push('pmu-not-in-month');
                    }
                    if (local_date.getDay() == 0) {
                        day.class_name.push('pmu-sunday');
                    } else if (local_date.getDay() == 6) {
                        day.class_name.push('pmu-saturday');
                    }
                    var from_user = options.render(new Date(local_date)) || {},
                        val = local_date.valueOf(),
                        disabled = (options.min && options.min > local_date) || (options.max && options.max < local_date);
                    if (from_user.disabled || disabled) {
                        day.class_name.push('pmu-disabled');
                    } else if (
                        from_user.selected ||
                        options.date == val ||
                        $.inArray(val, options.date) !== -1 ||
                        (
                            options.mode == 'range' && val >= options.date[0] && val <= options.date[1]
                        )
                    ) {
                        day.class_name.push('pmu-selected');
                    }
                    if (val == today) {
                        day.class_name.push('pmu-today');
                    }
                    if (from_user.class_name) {
                        day.class_name.push(from_user.class_name);
                    }
                    day.class_name = day.class_name.join(' ');
                    days.push(day);
                    // Move to next day
                    local_date.addDays(1);
                }

                //;

                html += tpl.body(days, 'pmu-days');
            })();
            instance.append(html);
        }
        shown_date_from.setDate(1);
        shown_date_to.setDate(1);
        shown_date_to.addMonths(1);
        shown_date_to.addDays(-1);
        pickmeup.find('.pmu-prev').css(
            'visibility',
            options.min && options.min >= shown_date_from ? 'hidden' : 'visible'
        );
        pickmeup.find('.pmu-next').css(
            'visibility',
            options.max && options.max <= shown_date_to ? 'hidden' : 'visible'
        );
        options.fill.apply(this);
    }

    function parseDate(date, format, separator, locale) {
        if (date.constructor == Date) {
            return date;
        } else if (!date) {
            return new Date;
        }
        var splitted_date = date.split(separator);
        if (splitted_date.length > 1) {
            splitted_date.forEach(function (element, index, array) {
                array[index] = parseDate($.trim(element), format, separator, locale);
            });
            return splitted_date;
        }
        var months_text = locale.monthsShort.join(')(') + ')(' + locale.months.join(')(');
        separator = new RegExp('[^0-9a-zA-Z(' + months_text + ')]+')
        var parts = date.split(separator),
            against = format.split(separator),
            d,
            m,
            y,
            h,
            min,
            now = new Date();
        for (var i = 0; i < parts.length; i++) {
            switch (against[i]) {
                case 'b':
                    m = locale.monthsShort.indexOf(parts[i]);
                    break;
                case 'B':
                    m = locale.months.indexOf(parts[i]);
                    break;
                case 'd':
                case 'e':
                    d = parseInt(parts[i], 10);
                    break;
                case 'm':
                    m = parseInt(parts[i], 10) - 1;
                    break;
                case 'Y':
                case 'y':
                    y = parseInt(parts[i], 10);
                    y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
                    break;
                case 'H':
                case 'I':
                case 'k':
                case 'l':
                    h = parseInt(parts[i], 10);
                    break;
                case 'P':
                case 'p':
                    if (/pm/i.test(parts[i]) && h < 12) {
                        h += 12;
                    } else if (/am/i.test(parts[i]) && h >= 12) {
                        h -= 12;
                    }
                    break;
                case 'M':
                    min = parseInt(parts[i], 10);
                    break;
            }
        }
        var parsed_date = new Date(
            y === undefined ? now.getFullYear() : y,
            m === undefined ? now.getMonth() : m,
            d === undefined ? now.getDate() : d,
            h === undefined ? now.getHours() : h,
            min === undefined ? now.getMinutes() : min,
            0
        );
        if (isNaN(parsed_date * 1)) {
            parsed_date = new Date;
        }
        return parsed_date;
    }

    function formatDate(date, format, locale) {

        //;

        var m = date.getMonth();
        var d = date.getDate();
        var y = date.getFullYear();
        var w = date.getDay();
        var s = {};
        var hr = date.getHours();
        var pm = (hr >= 12);
        var ir = (pm) ? (hr - 12) : hr;
        var dy = date.getDayOfYear();
        if (ir == 0) {
            ir = 12;
        }
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var parts = format.split(''), part;
        for (var i = 0; i < parts.length; i++) {
            part = parts[i];
            switch (part) {
                case 'a':
                    part = locale.daysShort[w];
                    break;
                case 'A':
                    part = locale.days[w];
                    break;
                case 'b':
                    part = locale.monthsShort[m];
                    break;
                case 'B':
                    part = locale.months[m];
                    break;
                case 'C':
                    part = 1 + Math.floor(y / 100);
                    break;
                case 'd':
                    part = (d < 10) ? ("0" + d) : d;
                    break;
                case 'e':
                    part = d;
                    break;
                case 'H':
                    part = (hr < 10) ? ("0" + hr) : hr;
                    break;
                case 'I':
                    part = (ir < 10) ? ("0" + ir) : ir;
                    break;
                case 'j':
                    part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
                    break;
                case 'k':
                    part = hr;
                    break;
                case 'l':
                    part = ir;
                    break;
                case 'm':
                    part = (m < 9) ? ("0" + (1 + m)) : (1 + m);
                    break;
                case 'M':
                    part = (min < 10) ? ("0" + min) : min;
                    break;
                case 'p':
                case 'P':
                    part = pm ? "PM" : "AM";
                    break;
                case 's':
                    part = Math.floor(date.getTime() / 1000);
                    break;
                case 'S':
                    part = (sec < 10) ? ("0" + sec) : sec;
                    break;
                case 'u':
                    part = w + 1;
                    break;
                case 'w':
                    part = w;
                    break;
                case 'y':
                    part = ('' + y).substr(2, 2);
                    break;
                case 'Y':
                    part = y;
                    break;
            }
            parts[i] = part;
        }
        return parts.join('');
    }

    function update_date() {

        //;

        var $this = $(this),
            options = $this.data('pickmeup-options'),
            current_date = options.current,
            new_value;
        switch (options.mode) {
            case 'multiple':
                new_value = current_date.setHours(0, 0, 0, 0).valueOf();
                if ($.inArray(new_value, options.date) !== -1) {
                    $.each(options.date, function (index, value) {
                        if (value == new_value) {
                            options.date.splice(index, 1);
                            return false;
                        }
                        return true;
                    });
                } else {
                    options.date.push(new_value);
                }
                break;
            case 'range':
                if (!options.lastSel) {
                    options.date[0] = current_date.setHours(0, 0, 0, 0).valueOf();
                }
                new_value = current_date.setHours(0, 0, 0, 0).valueOf();
                if (new_value <= options.date[0]) {
                    options.date[1] = options.date[0];
                    options.date[0] = new_value;
                } else {
                    options.date[1] = new_value;
                }
                options.lastSel = !options.lastSel;
                break;
            default:

                //;

                options.date    = current_date.valueOf();
                break;
        }
        var prepared_date = prepareDate(options);
        if ($this.is('input')) {
            $this.val(options.mode == 'single' ? prepared_date[0] : prepared_date[0].join(options.separator));
        }

        options.change.apply(this, prepared_date);
        if (!options.flat && options.hide_on_select && (options.mode != 'range' || !options.lastSel)
        ) {
            options.binded.hide();
            return false;
        }
    }

    function click(e) {

        //;

        var el = $(e.target);
        if (!el.hasClass('pmu-button')) {
            el = el.closest('.pmu-button');
        }
        if (el.length) {
            if (el.hasClass('pmu-disabled')) {
                return false;
            }
            var $this = $(this),
                options = $this.data('pickmeup-options'),
                instance = el.parents('.pmu-instance').eq(0),
                root = instance.parent(),
                instance_index = $('.pmu-instance', root).index(instance);
            if (el.parent().is('nav')) {
                if (el.hasClass('pmu-month')) {
                    options.current.addMonths(instance_index - Math.floor(options.calendars / 2));
                    if (root.hasClass('pmu-view-years')) {
                        // Shift back to current date, otherwise with min value specified may jump on few (tens) years forward
                        if (options.mode != 'single') {
                            options.current = new Date(options.date[options.date.length - 1]);
                        } else {
                            options.current = new Date(options.date);
                        }
                        if (options.select_day) {
                            root.removeClass('pmu-view-years').addClass('pmu-view-days');
                        } else if (options.select_month) {
                            root.removeClass('pmu-view-years').addClass('pmu-view-months');
                        }
                    } else if (root.hasClass('pmu-view-months')) {
                        if (options.select_year) {
                            root.removeClass('pmu-view-months').addClass('pmu-view-years');
                        } else if (options.select_day) {
                            root.removeClass('pmu-view-months').addClass('pmu-view-days');
                        }
                    } else if (root.hasClass('pmu-view-days')) {
                        if (options.select_month) {
                            root.removeClass('pmu-view-days').addClass('pmu-view-months');
                        } else if (options.select_year) {
                            root.removeClass('pmu-view-days').addClass('pmu-view-years');
                        }
                    }
                } else {
                    if (el.hasClass('pmu-prev')) {
                        options.binded.prev(false);
                    } else {
                        options.binded.next(false);
                    }
                }
            } else if (!el.hasClass('pmu-disabled')) {
                if (root.hasClass('pmu-view-years')) {
                    options.current.setFullYear(parseInt(el.text(), 10));
                    if (options.select_month) {
                        root.removeClass('pmu-view-years').addClass('pmu-view-months');
                    } else if (options.select_day) {
                        root.removeClass('pmu-view-years').addClass('pmu-view-days');
                    } else {
                        options.binded.update_date();
                    }
                } else if (root.hasClass('pmu-view-months')) {
                    options.current.setMonth(instance.find('.pmu-months .pmu-button').index(el));
                    options.current.setFullYear(parseInt(instance.find('.pmu-month').text(), 10));
                    if (options.select_day) {
                        root.removeClass('pmu-view-months').addClass('pmu-view-days');
                    } else {
                        options.binded.update_date();
                    }
                    // Move current month to the first place
                    options.current.addMonths(Math.floor(options.calendars / 2) - instance_index);
                } else {
                    var val = parseInt(el.text(), 10);
                    options.current.addMonths(instance_index - Math.floor(options.calendars / 2));
                    if (el.hasClass('pmu-not-in-month')) {
                        options.current.addMonths(val > 15 ? -1 : 1);
                    }
                    options.current.setDate(val);
                    options.binded.update_date();
                }
            }
            options.binded.fill();
        }
        return false;
    }

    function prepareDate(options) {
        var result;
        if (options.mode == 'single') {
            result = new Date(options.date);
            return [formatDate(result, options.format, options.locale), result];
        } else {
            result = [[], []];
            $.each(options.date, function (nr, val) {
                var date = new Date(val);
                result[0].push(formatDate(date, options.format, options.locale));
                result[1].push(date);
            });
            return result;
        }
    }

    function show(force) {

        var pickmeup = this.pickmeup;
        if (force || !pickmeup.is(':visible')) {
            var $this = $(this),
                options = $this.data('pickmeup-options'),
                pos = $this.offset(),
                viewport = {
                    l: document.documentElement.scrollLeft,
                    t: document.documentElement.scrollTop,
                    w: document.documentElement.clientWidth,
                    h: document.documentElement.clientHeight
                },
                top = pos.top,
                left = pos.left;
            options.binded.fill();
            if ($this.is('input')) {
                $this
                //.pickmeup('set_date', parseDate($this.val() ? $this.val() : options.default_date, options.format, options.separator, options.locale))
                    .keydown(function (e) {

                        e.stopPropagation();

                        if (e.which == 9) {
                            $this.pickmeup('hide');
                        }
                    }).blur(function () {


                    if ($this.val() !== '') {
                        $this.pickmeup('set_date', (parseDate($this.val(), options.format, options.separator, options.locale)));
                        //options.current.setDate($this.val());
                        options.binded.update_date();
                    }


                });
                options.lastSel = false;
            }
            options.before_show();
            if (options.show() == false) {
                return;
            }
            if (!options.flat) {
                switch (options.position) {
                    case 'top':
                        top -= pickmeup.outerHeight();
                        break;
                    case 'left':
                        left -= pickmeup.outerWidth();
                        break;
                    case 'right':
                        left += this.offsetWidth;
                        break;
                    case 'bottom':
                        top += this.offsetHeight;
                        break;
                }
                if (top + pickmeup.offsetHeight > viewport.t + viewport.h) {
                    top = pos.top - pickmeup.offsetHeight;
                }
                if (top < viewport.t) {
                    top = pos.top + this.offsetHeight + pickmeup.offsetHeight;
                }
                if (left + pickmeup.offsetWidth > viewport.l + viewport.w) {
                    left = pos.left - pickmeup.offsetWidth;
                }
                if (left < viewport.l) {
                    left = pos.left + this.offsetWidth
                }
                pickmeup.css({
                    display: 'inline-block',
                    top: top + 'px',
                    left: left + 'px'
                });
                $(document)
                    .on(
                        namespaced_events(options.trigger_event, options.events_namespace),
                        options.binded.hide
                    )
                    .on(
                        'resize' + options.events_namespace,
                        [
                            true
                        ],
                        options.binded.forced_show
                    );
            }
        }
    }

    function forced_show() {
        show.call(this, true);
    }

    function hide(e) {
        if (
            !e || !e.target ||                                                        //Called directly
            (
                e.target != this &&                                                //Clicked not on element itself
                !(this.pickmeup.get(0).compareDocumentPosition(e.target) & 16)    //And not o its children
            )
        ) {
            var pickmeup = this.pickmeup,
                options = $(this).data('pickmeup-options');
            if (options.hide() != false) {
                pickmeup.hide();
                $(document)
                    .off(namespaced_events(options.trigger_event, options.events_namespace), options.binded.hide)
                    .off('resize', options.binded.forced_show);
                options.lastSel = false;
            }
        }
    }

    function update() {

        var options = $(this).data('pickmeup-options');
        $(document)
            .off(namespaced_events(options.trigger_event, options.events_namespace), options.binded.hide)
            .off('resize', options.binded.forced_show);
        options.binded.forced_show();
    }

    function clear() {
        var options = $(this).data('pickmeup-options');
        if (options.mode != 'single') {
            options.date = [];
            options.lastSel = false;
            options.binded.fill();
        }
    }

    function prev(fill) {
        if (typeof fill == 'undefined') {
            fill = true;
        }
        var root = this.pickmeup;
        var options = $(this).data('pickmeup-options');
        if (root.hasClass('pmu-view-years')) {
            options.current.addYears(-12);
        } else if (root.hasClass('pmu-view-months')) {
            options.current.addYears(-1);
        } else if (root.hasClass('pmu-view-days')) {
            options.current.addMonths(-1);
        }
        if (fill) {
            options.binded.fill();
        }
    }

    function next(fill) {
        if (typeof fill == 'undefined') {
            fill = true;
        }
        var root = this.pickmeup;
        var options = $(this).data('pickmeup-options');
        if (root.hasClass('pmu-view-years')) {
            options.current.addYears(12);
        } else if (root.hasClass('pmu-view-months')) {
            options.current.addYears(1);
        } else if (root.hasClass('pmu-view-days')) {
            options.current.addMonths(1);
        }
        if (fill) {
            options.binded.fill();
        }
    }

    function get_date(formatted) {
        var options = $(this).data('pickmeup-options'),
            prepared_date = prepareDate(options);
        if (typeof formatted === 'string') {
            var date = prepared_date[1];
            if (date.constructor == Date) {
                return formatDate(date, formatted, options.locale)
            } else {
                return date.map(function (value) {
                    return formatDate(value, formatted, options.locale);
                });
            }
        } else {
            return prepared_date[formatted ? 0 : 1];
        }
    }

    function set_date(date) {

        var $this = $(this),
            options = $this.data('pickmeup-options');
        options.date = date;
        if (typeof options.date === 'string') {
            options.date = parseDate(options.date, options.format, options.separator, options.locale).setHours(0, 0, 0, 0);
        } else if (options.date.constructor == Date) {
            options.date.setHours(0, 0, 0, 0);
        }
        if (!options.date) {
            options.date = new Date;
            options.date.setHours(0, 0, 0, 0);
        }
        if (options.mode != 'single') {
            if (options.date.constructor != Array) {
                options.date = [options.date.valueOf()];
                if (options.mode == 'range') {
                    options.date.push(((new Date(options.date[0])).setHours(0, 0, 0, 0)).valueOf());
                }
            } else {
                for (var i = 0; i < options.date.length; i++) {
                    options.date[i] = (parseDate(options.date[i], options.format, options.separator, options.locale).setHours(0, 0, 0, 0)).valueOf();
                }
                if (options.mode == 'range') {
                    options.date[1] = ((new Date(options.date[1])).setHours(0, 0, 0, 0)).valueOf();
                }
            }
        } else {
            if ($this.val() || options.default_date !== false) {
                options.date = options.date.constructor == Array ? options.date[0].valueOf() : options.date.valueOf();
            }
        }
        options.current = new Date(options.mode != 'single' ? options.date[0] : options.date);
        options.binded.fill();
        if ($this.is('input') && options.default_date !== false) {

            //;
            //;

            var prepared_date = prepareDate(options);
            if (!$this.val()) {
                options.change.apply(this, prepared_date);
            }
            $this.val(options.mode == 'single' ? prepared_date[0] : prepared_date[0].join(options.separator));
        }
    }

    function destroy() {
        var $this = $(this),
            options = $this.data('pickmeup-options');
        $this.removeData('pickmeup-options');
        $this.off(options.events_namespace);
        $(document).off(options.events_namespace);
        $(this.pickmeup).remove();
    }

    $.fn.pickmeup = function (initial_options) {
        if (typeof initial_options === 'string') {
            var data,
                parameters = Array.prototype.slice.call(arguments, 1);
            switch (initial_options) {
                case 'hide':
                case 'show':
                case 'clear':
                case 'update':
                case 'prev':
                case 'next':
                case 'destroy':
                    this.each(function () {
                        data = $(this).data('pickmeup-options');
                        if (data) {
                            data.binded[initial_options]();
                        }
                    });
                    break;
                case 'get_date':
                    data = this.data('pickmeup-options');
                    if (data) {
                        return data.binded.get_date(parameters[0]);
                    } else {
                        return null;
                    }
                    break;
                case 'set_date':
                    this.each(function () {
                        data = $(this).data('pickmeup-options');
                        if (data) {
                            data.binded[initial_options].apply(this, parameters);
                        }
                    });
            }
            return this;
        }
        return this.each(function () {
            var $this = $(this);
            if ($this.data('pickmeup-options')) {
                return;
            }
            var i,
                option,
                options = $.extend({}, $.pickmeup, initial_options || {});
            for (i in options) {
                option = $this.data('pmu-' + i);
                if (typeof option !== 'undefined') {
                    options[i] = option;
                }
            }
            // 4 conditional statements in order to account all cases
            if (options.view == 'days' && !options.select_day) {
                options.view = 'months';
            }
            if (options.view == 'months' && !options.select_month) {
                options.view = 'years';
            }
            if (options.view == 'years' && !options.select_year) {
                options.view = 'days';
            }
            if (options.view == 'days' && !options.select_day) {
                options.view = 'months';
            }
            options.calendars = Math.max(1, parseInt(options.calendars, 10) || 1);
            options.mode = /single|multiple|range/.test(options.mode) ? options.mode : 'single';
            if (typeof options.min === 'string') {
                options.min = parseDate(options.min, options.format, options.separator, options.locale).setHours(0, 0, 0, 0);
            } else if (options.min && options.min.constructor == Date) {
                options.min.setHours(0, 0, 0, 0);
            }
            if (typeof options.max === 'string') {
                options.max = parseDate(options.max, options.format, options.separator, options.locale).setHours(0, 0, 0, 0);
            } else if (options.max && options.max.constructor == Date) {
                options.max.setHours(0, 0, 0, 0);
            }
            if (!options.select_day) {
                if (options.min) {
                    options.min = new Date(options.min);
                    options.min.setDate(1);
                    options.min = options.min.valueOf();
                }
                if (options.max) {
                    options.max = new Date(options.max);
                    options.max.setDate(1);
                    options.max = options.max.valueOf();
                }
            }
            if (typeof options.date === 'string') {
                options.date = parseDate(options.date, options.format, options.separator, options.locale).setHours(0, 0, 0, 0);
            } else if (options.date.constructor == Date) {
                options.date.setHours(0, 0, 0, 0);
            }
            if (!options.date) {
                options.date = new Date;
                options.date.setHours(0, 0, 0, 0);
            }
            if (options.mode != 'single') {
                if (options.date.constructor != Array) {
                    options.date = [options.date.valueOf()];
                    if (options.mode == 'range') {
                        options.date.push(((new Date(options.date[0])).setHours(0, 0, 0, 0)).valueOf());
                    }
                } else {
                    for (i = 0; i < options.date.length; i++) {
                        options.date[i] = (parseDate(options.date[i], options.format, options.separator, options.locale).setHours(0, 0, 0, 0)).valueOf();
                    }
                    if (options.mode == 'range') {
                        options.date[1] = ((new Date(options.date[1])).setHours(0, 0, 0, 0)).valueOf();
                    }
                }
                options.current = new Date(options.date[options.date.length - 1]);
                // Set days to 1 in order to handle them consistently
                if (!options.select_day) {
                    for (i = 0; i < options.date.length; ++i) {
                        options.date[i] = new Date(options.date[i]);
                        options.date[i].setDate(1);
                        options.date[i] = options.date[i].valueOf();
                        // Remove duplicates
                        if (
                            options.mode != 'range' &&
                            options.date.indexOf(options.date[i]) !== i
                        ) {
                            delete options.date.splice(i, 1);
                            --i;
                        }
                    }
                }
            } else {
                options.date = options.date.valueOf();
                options.current = new Date(options.date);
                if (!options.select_day) {
                    options.date = new Date(options.date);
                    options.date.setDate(1);
                    options.date = options.date.valueOf();
                }
            }
            options.current.setDate(1);
            options.current.setHours(0, 0, 0, 0);
            var cnt,
                pickmeup = $(tpl.wrapper);
            this.pickmeup = pickmeup;
            if (options.class_name) {
                pickmeup.addClass(options.class_name);
            }
            var html = '';
            for (i = 0; i < options.calendars; i++) {
                cnt = options.first_day;
                html += tpl.head({
                    prev: options.prev,
                    next: options.next,
                    day: [
                        options.locale.daysMin[(cnt++) % 7],
                        options.locale.daysMin[(cnt++) % 7],
                        options.locale.daysMin[(cnt++) % 7],
                        options.locale.daysMin[(cnt++) % 7],
                        options.locale.daysMin[(cnt++) % 7],
                        options.locale.daysMin[(cnt++) % 7],
                        options.locale.daysMin[(cnt++) % 7]
                    ]
                });
            }
            $this.data('pickmeup-options', options);
            for (i in options) {
                //if (['render', 'change', 'before_show', 'show', 'hide'].indexOf(i) != -1) {
                if (['render', 'before_show', 'show', 'hide'].indexOf(i) != -1) {
                    options[i] = options[i].bind(this);
                }
            }
            options.binded = {
                fill: fill.bind(this),
                update_date: update_date.bind(this),
                click: click.bind(this),
                show: show.bind(this),
                forced_show: forced_show.bind(this),
                hide: hide.bind(this),
                update: update.bind(this),
                clear: clear.bind(this),
                prev: prev.bind(this),
                next: next.bind(this),
                get_date: get_date.bind(this),
                set_date: set_date.bind(this),
                destroy: destroy.bind(this)
            };
            options.events_namespace = '.pickmeup-' + (++instances_count);
            pickmeup
                .on(namespaced_events(options.trigger_event, options.events_namespace), options.binded.click)
                .addClass(views[options.view])
                .append(html)
                .on(
                    $.support.selectstart ? 'selectstart' : 'mousedown',
                    function (e) {
                        e.preventDefault();
                    }
                );
            options.binded.fill();
            if (options.flat) {
                pickmeup.appendTo(this).css({
                    position: 'relative',
                    display: 'inline-block'
                });
            } else {
                pickmeup.appendTo(document.body);
                $this.on(namespaced_events(options.trigger_event, options.events_namespace), options.binded.show);
            }
        });
    };
}));*/

/**
 * @package PickMeUp
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @author  Stefan Petre <www.eyecon.ro>
 * @license 0BSD
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        //noinspection JSUnresolvedFunction
        define(factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.pickmeup = factory();
    }
}(this, function () {
    /**
     * Functions prefixed with `dom_` are simple convenient wrappers for various operations with DOM
     */

    /**
     * @param {(Element|NodeList)} element
     * @param {Function}           callback
     * @param {*}                  [args=[]]
     */
    function dom_for_collection (element, callback, args) {
        args = args || [];
        if (element instanceof Element) {
            callback.apply(callback, [element].concat(args));
        } else {
            var elements, i;
            elements = element.length;
            for (i = 0; i < elements; ++i) {
                callback.apply(callback, [element[i]].concat(args));
            }
        }
    }

    /**
     * @param {(Element|Element[]|NodeList)} element
     */
    function dom_remove (element) {
        dom_for_collection(element, function (element) {
            element.parentElement.removeChild(element);
        });
    }

    /**
     * @param {Element} element
     * @param {string}  selector
     *
     * @returns {Element}
     */
    function dom_closest_parent (element, selector) {
        var parent = element;
        do {
            parent = parent.parentElement;
        } while (parent && !dom_matches(parent, selector));
        return parent;
    }

    /**
     * @param {Element} element
     * @param {string}  selector
     *
     * @returns {boolean}
     */
    function dom_matches (element, selector) {
        return (element.matches || element.webkitMatchesSelector || element.msMatchesSelector).call(element, selector);
    }

    /**
     * @param {Element} element
     * @param {string}  class_name
     *
     * @returns {boolean}
     */
    function dom_has_class (element, class_name) {
        return element && element.classList.contains(class_name);
    }

    /**
     * @param {Element} element
     * @param {string}  class_name
     */
    function dom_add_class (element, class_name) {
        element.classList.add(class_name);
    }

    /**
     * @param {Element} element
     * @param {string}  class_name
     */
    function dom_remove_class (element, class_name) {
        element.classList.remove(class_name);
    }

    /**
     * @param {Element} element
     * @param {string}  selector
     *
     * @returns {Element}
     */
    function dom_query (element, selector) {
        return element.querySelector(selector);
    }

    /**
     * @param {Element} element
     * @param {string}  selector
     *
     * @returns {Element[]}
     */
    function dom_query_all (element, selector) {
        return Array.prototype.slice.call(element.querySelectorAll(selector));
    }

    /**
     * @param {Element}          target
     * @param {(Element|Window)} element
     * @param {string}           event
     * @param {Function}         callback
     */
    function dom_on (target, element, event, callback) {
        if (event.indexOf(' ') !== -1) {
            var events        = event.split(' '),
                events_number = events.length,
                i;
            for (i = 0; i < events_number; ++i) {
                dom_on(target, element, events[i], callback);
            }
        } else {
            target.__pickmeup.events.push([element, event, callback]);
            element.addEventListener(event, callback);
        }
    }

    /**
     * @param {Element}          target
     * @param {(Element|Window)} [element=undefined]
     * @param {string}           [event='']
     * @param {Function}         [callback=undefined]
     */
    function dom_off (target, element, event, callback) {
        var events,
            events_number,
            i;
        if (event && event.indexOf(' ') !== -1) {
            events        = event.split(' ');
            events_number = events.length;
            for (i = 0; i < events_number; ++i) {
                dom_off(target, element, events[i], callback);
            }
        } else {
            events        = target.__pickmeup.events;
            events_number = events.length;
            for (i = 0; i < events_number; ++i) {
                if (
                    (element && element !== events[i][0]) ||
                    (event && event !== events[i][1]) ||
                    (callback && callback !== events[i][2])
                ) {
                    continue;
                }
                events[i][0].removeEventListener(events[i][1], events[i][2]);
            }
        }
    }

    /**
     * @param {Element} element
     *
     * @returns {{top: number, left: number}}
     */
    function dom_offset (element) {
        var rect = element.getBoundingClientRect();
        return {
            top  : rect.top + window.pageYOffset - document.documentElement.clientTop,
            left : rect.left + window.pageXOffset - document.documentElement.clientLeft
        };
    }

    /**
     * @param {Element} element
     * @param {string}  event
     * @param {Object}  [detail=undefined]
     *
     * @return {boolean}
     */
    function dom_dispatch_event (element, event, detail) {
        var e = document.createEvent('Event');
        if (detail) {
            e.detail = detail;
        }
        e.initEvent('pickmeup-' + event, false, true);
        return element.dispatchEvent(e);
    }

    /**
     * Functions prefixed with `date_` are simple convenient wrappers for various operations with dates
     */

    /**
     * @param {Date} date
     *
     * @returns {number}
     */
    function date_get_max_days (date) {
        var tmpDate = new Date(date),
            d       = 28,
            m       = tmpDate.getMonth();
        while (tmpDate.getMonth() === m) {
            ++d;
            tmpDate.setDate(d);
        }
        return d - 1;
    }

    /**
     * @param {Date}   date
     * @param {number} number_of_days
     */
    function date_add_days (date, number_of_days) {
        date.setDate(date.getDate() + number_of_days);
    }

    /**
     * @param {Date}   date
     * @param {number} number_of_months
     */
    function date_add_months (date, number_of_months) {
        var day = date.getDate();
        date.setDate(1);
        date.setMonth(date.getMonth() + number_of_months);
        date.setDate(Math.min(day, date_get_max_days(date)));
    }

    /**
     * @param {Date}   date
     * @param {number} number_of_years
     */
    function date_add_years (date, number_of_years) {
        var day = date.getDate();
        date.setDate(1);
        date.setFullYear(date.getFullYear() + number_of_years);
        date.setDate(Math.min(day, date_get_max_days(date)));
    }

    /**
     * @param {Date} date
     *
     * @returns {number}
     */
    function date_get_day_of_the_year (date) {
        var now  = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        var then = new Date(date.getFullYear(), 0, 0, 0, 0, 0);
        var time = now - then;
        return Math.floor(time / (24 * 60 * 60 * 1000));
    }

    /**
     * @param {Element} target
     */
    function fill (target) {
        var root_element = target.__pickmeup.element,
            options      = target.__pickmeup.options,
            current_cal  = Math.floor(options.calendars / 2),
            actual_date  = options.date,
            current_date = options.current,
            min_date     = options.min ? new Date(options.min) : null,
            max_date     = options.max ? new Date(options.max) : null,
            local_date,
            header,
            instance,
            shown_date_from,
            shown_date_to,
            tmp_date;
        if (min_date) {
            min_date.setDate(1);
            date_add_months(min_date, 1);
            date_add_days(min_date, -1);
        }
        if (max_date) {
            max_date.setDate(1);
            date_add_months(max_date, 1);
            date_add_days(max_date, -1);
        }
        /**
         * Remove old content except header navigation
         */
        dom_remove(dom_query_all(root_element, '.pmu-instance > :not(nav)'));
        /**
         * If several calendars should be shown
         */
        for (var i = 0; i < options.calendars; i++) {
            local_date = new Date(current_date);
            reset_time(local_date);
            instance = dom_query_all(root_element, '.pmu-instance')[i];
            if (dom_has_class(root_element, 'pmu-view-years')) {
                date_add_years(local_date, (i - current_cal) * 12);
                header = (local_date.getFullYear() - 6) + ' - ' + (local_date.getFullYear() + 5);
            } else if (dom_has_class(root_element, 'pmu-view-months')) {
                date_add_years(local_date, i - current_cal);
                header = local_date.getFullYear();
            } else if (dom_has_class(root_element, 'pmu-view-days')) {
                date_add_months(local_date, i - current_cal);
                if (typeof options.title_format === 'function') {
                    header = options.title_format(local_date, options.locales[options.locale]);
                } else {
                    header = format_date(local_date, options.title_format, options.locales[options.locale]);
                }
            }
            if (!shown_date_to) {
                if (max_date) {
                    // If all dates in this month (months in year or years in years block) are after max option - set next month as current
                    // in order not to show calendar with all disabled dates
                    tmp_date = new Date(local_date);
                    if (options.select_day) {
                        date_add_months(tmp_date, options.calendars - 1);
                    } else if (options.select_month) {
                        date_add_years(tmp_date, options.calendars - 1);
                    } else {
                        date_add_years(tmp_date, (options.calendars - 1) * 12);
                    }
                    if (tmp_date > max_date) {
                        --i;
                        date_add_months(current_date, -1);
                        shown_date_to = undefined;
                        continue;
                    }
                }
            }
            shown_date_to = new Date(local_date);
            if (!shown_date_from) {
                shown_date_from = new Date(local_date);
                // If all dates in this month are before min option - set next month as current in order not to show calendar with all disabled dates
                shown_date_from.setDate(1);
                date_add_months(shown_date_from, 1);
                date_add_days(shown_date_from, -1);
                if (min_date && min_date > shown_date_from) {
                    --i;
                    date_add_months(current_date, 1);
                    shown_date_from = undefined;
                    continue;
                }
            }
            dom_query(instance, '.pmu-month').innerHTML = header;
            var is_year_selected                        = function (year) {
                return (
                        options.mode === 'range' &&
                        year >= new Date(actual_date[0]).getFullYear() &&
                        year <= new Date(actual_date[1]).getFullYear()
                    ) ||
                    (
                        options.mode === 'multiple' &&
                        actual_date.reduce(function (prev, current) {
                            prev.push(new Date(current).getFullYear());
                            return prev;
                        }, []).indexOf(year) !== -1
                    ) ||
                    new Date(actual_date).getFullYear() === year;
            };
            var is_months_selected                      = function (year, month) {
                var first_year  = new Date(actual_date[0]).getFullYear(),
                    lastyear    = new Date(actual_date[1]).getFullYear(),
                    first_month = new Date(actual_date[0]).getMonth(),
                    last_month  = new Date(actual_date[1]).getMonth();
                return (
                    (
                        options.mode === 'range' &&
                        (
                            (year > first_year && year < lastyear) ||
                            (year > first_year && year === lastyear && month <= last_month) ||
                            (year === first_year && year < lastyear && month >= first_month) ||
                            (year === first_year && year === lastyear && month >= first_month && month <= last_month)
                        )
                    ) ||
                    (
                        options.mode === 'multiple' &&
                        actual_date.reduce(function (prev, current) {
                            current = new Date(current);
                            prev.push(current.getFullYear() + '-' + current.getMonth());
                            return prev;
                        }, []).indexOf(year + '-' + month) !== -1
                    ) ||
                    (
                        new Date(actual_date).getFullYear() === year &&
                        new Date(actual_date).getMonth() === month
                    )
                );
            };
            (function () {
                var years_elements  = [],
                    start_from_year = local_date.getFullYear() - 6,
                    min_year        = new Date(options.min).getFullYear(),
                    max_year        = new Date(options.max).getFullYear(),
                    year,
                    year_element,
                    j;
                for (j = 0; j < 12; ++j) {
                    year                         = start_from_year + j;
                    year_element                 = document.createElement('div');
                    year_element.textContent     = year;
                    year_element.__pickmeup_year = year;
                    if (
                        (options.min && year < min_year) ||
                        (options.max && year > max_year)
                    ) {
                        dom_add_class(year_element, 'pmu-disabled');
                    } else if (is_year_selected(year)) {
                        dom_add_class(year_element, 'pmu-selected');
                    }
                    years_elements.push(year_element);
                }
                instance.appendChild(options.instance_content_template(years_elements, 'pmu-years'));
            })();
            (function () {
                var months_elements = [],
                    current_year    = local_date.getFullYear(),
                    min_year        = new Date(options.min).getFullYear(),
                    min_month       = new Date(options.min).getMonth(),
                    max_year        = new Date(options.max).getFullYear(),
                    max_month       = new Date(options.max).getMonth(),
                    month,
                    month_element;
                for (month = 0; month < 12; ++month) {
                    month_element                  = document.createElement('div');
                    month_element.textContent      = options.locales[options.locale].monthsShort[month];
                    month_element.__pickmeup_month = month;
                    month_element.__pickmeup_year  = current_year;
                    if (
                        (
                            options.min &&
                            (
                                current_year < min_year ||
                                (
                                    month < min_month && current_year === min_year
                                )
                            )
                        ) ||
                        (
                            options.max &&
                            (
                                current_year > max_year ||
                                (
                                    month > max_month && current_year >= max_year
                                )
                            )
                        )
                    ) {
                        dom_add_class(month_element, 'pmu-disabled');
                    } else if (is_months_selected(current_year, month)) {
                        dom_add_class(month_element, 'pmu-selected');
                    }
                    months_elements.push(month_element);
                }
                instance.appendChild(options.instance_content_template(months_elements, 'pmu-months'));
            })();
            (function () {
                var days_elements = [],
                    current_month = local_date.getMonth(),
                    today         = reset_time(new Date).valueOf(),
                    day,
                    day_element,
                    from_user,
                    val,
                    disabled,
                    selected;
                // Correct first day in calendar taking into account the first day of the week (Sunday or Monday)
                (function () {
                    local_date.setDate(1);
                    var day = (local_date.getDay() - options.first_day) % 7;
                    date_add_days(local_date, -(day + (day < 0 ? 7 : 0)));
                })();
                for (day = 0; day < 42; ++day) {
                    day_element                  = document.createElement('div');
                    day_element.textContent      = local_date.getDate();
                    day_element.__pickmeup_day   = local_date.getDate();
                    day_element.__pickmeup_month = local_date.getMonth();
                    day_element.__pickmeup_year  = local_date.getFullYear();
                    if (current_month !== local_date.getMonth()) {
                        dom_add_class(day_element, 'pmu-not-in-month');
                    }
                    if (local_date.getDay() === 0) {
                        dom_add_class(day_element, 'pmu-sunday');
                    } else if (local_date.getDay() === 6) {
                        dom_add_class(day_element, 'pmu-saturday');
                    }
                    from_user = options.render(new Date(local_date)) || {};
                    // We only reset time for this value in order to deal with Summer/Winter time, but changing `local_date` itself will break days incrementing
                    val       = reset_time(new Date(local_date)).valueOf();
                    disabled  =
                        (options.min && options.min > local_date) ||
                        (options.max && options.max < local_date);
                    selected  =
                        options.date.valueOf() === val ||
                        (
                            options.date instanceof Array &&
                            options.date.reduce(function (prev, date) {
                                return prev || val === date.valueOf();
                            }, false)
                        ) ||
                        (
                            options.mode === 'range' && val >= options.date[0] && val <= options.date[1]
                        );
                    if (from_user.disabled || (!('disabled' in from_user) && disabled)) {
                        dom_add_class(day_element, 'pmu-disabled');
                    } else if (from_user.selected || (!('selected' in from_user) && selected)) {
                        dom_add_class(day_element, 'pmu-selected');
                    }
                    if (val === today) {
                        dom_add_class(day_element, 'pmu-today');
                    }
                    if (from_user.class_name) {
                        from_user.class_name.split(' ').forEach(
                            dom_add_class.bind(day_element, day_element)
                        );
                    }
                    days_elements.push(day_element);
                    // Move to the next day
                    date_add_days(local_date, 1);
                }
                instance.appendChild(options.instance_content_template(days_elements, 'pmu-days'));
            })();
        }
        shown_date_from.setDate(1);
        shown_date_to.setDate(1);
        date_add_months(shown_date_to, 1);
        date_add_days(shown_date_to, -1);
        var prev = dom_query(root_element, '.pmu-prev'),
            next = dom_query(root_element, '.pmu-next');
        if (prev) {
            prev.style.visibility = options.min && options.min >= shown_date_from ? 'hidden' : 'visible';
        }
        if (next) {
            next.style.visibility = options.max && options.max <= shown_date_to ? 'hidden' : 'visible';
        }
        dom_dispatch_event(target, 'fill');
    }

    function parse_date (date, options) {
        var format    = options.format,
            separator = options.separator,
            locale    = options.locales[options.locale],
            i;
        if (date instanceof Date || typeof date === 'number') {
            return reset_time(new Date(date));
        } else if (!date) {
            return reset_time(new Date);
        } else if (date instanceof Array) {
            date = date.slice();
            for (i = 0; i < date.length; ++i) {
                date[i] = parse_date(date[i], options);
            }
            return date;
        }
        var splitted_date = date.split(separator);
        if (splitted_date.length > 1) {
            splitted_date.forEach(function (element, index, array) {
                array[index] = parse_date(element.trim(), options);
            });
            return splitted_date;
        }
        separator   = [].concat(locale.daysShort, locale.daysMin, locale.days, locale.monthsShort, locale.months);
        separator   = separator.map(function (item) {
            return '(' + item + ')';
        });
        separator   = new RegExp('[^0-9a-zA-Z' + separator.join('') + ']+');
        var parts   = date.split(separator),
            against = format.split(separator),
            d,
            m,
            y,
            h,
            min,
            now     = new Date();
        for (i = 0; i < parts.length; i++) {
            switch (against[i]) {
                case 'b':
                    m = locale.monthsShort.indexOf(parts[i]);
                    break;
                case 'B':
                    m = locale.months.indexOf(parts[i]);
                    break;
                case 'd':
                case 'e':
                case 't':
                    d = parseInt(parts[i], 10);
                    break;
                case 'm':
                    m = parseInt(parts[i], 10) - 1;
                    break;
                case 'Y':
                case 'y':
                    y = parseInt(parts[i], 10);
                    y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
                    break;
                case 'H':
                case 'I':
                case 'k':
                case 'l':
                    h = parseInt(parts[i], 10);
                    break;
                case 'P':
                case 'p':
                    if (/pm/i.test(parts[i]) && h < 12) {
                        h += 12;
                    } else if (/am/i.test(parts[i]) && h >= 12) {
                        h -= 12;
                    }
                    break;
                case 'M':
                    min = parseInt(parts[i], 10);
                    break;
            }
        }
        var parsed_date = new Date(
            y === undefined ? now.getFullYear() : y,
            m === undefined ? now.getMonth() : m,
            d === undefined ? now.getDate() : d,
            h === undefined ? now.getHours() : h,
            min === undefined ? now.getMinutes() : min,
            0
        );
        if (isNaN(parsed_date * 1)) {
            parsed_date = new Date;
        }
        return reset_time(parsed_date);
    }

    function reset_time (date) {
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function format_date (date, format, locale) {
        var m  = date.getMonth();
        var d  = date.getDate();
        var y  = date.getFullYear();
        var w  = date.getDay();
        var hr = date.getHours();
        var pm = (hr >= 12);
        var ir = (pm) ? (hr - 12) : hr;
        var dy = date_get_day_of_the_year(date);
        if (ir === 0) {
            ir = 12;
        }
        var min   = date.getMinutes();
        var sec   = date.getSeconds();
        var parts = format.split(''), part;
        for (var i = 0; i < parts.length; i++) {
            part = parts[i];
            switch (part) {
                case 'a':
                    part = locale.daysShort[w];
                    break;
                case 'A':
                    part = locale.days[w];
                    break;
                case 'b':
                    part = locale.monthsShort[m];
                    break;
                case 'B':
                    part = locale.months[m];
                    break;
                case 'C':
                    part = 1 + Math.floor(y / 100);
                    break;
                case 'd':
                    part = (d < 10) ? ("0" + d) : d;
                    break;
                case 'e':
                    part = d;
                    break;
                case 'H':
                    part = (hr < 10) ? ("0" + hr) : hr;
                    break;
                case 'I':
                    part = (ir < 10) ? ("0" + ir) : ir;
                    break;
                case 'j':
                    part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
                    break;
                case 'k':
                    part = hr;
                    break;
                case 'l':
                    part = ir;
                    break;
                case 'm':
                    part = (m < 9) ? ("0" + (1 + m)) : (1 + m);
                    break;
                case 'M':
                    part = (min < 10) ? ("0" + min) : min;
                    break;
                case 'p':
                case 'P':
                    part = pm ? "PM" : "AM";
                    break;
                case 's':
                    part = Math.floor(date.getTime() / 1000);
                    break;
                case 'S':
                    part = (sec < 10) ? ("0" + sec) : sec;
                    break;
                case 't':
                    // Calculate the last day of the month
                    part = new Date(y, m + 1, 0).getDate();
                    break;
                case 'u':
                    part = w + 1;
                    break;
                case 'w':
                    part = w;
                    break;
                case 'y':
                    part = ('' + y).substr(2, 2);
                    break;
                case 'Y':
                    part = y;
                    break;
            }
            parts[i] = part;
        }
        return parts.join('');
    }

    /**
     * @param {Element} target
     * @param {Date}    new_date
     */
    function update_date (target, new_date) {
        var options = target.__pickmeup.options,
            i;
        reset_time(new_date);
        (function () {
            var new_value;
            switch (options.mode) {
                case 'multiple':
                    new_value = new_date.valueOf();
                    for (i = 0; i < options.date.length; ++i) {
                        if (options.date[i].valueOf() === new_value) {
                            options.date.splice(i, 1);
                            return;
                        }
                    }
                    options.date.push(new_date);
                    break;
                case 'range':
                    if (!options.lastSel) {
                        options.date[0] = new_date;
                    }
                    if (new_date <= options.date[0]) {
                        options.date[1] = options.date[0];
                        options.date[0] = new_date;
                    } else {
                        options.date[1] = new_date;
                    }
                    options.lastSel = !options.lastSel;
                    break;
                default:
                    options.date = new_date.valueOf();
                    break;
            }
        })();
        var prepared_date = prepare_date(options);
        if (dom_matches(target, 'input')) {
            //noinspection JSUndefinedPropertyAssignment
            target.value = options.mode === 'single' ? prepared_date.formatted_date : prepared_date.formatted_date.join(options.separator);
        }
        dom_dispatch_event(target, 'change', prepared_date);
        if (
            !options.flat &&
            options.hide_on_select &&
            (
                options.mode !== 'range' || !options.lastSel
            )
        ) {
            options.bound.hide();
        }
    }

    /**
     * @param {Element} target
     * @param {Event}   event
     *
     * @returns {boolean}
     */
    function click (target, event) {
        //noinspection JSValidateTypes
        /**
         * @type {Element}
         */
        var element = event.target;
        if (!dom_has_class(element, 'pmu-button')) {
            element = dom_closest_parent(element, '.pmu-button');
        }
        if (!dom_has_class(element, 'pmu-button') || dom_has_class(element, 'pmu-disabled')) {
            return false;
        }
        event.preventDefault();
        event.stopPropagation();
        var options        = target.__pickmeup.options,
            instance       = dom_closest_parent(element, '.pmu-instance'),
            root           = instance.parentElement,
            instance_index = dom_query_all(root, '.pmu-instance').indexOf(instance);
        if (dom_matches(element.parentElement, 'nav')) {
            if (dom_has_class(element, 'pmu-month')) {
                date_add_months(options.current, instance_index - Math.floor(options.calendars / 2));
                if (dom_has_class(root, 'pmu-view-years')) {
                    // Shift back to current date, otherwise with min value specified may jump on few (tens) years forward
                    if (options.mode !== 'single') {
                        options.current = new Date(options.date[options.date.length - 1]);
                    } else {
                        options.current = new Date(options.date);
                    }
                    if (options.select_day) {
                        dom_remove_class(root, 'pmu-view-years');
                        dom_add_class(root, 'pmu-view-days');
                    } else if (options.select_month) {
                        dom_remove_class(root, 'pmu-view-years');
                        dom_add_class(root, 'pmu-view-months');
                    }
                } else if (dom_has_class(root, 'pmu-view-months')) {
                    if (options.select_year) {
                        dom_remove_class(root, 'pmu-view-months');
                        dom_add_class(root, 'pmu-view-years');
                    } else if (options.select_day) {
                        dom_remove_class(root, 'pmu-view-months');
                        dom_add_class(root, 'pmu-view-days');
                    }
                } else if (dom_has_class(root, 'pmu-view-days')) {
                    if (options.select_month) {
                        dom_remove_class(root, 'pmu-view-days');
                        dom_add_class(root, 'pmu-view-months');
                    } else if (options.select_year) {
                        dom_remove_class(root, 'pmu-view-days');
                        dom_add_class(root, 'pmu-view-years');
                    }
                }
            } else {
                if (dom_has_class(element, 'pmu-prev')) {
                    options.bound.prev(false);
                } else {
                    options.bound.next(false);
                }
            }
        } else {
            if (dom_has_class(root, 'pmu-view-years')) {
                options.current.setFullYear(element.__pickmeup_year);
                if (options.select_month) {
                    dom_remove_class(root, 'pmu-view-years');
                    dom_add_class(root, 'pmu-view-months');
                } else if (options.select_day) {
                    dom_remove_class(root, 'pmu-view-years');
                    dom_add_class(root, 'pmu-view-days');
                } else {
                    options.bound.update_date(options.current);
                }
            } else if (dom_has_class(root, 'pmu-view-months')) {
                options.current.setMonth(element.__pickmeup_month);
                options.current.setFullYear(element.__pickmeup_year);
                if (options.select_day) {
                    dom_remove_class(root, 'pmu-view-months');
                    dom_add_class(root, 'pmu-view-days');
                } else {
                    options.bound.update_date(options.current);
                }
                // Move current month to the first place (needed for multiple calendars)
                date_add_months(options.current, Math.floor(options.calendars / 2) - instance_index);
            } else {
                var new_date = new Date(options.current);
                new_date.setYear(element.__pickmeup_year);
                new_date.setMonth(element.__pickmeup_month);
                new_date.setDate(element.__pickmeup_day);
                options.bound.update_date(new_date);
            }
        }
        options.bound.fill();
        return true;
    }

    function prepare_date (options) {
        var result;
        if (options.mode === 'single') {
            result = new Date(options.date);
            return {
                formatted_date : format_date(result, options.format, options.locales[options.locale]),
                date           : result
            };
        } else {
            result = {
                formatted_date : [],
                date           : []
            };
            options.date.forEach(function (val) {
                var date = new Date(val);
                result.formatted_date.push(format_date(date, options.format, options.locales[options.locale]));
                result.date.push(date);
            });
            return result;
        }
    }

    /**
     * @param {Element} target
     * @param {boolean} [force=false]
     */
    function show (target, force) {
        var root_element = target.__pickmeup.element,
            value;
        if (force || dom_has_class(root_element, 'pmu-hidden')) {
            var options  = target.__pickmeup.options,
                position = dom_offset(target),
                viewport = {
                    l : window.pageXOffset,
                    t : window.pageYOffset,
                    w : document.documentElement.clientWidth,
                    h : document.documentElement.clientHeight
                },
                top      = position.top,
                left     = position.left;
            options.bound.fill();
            if (dom_matches(target, 'input')) {
                value = target.value;
                if (value) {
                    options.bound.set_date(value);
                }
                dom_on(
                    target,
                    target,
                    'keydown',
                    function (e) {
                        if (e.which === 9) {
                            options.bound.hide();
                        }
                    }
                );
                options.lastSel = false;
            }
            if (!dom_dispatch_event(target, 'show')) {
                return;
            }
            if (!options.flat) {
                dom_remove_class(root_element, 'pmu-hidden');
                if (options.position instanceof Function) {
                    position = options.position.call(target);
                    left     = position.left;
                    top      = position.top;
                } else {
                    switch (options.position) {
                        case 'top':
                            top -= root_element.offsetHeight;
                            break;
                        case 'left':
                            left -= root_element.offsetWidth;
                            break;
                        case 'right':
                            left += target.offsetWidth;
                            break;
                        case 'bottom':
                            top += target.offsetHeight;
                            break;
                    }
                    if (top + root_element.offsetHeight > viewport.t + viewport.h) {
                        top = position.top - root_element.offsetHeight;
                    }
                    if (top < viewport.t) {
                        top = position.top + target.offsetHeight;
                    }
                    if (left + root_element.offsetWidth > viewport.l + viewport.w) {
                        left = position.left - root_element.offsetWidth;
                    }
                    if (left < viewport.l) {
                        left = position.left + target.offsetWidth;
                    }
                    left += 'px';
                    top += 'px';
                }
                root_element.style.left = left;
                root_element.style.top  = top;
                setTimeout(function () {
                    dom_on(target, document.documentElement, 'click', options.bound.hide);
                    dom_on(target, window, 'resize', options.bound.forced_show);
                });
            }
        }
    }

    /**
     * @param {Element} target
     * @param {Event}   event
     */
    function hide (target, event) {
        var root_element = target.__pickmeup.element,
            options      = target.__pickmeup.options;
        //noinspection JSBitwiseOperatorUsage,JSCheckFunctionSignatures
        if (
            !event || !event.target ||                                        //Called directly
            (
                event.target !== target &&                                    //Clicked not on element itself
                !(root_element.compareDocumentPosition(event.target) & 16)    //And not on its children
            )
        ) {
            if (dom_dispatch_event(target, 'hide')) {
                dom_add_class(root_element, 'pmu-hidden');
                dom_off(target, document.documentElement, 'click', options.bound.hide);
                dom_off(target, window, 'resize', options.bound.forced_show);
                options.lastSel = false;
            }
        }
    }

    /**
     * @param {Element} target
     */
    function update (target) {
        var options = target.__pickmeup.options;
        dom_off(target, document.documentElement, 'click', options.bound.hide);
        dom_off(target, window, 'resize', options.bound.forced_show);
        options.bound.forced_show();
    }

    /**
     * @param {Element} target
     */
    function clear (target) {
        var options = target.__pickmeup.options;
        if (options.mode !== 'single') {
            options.date    = [];
            options.lastSel = false;
            options.bound.fill();
        }
    }

    /**
     * @param {Element} target
     * @param {boolean} [fill=true]
     */
    function prev (target, fill) {
        if (typeof fill == 'undefined') {
            fill = true;
        }
        var root_element = target.__pickmeup.element;
        var options      = target.__pickmeup.options;
        if (dom_has_class(root_element, 'pmu-view-years')) {
            date_add_years(options.current, -12);
        } else if (dom_has_class(root_element, 'pmu-view-months')) {
            date_add_years(options.current, -1);
        } else if (dom_has_class(root_element, 'pmu-view-days')) {
            date_add_months(options.current, -1);
        }
        if (fill) {
            options.bound.fill();
        }
    }

    /**
     * @param {Element} target
     * @param {boolean} [fill=true]
     */
    function next (target, fill) {
        if (typeof fill == 'undefined') {
            fill = true;
        }
        var root_element = target.__pickmeup.element;
        var options      = target.__pickmeup.options;
        if (dom_has_class(root_element, 'pmu-view-years')) {
            date_add_years(options.current, 12);
        } else if (dom_has_class(root_element, 'pmu-view-months')) {
            date_add_years(options.current, 1);
        } else if (dom_has_class(root_element, 'pmu-view-days')) {
            date_add_months(options.current, 1);
        }
        if (fill) {
            options.bound.fill();
        }
    }

    /**
     * @param {Element} target
     * @param {boolean} [formatted=true]
     */
    function get_date (target, formatted) {
        var options       = target.__pickmeup.options,
            prepared_date = prepare_date(options);
        if (typeof formatted === 'string') {
            var date = prepared_date.date;
            if (date instanceof Date) {
                return format_date(date, formatted, options.locales[options.locale]);
            } else {
                return date.map(function (value) {
                    return format_date(value, formatted, options.locales[options.locale]);
                });
            }
        } else {
            return prepared_date[formatted ? 'formatted_date' : 'date'];
        }
    }

    /**
     * @param {Element}                                       target
     * @param {(Date|Date[]|number|number[]|string|string[])} date
     * @param {Date}                                          [current=undefined]
     */
    function set_date (target, date, current) {
        var options = target.__pickmeup.options,
            i;
        if (!(date instanceof Array) || date.length > 0) {
            options.date = parse_date(date, options);
            if (options.mode !== 'single') {
                if (options.date instanceof Array) {
                    options.date[0] = options.date[0] || parse_date(new Date, options);
                    if (options.mode === 'range') {
                        options.date[1] = options.date[1] || parse_date(options.date[0], options);
                    }
                } else {
                    options.date = [options.date];
                    if (options.mode === 'range') {
                        options.date.push(parse_date(options.date[0], options));
                    }
                }
                for (i = 0; i < options.date.length; ++i) {
                    options.date[i] = correct_date_outside_of_limit(options.date[i], options.min, options.max);
                }
            } else {
                if (options.date instanceof Array) {
                    options.date = options.date[0];
                }
                options.date = correct_date_outside_of_limit(options.date, options.min, options.max);
            }
        } else {
            options.date = [];
        }
        if (!options.select_day) {
            if (options.date instanceof Array) {
                for (i = 0; i < options.date.length; ++i) {
                    options.date[i].setDate(1);
                }
            } else {
                options.date.setDate(1);
            }
        }
        // Remove duplicates
        if (options.mode === 'multiple') {
            for (i = 0; i < options.date.length; ++i) {
                if (options.date.indexOf(options.date[i]) !== i) {
                    options.date.splice(i, 1);
                    --i;
                }
            }
        }
        if (current) {
            options.current = parse_date(current, options);
        } else {
            current         = options.mode === 'single' ? options.date : options.date[options.date.length - 1];
            options.current = current ? new Date(current) : new Date;
        }
        options.current.setDate(1);
        options.bound.fill();
        if (dom_matches(target, 'input') && options.default_date !== false) {
            var prepared_date = prepare_date(options),
                current_value = target.value,
                new_value     = options.mode === 'single' ? prepared_date.formatted_date : prepared_date.formatted_date.join(options.separator);
            if (!current_value) {
                dom_dispatch_event(target, 'change', prepared_date);
            }
            if (current_value !== new_value) {
                //noinspection JSUndefinedPropertyAssignment
                target.value = new_value;
            }
        }
    }

    /**
     * @param {Element} target
     */
    function destroy (target) {
        var root_element = target.__pickmeup.element;
        dom_off(target);
        dom_remove(root_element);
        delete target.__pickmeup;
    }

    function correct_date_outside_of_limit (date, min, max) {
        if (min && min > date) {
            return new Date(min);
        } else if (max && max < date) {
            return new Date(max);
        }
        return date;
    }

    /**
     * @param {(Element|string)} target
     * @param {Object}           [initial_options={}]
     *
     * @return {(Object|null)} Object with useful methods on success, `null` otherwise
     */
    function pickmeup_init (target, initial_options) {
        if (typeof target == 'string') {
            target = document.querySelector(target);
        }
        if (!target) {
            return null;
        }
        if (!target.__pickmeup) {
            var i,
                option,
                options     = {};
            initial_options = initial_options || {};
            for (i in pickmeup_init.defaults) {
                options[i] = i in initial_options ? initial_options[i] : pickmeup_init.defaults[i];
            }
            for (i in options) {
                option = target.getAttribute('data-pmu-' + i);
                if (option !== null) {
                    options[i] = option;
                }
            }
            // 4 conditional statements in order to account all cases
            if (options.view === 'days' && !options.select_day) {
                options.view = 'months';
            }
            if (options.view === 'months' && !options.select_month) {
                options.view = 'years';
            }
            if (options.view === 'years' && !options.select_year) {
                options.view = 'days';
            }
            if (options.view === 'days' && !options.select_day) {
                options.view = 'months';
            }
            options.calendars = Math.max(1, parseInt(options.calendars, 10) || 1);
            options.mode      = /single|multiple|range/.test(options.mode) ? options.mode : 'single';
            if (options.min) {
                options.min = parse_date(options.min, options);
                if (!options.select_day) {
                    options.min.setDate(1);
                }
            }
            if (options.max) {
                options.max = parse_date(options.max, options);
                if (!options.select_day) {
                    options.max.setDate(1);
                }
            }
            var element               = document.createElement('div');
            //noinspection JSUndefinedPropertyAssignment
            target.__pickmeup         = {
                options : options,
                events  : [],
                element : element
            };
            element.__pickmeup_target = target;
            dom_add_class(element, 'pickmeup');
            if (options.class_name) {
                dom_add_class(element, options.class_name);
            }
            options.bound = {
                fill        : fill.bind(target, target),
                update_date : update_date.bind(target, target),
                click       : click.bind(target, target),
                show        : show.bind(target, target),
                forced_show : show.bind(target, target, true),
                hide        : hide.bind(target, target),
                update      : update.bind(target, target),
                clear       : clear.bind(target, target),
                prev        : prev.bind(target, target),
                next        : next.bind(target, target),
                get_date    : get_date.bind(target, target),
                set_date    : set_date.bind(target, target),
                destroy     : destroy.bind(target, target)
            };
            dom_add_class(element, 'pmu-view-' + options.view);
            var content_template = options.instance_template(options),
                content          = '';
            for (i = 0; i < options.calendars; ++i) {
                content += content_template;
            }
            element.innerHTML = content;
            dom_on(target, element, 'click', options.bound.click);
            dom_on(
                target,
                element,
                'onselectstart' in Element.prototype ? 'selectstart' : 'mousedown',
                function (e) {
                    e.preventDefault();
                });
            if (options.flat) {
                dom_add_class(element, 'pmu-flat');
                target.appendChild(element);
            } else {
                dom_add_class(element, 'pmu-hidden');
                document.body.appendChild(element);
                dom_on(target, target, 'click', show.bind(target, target, false));
                dom_on(target, target, 'input', options.bound.update);
                dom_on(target, target, 'change', options.bound.update);
            }
            options.bound.set_date(options.date, options.current);
        }
        options = target.__pickmeup.options;
        return {
            hide     : options.bound.hide,
            show     : options.bound.show,
            clear    : options.bound.clear,
            update   : options.bound.update,
            prev     : options.bound.prev,
            next     : options.bound.next,
            get_date : options.bound.get_date,
            set_date : options.bound.set_date,
            destroy  : options.bound.destroy
        };
    }

    pickmeup_init.defaults = {
        current                   : null,
        date                      : new Date,
        default_date              : new Date,
        flat                      : false,
        first_day                 : 1,
        prev                      : '&#9664;',
        next                      : '&#9654;',
        mode                      : 'single',
        select_year               : true,
        select_month              : true,
        select_day                : true,
        view                      : 'days',
        calendars                 : 1,
        format                    : 'd-m-Y',
        title_format              : 'B, Y',
        position                  : 'bottom',
        class_name                : '',
        separator                 : ' - ',
        hide_on_select            : false,
        min                       : null,
        max                       : null,
        render                    : function () {
        },
        locale                    : 'en',
        locales                   : {
            en : {
                days        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                daysShort   : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                daysMin     : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                months      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                monthsShort : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        },
        /**
         * @param {Object} options
         *
         * @returns {string}
         */
        instance_template         : function (options) {
            var days_of_week = options.locales[options.locale].daysMin.slice();
            // If Monday is the first day of the week
            if (options.first_day) {
                days_of_week.push(days_of_week.shift());
            }
            return '<div class="pmu-instance">' +
                '<nav>' +
                '<div class="pmu-prev pmu-button">' + options.prev + '</div>' +
                '<div class="pmu-month pmu-button"></div>' +
                '<div class="pmu-next pmu-button">' + options.next + '</div>' +
                '</nav>' +
                '<nav class="pmu-day-of-week"><div>' + days_of_week.join('</div><div>') + '</div></nav>' +
                '</div>';
        },
        /**
         * @param {Element[]} elements
         * @param {string}    container_class_name
         *
         * @returns {Element}
         */
        instance_content_template : function (elements, container_class_name) {
            var root_element = document.createElement('div');
            dom_add_class(root_element, container_class_name);
            for (var i = 0; i < elements.length; ++i) {
                dom_add_class(elements[i], 'pmu-button');
                root_element.appendChild(elements[i]);
            }
            return root_element;
        }
    };

    return pickmeup_init;
}));
