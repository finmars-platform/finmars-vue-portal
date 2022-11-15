export default {
	masterUser: {
		get: "/master-user/",
		put: "/master-user/{id}/",
	},
	ping: {
		get: "/ping/"
	},
	tokenRefresh: {
		post: '/token-refresh/'
	},
	tokenInfo: {
		get: '/auth-token-manager/'
	},
	login: {
		post: '/token-auth/'
	},
	masterBackups: {
		get: '/master-user-backups/',
		'delete': '/master-user-backups/{id}/',
		put: '/master-user-backups/{id}/restore-from-backup/'
	},
	masterRollback: {
		put: '/master-user/{id}/rollback-from-backup/'
	},
	masterRedeploy: {
		get: '/master-user-redeploy/?base_api_url={baseApi}'
	},
	masterStart: {
		get: '/master-user-start/?base_api_url={baseApi}'
	},
	masterStop: {
		get: '/master-user-stop/?base_api_url={baseApi}'
	},
	masterExport: {
		get: '/master-user-export/{id}/'
	},
	masterLeave: {
		get: '/master-user-leave/{id}/'
	},
	masterDelete: {
		delete: '/master-user-delete/{id}/'
	},
	masterSet: {
		patch: '/master-user/{id}/set-current/'
	},
	masterCreate: {
		post: '/master-user-create/'
	},
	masterCreateFrom: {
		post: '/master-user-create-from-backup/'
	},
	me: {
		get: "/user/0/",
		put: "/user/0/",
	},
	meSetPassword: {
		put: '/user/0/set-password/'
	},
	meTwoFactor: {
		get: '/two-factor/',
		patch: '/two-factor/{id}/',
		delete: '/two-factor/{id}/',
	},
	generateQR: {
		put: '/two-factor/generate-code/'
	},
	validateQR: {
		put: '/two-factor/validate-code/'
	},
	invitesToDB: {
		get: '/invite-from-master-user/?status=0',
		put: '/invite-from-master-user/{id}/'
	},
	memberInvites: {
		get: '/invite-to-user/',
		post: '/create-invite-to-user/',
	},

};
