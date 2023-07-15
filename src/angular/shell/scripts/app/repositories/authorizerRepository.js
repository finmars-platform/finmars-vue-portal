/**
 * Created by szhitenev on 30.03.2021.
 */

// (function () {

'use strict'

/*import ToastNotificationService from "../services/toastNotificationService";
const toastNotificationService = new ToastNotificationService();

import ErrorService from "../services/errorService";
const errorService = new ErrorService(toastNotificationService);

import CookieService from '../services/cookieService.js';
const cookieService = new CookieService();

import XhrService from '../services/xhrService.js';
const xhrService = new XhrService(errorService);*/

import baseUrlService from '../services/baseUrlService'

const authorizerUrl = baseUrlService.getAuthorizerUrl()

/* var handleError = function (methodName) {
	;
}; */

// deprecated
// const login = function (login, password) {
//
// 	return xhrService.fetch(authorizerUrl + '/login/', {
// 		method: 'POST',
// 		credentials: 'include',
// 		headers: {
// 			'X-CSRFToken': cookieService.getCookie('csrftoken'),
// 			Accept: 'application/json',
// 			'Content-type': 'application/json'
// 		},
// 		body: JSON.stringify({username: login, password: password})
// 	})
// };

export default function (cookieService, xhrService) {
	const tokenLogin = function (login, password) {
		return xhrService.fetch(authorizerUrl + '/token-auth/', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify({ username: login, password: password }),
		})
	}

	const logout = function () {
		return xhrService.fetch(authorizerUrl + '/logout/', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify({}),
		})
	}

	const changePassword = function (id, user) {
		return xhrService.fetch(authorizerUrl + '/user/' + id + '/set-password/', {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(user),
		})
	}

	const ping = function () {
		return xhrService.fetch(authorizerUrl + '/ping/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	const protectedPing = function () {
		return xhrService.fetch(authorizerUrl + '/protected-ping/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	/* var getUsersList = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/user/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getUserByKey = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getUser = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/user/0/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getMyCurrentMember = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/member/0/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    }; */

	//<editor-fold desc="User">
	const getMe = function () {
		// debugger for FN-880
		return xhrService.fetch(authorizerUrl + '/user/0/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})

		/* return xhrService.fetch(authorizerUrl + '/user/get-me/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        }) */
	}

	const getUserByKey = function (id) {
		return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
				...headers,
			},
		})
	}

	const updateUser = function (id, user) {
		return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(user),
		})
	}

	const patchUser = function (id, user) {
		return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(user),
		})
	}

	const deleteUserByKey = function (id) {
		return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	const checkUsernameUniqueness = function (username) {
		var authorizerUrl = baseUrlService.getAuthorizerUrl()

		return xhrService.fetch(
			authorizerUrl + '/user-check-existence/?username=' + username,
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

	const transferOwner = function (data) {
		var authorizerUrl = baseUrlService.getAuthorizerUrl()

		return xhrService.fetch(authorizerUrl + '/master-user-change-owner/', {
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	//</editor-fold>

	//<editor-fold desc="Master user">
	const getCurrentMasterUser = function () {
		return xhrService.fetch(authorizerUrl + '/get-current-master-user', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	/* var update = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
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

    var patchUser = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
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

        return xhrService.fetch(authorizerUrl + '/user/' + id + '/', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    }; */

	const createMasterUser = function (user) {
		return xhrService.fetch(authorizerUrl + '/master-user/', {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(user),
		})
	}

	const getMasterUsersListLight = function () {
		return xhrService.fetch(authorizerUrl + '/master-user-light/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	const getMasterUsersList = function () {
		return xhrService.fetch(authorizerUrl + '/master-user/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	const getMasterUserByKey = function (id) {
		return xhrService.fetch(authorizerUrl + '/master-user/' + id + '/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	const updateMasterUser = function (id, user) {
		return xhrService.fetch(authorizerUrl + '/master-user/' + id + '/', {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(user),
		})
	}

	const patchMasterUser = function (id, user) {
		return xhrService.fetch(authorizerUrl + '/master-user/' + id + '/', {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(user),
		})
	}

	const deleteMasterUserByKey = function (id) {
		return xhrService.fetch(authorizerUrl + '/master-user/' + id + '/', {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}
	//</editor-fold>

	/* var getMemberList = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/member/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getMemberByKey = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/member/' + id, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var updateMember = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/member/' + id, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    };

    var patchMember = function (id, user) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/member/' + id, {
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

    var deleteMemberByKey = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/member/' + id, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getGroupList = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/group/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var getOwnMemberSettings = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/user-member/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        })
    };

    var updateOwnMemberSettings = function (id, member) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/user-member/' + id + '/', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'X-CSRFToken': cookieService.getCookie('csrftoken'),
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(member)
        })
    };


    var getUsercodePrefixList = function () {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/usercode-prefix/',
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

    var createUsercodePrefix = function (item) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/usercode-prefix/',
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': cookieService.getCookie('csrftoken'),
                    'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                    Accept: 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(item)
            })
    };

    var deleteUserCodePrefixByKey = function (id) {

        var prefix = baseUrlService.getMasterUserPrefix();
        var apiVersion = baseUrlService.getApiVersion();

        return xhrService.fetch(authorizerUrl + '/usercode-prefix/' + id + '/', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                Accept: 'application/json',
                'Content-type': 'application/json'
            }
        }).then(function (data) {
            return new Promise(function (resolve, reject) {
                resolve({status: 'deleted'});
            });
            //return data.json();
        })
    }; */

	const inviteUser = function (data) {
		return xhrService.fetch(authorizerUrl + '/create-invite-to-user/', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(data),
		})
	}

	const getInvitesList = function (base_api_url) {
		return xhrService.fetch(
			authorizerUrl + '/invite-to-user/?base_api_url=' + base_api_url,
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

	const deleteInviteByKey = function (id) {
		return xhrService
			.fetch(authorizerUrl + '/invite-to-user/' + id + '/', {
				method: 'DELETE',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			})
			.then(function (data) {
				return new Promise(function (resolve, reject) {
					resolve({ status: 'deleted' })
				})
			})
	}

	const authTokenManagerGetList = function () {
		return xhrService.fetch(authorizerUrl + '/auth-token-manager/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	const authTokenManagerDeleteToken = function (id) {
		return xhrService
			.fetch(authorizerUrl + '/auth-token-manager/' + id + '/', {
				method: 'DELETE',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			})
			.then(function (data) {
				return new Promise(function (resolve, reject) {
					resolve({ status: 'deleted' })
				})
			})
	}

	const authTokenManagerCreateToken = function (data) {
		return xhrService.fetch(authorizerUrl + '/auth-token-manager/', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(data),
		})
	}

	const getVersions = function () {
		return xhrService.fetch(authorizerUrl + '/version/', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
	}

	const updateFinmars = function (base_api_url, tag) {
		return xhrService.fetch(
			authorizerUrl +
				'/master-user-download-update/?base_api_url=' +
				base_api_url +
				'&tag=' +
				tag,
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

	const kickMember = function (data) {
		return xhrService.fetch(authorizerUrl + '/master-user-kick-member/', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'),
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
			body: JSON.stringify(data),
		})
	}

	const getInitialConfiguration = function () {
		return xhrService.fetch(
			authorizerUrl + '/backend-get-init-configuration/',
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			}
		)
	}

	// export default{
	return {
		tokenLogin: tokenLogin,
		logout: logout,

		ping: ping,
		protectedPing: protectedPing,

		/* getUsersList: getUsersList,
        getUserByKey: getUserByKey,
        getUser: getUser,
        getMyCurrentMember: getMyCurrentMember, */
		changePassword: changePassword,
		/* update: update,
        patchUser: patchUser,
        deleteByKey: deleteByKey, */
		getMe: getMe,
		getUserByKey: getUserByKey,
		updateUser: updateUser,
		patchUser: patchUser,
		deleteUserByKey: deleteUserByKey,
		checkUsernameUniqueness: checkUsernameUniqueness,

		getCurrentMasterUser: getCurrentMasterUser,
		createMasterUser: createMasterUser,
		getMasterUsersList: getMasterUsersList,
		getMasterUsersListLight: getMasterUsersListLight,
		getMasterUserByKey: getMasterUserByKey,
		updateMasterUser: updateMasterUser,
		patchMasterUser: patchMasterUser,
		deleteMasterUserByKey: deleteMasterUserByKey,

		/* getMemberList: getMemberList,
        getMemberByKey: getMemberByKey,
        updateMember: updateMember,
        patchMember: patchMember,
        deleteMemberByKey: deleteMemberByKey,

        getGroupList: getGroupList,

        getOwnMemberSettings: getOwnMemberSettings,
        updateOwnMemberSettings: updateOwnMemberSettings,


        getUsercodePrefixList: getUsercodePrefixList,
        createUsercodePrefix: createUsercodePrefix,
        deleteUserCodePrefixByKey: deleteUserCodePrefixByKey, */

		inviteUser: inviteUser,
		getInvitesList: getInvitesList,
		deleteInviteByKey: deleteInviteByKey,

		transferOwner: transferOwner,

		authTokenManagerGetList: authTokenManagerGetList,
		authTokenManagerDeleteToken: authTokenManagerDeleteToken,
		authTokenManagerCreateToken: authTokenManagerCreateToken,

		getVersions: getVersions,
		updateFinmars: updateFinmars,

		kickMember: kickMember,
		getInitialConfiguration: getInitialConfiguration,
	}
}

// }());
