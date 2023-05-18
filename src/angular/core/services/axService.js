import axios from 'axios'
import baseUrlService from "../../shell/scripts/app/services/baseUrlService";

(function () {

    var cookieService = require('./cookieService');

    const authorizerUrl = baseUrlService.getAuthorizerUrl();


    const ax = axios.create({
        // baseURL: '__API_HOST__',
        baseURL: window.API_HOST,
        headers: {
            'Content-type': 'application/json'
        }
    })

    ax.interceptors.response.use(
        (response) => {
            return response
        },
        (err) => {

            console.log("Axios catch error", err)

            // return other errors
            if (err.response.status !== 401) {
                return new Promise((resolve, reject) => {
                    reject(err)
                })
            }

            return new Promise((resolve, reject) => {

                window.keycloak.updateToken().then(function () {

                    const config = err.response.config
                    config.headers.Authorization = 'Token ' + window.keycloak.token

                    cookieService.setCookie('access_token', window.keycloak.token);
                    cookieService.setCookie('refresh_token', window.keycloak.refreshToken);
                    cookieService.setCookie('id_token', window.keycloak.idToken);

                    resolve(ax(config))

                }).catch(function (error) {

                    console.log("Keycloak update error", error)

                    // in case if refresh token is expired

                    window.keycloak.init({
                        onLoad: 'login-required'
                    })
                    reject()

                });
            })

            // // error on login
            // if (err.response.config.url.indexOf('/token-auth/') !== -1) {
            //     return new Promise((resolve, reject) => {
            //         reject(err)
            //     })
            // }
            // // error on refresh
            // if (err.response.config.url.indexOf('/token-refresh/') !== -1) {
            //
            //
            //     cookieService.deleteCookie('access_token')
            //     cookieService.deleteCookie('refresh_token')
            //     window.location.reload();
            //     return new Promise((resolve, reject) => {
            //         reject(err)
            //     })
            // }
            // // refresh
            // return ax.post(authorizerUrl + '/token-refresh/', {refresh_token: cookieService.getCookie('refresh_token')}, {withCredentials: true}).then(
            //     response => {
            //         const config = err.response.config
            //         config.headers.Authorization = 'Token ' + response.data.access_token
            //         cookieService.setCookie('access_token', response.data.access_token)
            //         return ax(config)
            //     }
            // )
        }
    )

    module.exports = {
        ax: ax
    }

}());