'use strict';

export default function () {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            cancelDialog: '&',
        },
        templateUrl: 'views/directives/dialog-header-view.html',
        link: function (scope, elem, attrs) {



        }
    }
}
