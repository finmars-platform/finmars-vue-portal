export default {
	masterUser: {
		get: "/authorizer/master-user/",
		put: "/authorizer/master-user/{id}/",
	},
	ping: {
		get: "/authorizer/ping/"
	},
	masterBackups: {
		get: '/authorizer/master-user-backups/',
		'delete': '/authorizer/master-user-backups/{id}/',
		put: '/authorizer/master-user-backups/{id}/restore-from-backup/'
	},

	masterExport: {
		get: '/authorizer/master-user-export/{id}/'
	},
	masterLeave: {
		get: '/authorizer/master-user-leave/{id}/'
	},
	masterSet: {
		patch: '/authorizer/master-user/{id}/set-current/'
	},
	masterCreate: {
		post: '/authorizer/master-user-create/'
	},
	masterCreateFrom: {
		post: '/authorizer/master-user-create-from-backup/'
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
