import baseUrlService from "../services/baseUrlService";

/** @module masterUserService **/
export default function (cookieService, xhrService) {

    const baseUrl = baseUrlService.resolve();

    /*
    *
    * This is a local master user service
    * All authorizer.master_user service should be moved to vue-authorizer frontend project
    * Here it need to setting up inner master_user settings
    * e.g. journal status (disabled, enabled)
    * */

    var getMasterUser = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/get/',
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': cookieService.getCookie('csrftoken'),
                    'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                    Accept: 'application/json',
                    'Content-type': 'application/json'
                }
            })
    };

    var updateMasterUser = function (master_user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/update/',
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': cookieService.getCookie('csrftoken'),
                    'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                    Accept: 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(master_user)
            })
    };

    return {
        updateMasterUser: updateMasterUser,
        getMasterUser: getMasterUser
    }

}