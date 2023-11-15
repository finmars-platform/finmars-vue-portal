/**
 * Created by szhitenev on 04.05.2016.
 */

'use strict'

import ToastNotificationService from '../services/toastNotificationService'
const toastNotificationService = new ToastNotificationService()

import ErrorService from '../services/errorService'
const errorService = new ErrorService(toastNotificationService)

import CookieService from '../services/cookieService'
const cookieService = new CookieService()

import XhrService from '../services/xhrService'
const xhrService = new XhrService(errorService)

// import configureRepositoryUrlService from '../services/configureRepositoryUrlService';
import configureRepositoryUrlService from '../services/configureRepositoryUrlService'
// import baseUrlService from '../services/baseUrlService';
import baseUrlService from '../services/baseUrlService'

const baseUrl = baseUrlService.resolve()

const getList = function (options) {
    var prefix = baseUrlService.getMasterUserPrefix()
    var apiVersion = baseUrlService.getApiVersion()

    return xhrService.fetch(
        configureRepositoryUrlService.configureUrl(
            baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/group/',
            options
        ),
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                Authorization: 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
        }
    )
}

const getByKey = function (id) {
    var prefix = baseUrlService.getMasterUserPrefix()
    var apiVersion = baseUrlService.getApiVersion()

    return xhrService.fetch(
        baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/group/' + id + '/',
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                Authorization: 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
        }
    )
}

const create = function (group) {
    var prefix = baseUrlService.getMasterUserPrefix()
    var apiVersion = baseUrlService.getApiVersion()

    return xhrService.fetch(
        baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/group/',
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                Authorization: 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify(group),
        }
    )
}

const update = function (id, group) {
    var prefix = baseUrlService.getMasterUserPrefix()
    var apiVersion = baseUrlService.getApiVersion()

    return xhrService.fetch(
        baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/group/' + id + '/',
        {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                Authorization: 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify(group),
        }
    )
}

const deleteByKey = function (id) {
    var prefix = baseUrlService.getMasterUserPrefix()
    var apiVersion = baseUrlService.getApiVersion()

    return xhrService
        .fetch(
            baseUrl +
                '/' +
                prefix +
                '/' +
                apiVersion +
                '/' +
                'users/group/' +
                id +
                '/',
            {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': cookieService.getCookie('csrftoken'),
                    Authorization: 'Token ' + cookieService.getCookie('access_token'),
                    Accept: 'application/json',
                    'Content-type': 'application/json',
                },
            }
        )
        .then(function (data) {
            return new Promise(function (resolve, reject) {
                resolve({ status: 'deleted' })
            })
            //return data.json();
        })
}

export default {
    getList: getList,
    getByKey: getByKey,
    create: create,
    update: update,
    deleteByKey: deleteByKey,
}
