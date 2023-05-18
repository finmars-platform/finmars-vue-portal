import cookieService from '@/angular/core/services/cookieService'
import xhrService from '@/angular/core/services/xhrService'
import baseUrlService from '../services/baseUrlService'

import configureRepositoryUrlService from '../services/configureRepositoryUrlService'

var baseUrl = baseUrlService.resolve()

var getMembersList = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/member/',
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

var getMemberByKey = function (id) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'users/member/' +
			id +
			'/',
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

var updateMember = function (id, data) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'users/member/' +
			id +
			'/',
		{
			method: 'PUT',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(data),
		}
	)
}

var deleteMemberByKey = function (id) {
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
				'users/member/' +
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
		})
}

var getGroupsList = function () {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/group/',
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

var getGroupByKey = function (id) {
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

var createGroup = function (data) {
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
			body: JSON.stringify(data),
		}
	)
}

var updateGroup = function (id, data) {
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
			body: JSON.stringify(data),
		}
	)
}

var deleteGroupByKey = function (id) {
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
		})
}

var inviteUser = function (data) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'users/create-invite-to-user/',
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(data),
		}
	)
}

var getInvitesList = function (options) {
	var prefix = baseUrlService.getMasterUserPrefix()
	var apiVersion = baseUrlService.getApiVersion()

	return xhrService.fetch(
		configureRepositoryUrlService.configureUrl(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/invite-to-user/',
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

var deleteInviteByKey = function (id) {
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
				'users/invite-to-user/' +
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
		})
}

export default {
	getMembersList: getMembersList,
	getMemberByKey: getMemberByKey,
	updateMember: updateMember,
	deleteMemberByKey: deleteMemberByKey,

	getGroupsList: getGroupsList,
	getGroupByKey: getGroupByKey,
	createGroup: createGroup,
	updateGroup: updateGroup,
	deleteGroupByKey: deleteGroupByKey,

	inviteUser: inviteUser,
	getInvitesList: getInvitesList,
	deleteInviteByKey: deleteInviteByKey,
}
