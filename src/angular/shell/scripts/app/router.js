/**
 * Created by mevstratov on 18.05.2021
 */
// (function () {

'use strict'

// export default function ($stateProvider, $urlServiceProvider) {
export default function ($stateProvider, $urlServiceProvider) {
    $urlServiceProvider.rules.otherwise('/')

    $stateProvider.state('app', {
        url: '',
        abstract: true,
        templateUrl: 'views/shell-view.html',
        controller: 'ShellController as vm',
    })

    $stateProvider.state('app.authentication', {
        url: '/authentication',
        templateUrl: 'views/login-view.html',
        // ShellController used for this state
    })
}

// })();
