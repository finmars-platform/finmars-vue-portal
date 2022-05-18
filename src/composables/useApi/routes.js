export default {
	// Auth service
	masterUser: {
		get: "/authorizer/master-user/",
		put: "/authorizer/master-user/{id}/",
	},
	masterBackups: {
		get: '/authorizer/master-user-backups/'
	},
	masterLeave: {
		get: '/authorizer/master-user-leave/{id}/'
	},
	me: {
		get: "/authorizer/user/0/",
		put: "/authorizer/user/0/",
	},
	meSetPassword: {
		put: '/authorizer/user/0/set-password/'
	},
	meTwoFactor: {
		get: '/authorizer/two-factor/',
		patch: '/authorizer/two-factor/{id}/',
	},
	generateQR: {
		put: '/authorizer/two-factor/generate-code/'
	},
	validateQR: {
		put: '/authorizer/two-factor/validate-code/'
	},
	invitesToDB: {
		get: '/authorizer/invite-from-master-user/?status=0',
		put: '/authorizer/invite-from-master-user/{id}/'
	},

};
