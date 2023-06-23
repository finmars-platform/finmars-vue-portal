/**
 * Created by mevstratov on 25.05.2021.
 */

'use strict';

export default function () {

    // toastr.options.onclick = function() { console.log('clicked'); }

    const success = function (message) {
        toastr.success(message);
    };

    const error = function (message, title, options) {

        // var searchParams = new URLSearchParams(window.location.search);

        // if (searchParams.get('debug') === 'true') {

		toastr.error(message, title, options);

        // }

    };

    const warning = function (message) {
        toastr.warning(message)
    };

    const info = function (message) {
        toastr.info(message);
    };

    return {
        success: success,
        error: error,
        info: info,
        warning: warning
    }

}