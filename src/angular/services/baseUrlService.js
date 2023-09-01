/**
 * Created by szhitenev on 07.12.2016.
 */
import shellBaseUrlService from '@/angular/shell/scripts/app/services/baseUrlService.js'

/* window.base_api_url = '';

    var resolve = function () {

        if ('__PROJECT_ENV__') {

            var host = '__API_HOST__';

            return host;

        }

        return ''

    };

    var getAuthorizerUrl = function () {

        return '__AUTHORIZER_URL__'

    }

    var setMasterUserPrefix = function (_prefix) {
        window.base_api_url = _prefix;
    }

    var getMasterUserPrefix = function () {
        return window.base_api_url
    }

    var getApiVersion = function () {
        return 'api/v1'
    }

    export default{
        resolve: resolve,
        getAuthorizerUrl: getAuthorizerUrl,
        setMasterUserPrefix: setMasterUserPrefix,
        getMasterUserPrefix: getMasterUserPrefix,

        getApiVersion: getApiVersion
    } */
export default shellBaseUrlService
