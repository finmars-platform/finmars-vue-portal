/**
 * Created by szhitenev on 04.08.2016.
 */
(function () {

    'use strict';

    import cookieService from '@/angular/core/services/cookieService'); var xhrService = require('@/angular/core/services/xhrService';
    import configureRepositoryUrlService from '../services/configureRepositoryUrlService';
    import baseUrlService from '../services/baseUrlService';

    var baseUrl = baseUrlService.resolve();

    var getInstrumentMappingList = function () {

var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return xhrService.fetch(baseUrl   +  '/' + prefix + '/' + apiVersion + '/' + 'import/instruments/instrument/mapping/',
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                   'Authorization': 'Token ' + cookieService.getCookie('access_token'),
 Accept: 'application/json',
                    'Content-type': 'application/json'
                }
            })
    };


    export default{
        getInstrumentMappingList: getInstrumentMappingList
    }

}());
