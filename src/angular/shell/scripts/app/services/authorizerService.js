/**
 * Created by szhitenev on 04.05.2016.
 */
// (function () {

'use strict'

import AuthorizerRepository from '../repositories/authorizerRepository.js'

import { getVersions } from '@/angular/portal/scripts/app/controllers/pages/updateCenterController'
// import usersRepository from "../repositories/usersRepository";
/** @module authorizerService */
export default function (cookieService, globalDataService, xhrService) {
	const authorizerRepository = new AuthorizerRepository(
		cookieService,
		xhrService
	)
	// Deprecated
	// const login = function (login, password) {
	// 	return authorizerRepository.login(login, password);
	// };

	const tokenLogin = function (login, password) {
		return authorizerRepository.tokenLogin(login, password)
	}

	const logout = function () {
		globalDataService.clearAllData()
		return authorizerRepository.logout()
	}

	const changePassword = function (id, user) {
		return authorizerRepository.changePassword(id, user)
	}

	/* const getUser = function () {

        return new Promise ((resolve, reject) => {

            const user = globalDataService.getUser();

            if (user) resolve(user);

            authorizerRepository.getUser().then(userData => {

                globalDataService.setUser(userData);
                resolve(userData);

            }).catch(error => {
                globalDataService.setUser(null);
                reject(error);
            });

        });

    }; */

	const ping = function () {
		// debugger for FN-880
		return authorizerRepository.ping()
	}

	/* const getUsersList = function () {
        return authorizerRepository.getUsersList();
    };

    const getUserByKey = function (id) {
        return authorizerRepository.getUserByKey(id)
    };

    /!**
     * Updates user.
     *
     * @memberOf module:authorizerService
     *
     * @param id {number} - id of user
     * @param user {Object} - user data
     * @returns {Promise<any>}
     *!/
    const update = function (id, user) {
        return authorizerRepository.update(id, user);
    };

    /!**
     * Updates properties of user object.
     *
     * @memberOf module:authorizerService
     *
     * @param id {number} - id of user
     * @param user {Object} - user data
     * @returns {Promise<any>}
     *!/
    const patchUser = function (id, user) {
        return authorizerRepository.patch(id, user);
    };

    const deleteByKey = function (id) {
        return authorizerRepository.deleteByKey(id);
    }; */
	//<editor-fold desc="User">
	const getMe = function () {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.getMe()
				.then((userData) => {
					if (!userData.data) userData.data = {}
					globalDataService.setUser(userData)
					resolve(userData)
				})
				.catch((error) => reject(error))
		})

		// return authorizerRepository.getMe();
	}

	const getUserByKey = function (id) {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.getUserByKey(id)
				.then((userData) => {
					if (!userData.data) userData.data = {}
					resolve(userData)
				})
				.catch((error) => reject(error))
		})
	}

	const updateUser = function (id, user) {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.updateUser(id, user)
				.then((updatedUser) => {
					globalDataService.setUser(updatedUser)
					resolve(updatedUser)
				})
				.catch((error) => reject(error))
		})
	}

	const patchUser = function (id, user) {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.patchUser(id, user)
				.then((patchedUser) => {
					globalDataService.setUser(patchedUser)
					resolve(patchedUser)
				})
				.catch((error) => reject(error))
		})
	}

	const deleteUserByKey = function (id) {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.deleteMasterUserByKey(id)
				.then(() => {
					const currentUser = globalDataService.getUser()
					const currentUserIsDeleted = currentUser && currentUser.id === id

					if (currentUserIsDeleted) globalDataService.setMasterUser(null)

					resolve('deleted')
				})
				.catch((error) => reject(error))
		})
	}

	const checkUsernameUniqueness = function (username) {
		return authorizerRepository.checkUsernameUniqueness(username)
	}

	const transferOwner = function (data) {
		return authorizerRepository.transferOwner(data)
	}
	//</editor-fold>

	//<editor-fold desc="Master user">
	const createMasterUser = function (masterUser) {
		return authorizerRepository.createMasterUser(masterUser)
	}

	const getMasterUsersList = function () {
		return authorizerRepository.getMasterUsersList()
	}

	const getMasterUserByKey = function (id) {
		return authorizerRepository.getMasterUserByKey(id)
	}

	const getCurrentMasterUser = function () {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.getMasterUsersList()
				.then((masterUsersData) => {
					// const base_api_url = window.location.pathname.split('/')[1];
					const pathNamePartsList = window.location.pathname.split('/')
					const base_api_url = pathNamePartsList.find((part) =>
						part.startsWith('space')
					)

					let currentMasterUser = null

					if (base_api_url.startsWith('space')) {
						currentMasterUser = masterUsersData.results.find(
							(master) => master.base_api_url === base_api_url
						)
					}

					globalDataService.setMasterUser(currentMasterUser)

					resolve(currentMasterUser)
				})
				.catch((error) => reject(error))
		})
		// return authorizerRepository.getCurrentMasterUser();
	}

	const updateMasterUser = function (id, masterUser) {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.updateMasterUser(id, masterUser)
				.then((updatedMasterUser) => {
					globalDataService.setMasterUser(updatedMasterUser)
					resolve(updatedMasterUser)
				})
				.catch((error) => reject(error))
		})
	}

	const patchMasterUser = function (id, masterUser) {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.patchMasterUser(id, masterUser)
				.then((patchedMasterUser) => {
					globalDataService.setMasterUser(patchedMasterUser)
					resolve(patchedMasterUser)
				})
				.catch((error) => reject(error))
		})
	}

	const deleteMasterUserByKey = function (id) {
		return new Promise((resolve, reject) => {
			authorizerRepository
				.deleteMasterUserByKey(id)
				.then((deletionData) => {
					const currentMasterUser = globalDataService.getMasterUser()
					const currentMasterUserIsDeleted =
						currentMasterUser && currentMasterUser.id === id

					if (currentMasterUserIsDeleted) globalDataService.setMasterUser(null)

					resolve('deleted')
				})
				.catch((error) => reject(error))
		})
	}

	const getMasterUsersListLight = function () {
		return authorizerRepository.getMasterUsersListLight()
	}
	//</editor-fold>

	//<editor-fold desc="Invites">
	const inviteUser = function (data) {
		return authorizerRepository.inviteUser(data)
	}

	const getInvitesList = function (base_api_url) {
		return authorizerRepository.getInvitesList(base_api_url)
	}

	const deleteInviteByKey = function (id) {
		return authorizerRepository.deleteInviteByKey(id)
	}

	const authTokenManagerGetList = function () {
		return authorizerRepository.authTokenManagerGetList()
	}

	const authTokenManagerDeleteToken = function (id) {
		return authorizerRepository.authTokenManagerDeleteToken(id)
	}

	const authTokenManagerCreateToken = function (data) {
		return authorizerRepository.authTokenManagerCreateToken(data)
	}

	const getVersions = function () {
		return authorizerRepository.getVersions()
	}

	const updateFinmars = function (base_api_url, tag) {
		return authorizerRepository.updateFinmars(base_api_url, tag)
	}

	const kickMember = function (data) {
		return authorizerRepository.kickMember(data)
	}

	const getInitialConfiguration = function () {
		return authorizerRepository.getInitialConfiguration()
	}

	//</editor-fold>

	return {
		tokenLogin: tokenLogin,
		logout: logout,
		changePassword: changePassword,

		// getUser: getUser,

		ping: ping,

		/* getUsersList: getUsersList,
        getUserByKey: getUserByKey,

        update: update,
        patchUser: patchUser,
        deleteByKey: deleteByKey, */
		getMe: getMe,
		getUserByKey: getUserByKey,
		updateUser: updateUser,
		patchUser: patchUser,
		deleteUserByKey: deleteUserByKey,

		checkUsernameUniqueness: checkUsernameUniqueness,

		createMasterUser: createMasterUser,
		getMasterUsersList: getMasterUsersList,
		getMasterUsersListLight: getMasterUsersListLight,
		getMasterUserByKey: getMasterUserByKey,
		getCurrentMasterUser: getCurrentMasterUser,
		updateMasterUser: updateMasterUser,
		patchMasterUser: patchMasterUser,
		deleteMasterUserByKey: deleteMasterUserByKey,

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

// })();
