/**
 * Created by szhitenev on 04.05.2016.
 */

// (function () {

'use strict'

/*import ToastNotificationService from "../services/toastNotificationService";
const toastNotificationService = new ToastNotificationService();

import ErrorService from "../services/errorService";
const errorService = new ErrorService(toastNotificationService);

import CookieService from '../services/cookieService';
const cookieService = new CookieService();

import XhrService from '../services/xhrService';
const xhrService = new XhrService(errorService);*/

import baseUrlService from '../services/baseUrlService'

// import cookieService from '@/angular/core/services/cookieService';
// import xhrService from '@/angular/core/services/xhrService';
// import baseUrlService from '../services/baseUrlService';

const baseUrl = baseUrlService.resolve()
// const authorizerUrl = baseUrlService.getAuthorizerUrl();

/* var handleError = function (methodName) {
	console.log('Method: ' + methodName + '. Cannot get data from server');
};

var login = function (login, password) {

	var prefix = baseUrlService.getMasterUserPrefix();
	var apiVersion = baseUrlService.getApiVersion();

	return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/login/', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'X-CSRFToken': cookieService.getCookie('csrftoken'),
			'Authorization': 'Token ' + cookieService.getCookie('access_token'),
			Accept: 'application/json',
			'Content-type': 'application/json'
		},
		body: JSON.stringify({username: login, password: password})
	})
};

var logout = function () {

	var prefix = baseUrlService.getMasterUserPrefix();
	var apiVersion = baseUrlService.getApiVersion();

	return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/logout/', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'X-CSRFToken': cookieService.getCookie('csrftoken'),
			'Authorization': 'Token ' + cookieService.getCookie('access_token'),
			Accept: 'application/json',
			'Content-type': 'application/json'
		},
		body: JSON.stringify({})
	})
}; */

export default function (cookieService, xhrService) {
	const ping = function () {
		const prefix = baseUrlService.getMasterUserPrefix()
		const apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/ping/',
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

	const protectedPing = function () {
		const prefix = baseUrlService.getMasterUserPrefix()
		const apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/protected-ping/',
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

	/* const getList = function () {

        const prefix = baseUrlService.getMasterUserPrefix();
        const apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/user/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    const getByKey = function (id) {

        const prefix = baseUrlService.getMasterUserPrefix();
        const apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/user/' + id + '/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    const getMe = function () {

        const baseUrl = baseUrlService.resolve();

        const prefix = baseUrlService.getMasterUserPrefix();
        const apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/user/0/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        });
    };
    const getCurrentUser = function () {

        return xhrService.fetch(authorizerUrl + '/user/0/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        });

    };

    var update = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/user/' + id + '/', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    };

    var patch = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/user/' + id + '/', {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    };

    var deleteByKey = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/user/' + id + '/', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var createMasterUser = function (user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    };

    var getMasterListLight = function () {

        var baseUrl = baseUrlService.resolve();


        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user-light/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getMasterList = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getMasterByKey = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/' + id + '/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var updateMaster = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/' + id + '/', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    };

    var patchMaster = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/' + id + '/', {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    };

    var deleteMasterByKey = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/' + id + '/', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var setMasterUser = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/master-user/' + id + '/set-current/', {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    }; */

	const getMyCurrentMember = function () {
		const baseUrl = baseUrlService.resolve()
		const prefix = baseUrlService.getMasterUserPrefix()

		const apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/member/0/',
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

	const getMemberList = function () {
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

	const getMemberByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/member/' + id,
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

	const updateMember = function (id, user) {
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
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(user),
			}
		)
	}

	const patchMember = function (id, user) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/member/' + id,
			{
				method: 'PATCH',
				credentials: 'include',
				headers: {
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(user),
			}
		)
	}

	const deleteMemberByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/member/' + id,
			{
				method: 'DELETE',
				credentials: 'include',
				headers: {
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	const getGroupList = function () {
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

	/* const getOwnMemberSettings = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'users/user-member/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    }; */

	const updateOwnMemberSettings = function (id, member) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'users/user-member/' +
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
				body: JSON.stringify(member),
			}
		)
	}

	// TODO: move request for usercode prefixes to separate repository
	const getUsercodePrefixList = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'users/usercode-prefix/',
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

	const createUsercodePrefix = function (item) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'users/usercode-prefix/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(item),
			}
		)
	}

	const deleteUserCodePrefixByKey = function (id) {
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
					'users/usercode-prefix/' +
					id +
					'/',
				{
					method: 'DELETE',
					credentials: 'include',
					headers: {
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

	return {
		/* login: login,
        logout: logout, */

		ping: ping,
		protectedPing: protectedPing,

		/* getList: getList,
        getByKey: getByKey,
        getMe: getMe,
        getCurrentUser: getCurrentUser,

        update: update,
        patch: patch,
        deleteByKey: deleteByKey,

        getCurrentMasterUser: getCurrentMasterUser,
        createMasterUser: createMasterUser,
        getMasterList: getMasterList,
        getMasterListLight: getMasterListLight,
        getMasterByKey: getMasterByKey,
        updateMaster: updateMaster,
        patchMaster: patchMaster,
        deleteMasterByKey: deleteMasterByKey,
        setMasterUser: setMasterUser, */

		getMyCurrentMember: getMyCurrentMember,
		getMemberList: getMemberList,
		getMemberByKey: getMemberByKey,
		updateMember: updateMember,
		patchMember: patchMember,
		deleteMemberByKey: deleteMemberByKey,

		getGroupList: getGroupList,

		// getOwnMemberSettings: getOwnMemberSettings,
		updateOwnMemberSettings: updateOwnMemberSettings,

		getUsercodePrefixList: getUsercodePrefixList,
		createUsercodePrefix: createUsercodePrefix,
		deleteUserCodePrefixByKey: deleteUserCodePrefixByKey,
	}
}

// }());
