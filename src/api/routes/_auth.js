let prefix = useRuntimeConfig().public.authURL

export default {
	masterUser: {
		get: prefix + "/master-user/",
		put: prefix + "/master-user/{id}/",
	},
	ping: {
		get: prefix + "/ping/"
	},
	tokenRefresh: {
		post: prefix + '/token-refresh/'
	},
	tokenInfo: {
		get: prefix + '/auth-token-manager/'
	},
	login: {
		post: prefix + '/token-auth/'
	},
	masterBackups: {
		get: prefix + '/master-user-backups/',
		'delete': prefix + '/master-user-backups/{id}/',
		put: prefix + '/master-user-backups/{id}/restore-from-backup/'
	},
	masterRollback: {
		put: prefix + '/master-user/{id}/rollback-from-backup/'
	},
	masterRedeploy: {
		get: prefix + '/master-user-redeploy/?base_api_url={baseApi}'
	},
	masterStart: {
		get: prefix + '/master-user-start/?base_api_url={baseApi}'
	},
	masterStop: {
		get: prefix + '/master-user-stop/?base_api_url={baseApi}'
	},
	masterExport: {
		get: prefix + '/master-user-export/{id}/'
	},
	masterLeave: {
		get:  prefix + '/master-user-leave/{id}/'
	},
	masterDelete: {
		delete:  prefix + '/master-user-delete/{id}/'
	},
	masterSet: {
		patch:  prefix + '/master-user/{id}/set-current/'
	},
	masterCreate: {
		post:  prefix + '/master-user-create/'
	},
	masterCreateFrom: {
		post:  prefix + '/master-user-create-from-backup/'
	},
	me: {
		get: prefix + "/user/0/",
		put: prefix + "/user/0/",
	},
	meSetPassword: {
		put:  prefix + '/user/0/set-password/'
	},
	meTwoFactor: {
		get:  prefix + '/two-factor/',
		patch:  prefix + '/two-factor/{id}/',
		delete:  prefix + '/two-factor/{id}/',
	},
	generateQR: {
		put:  prefix + '/two-factor/generate-code/'
	},
	validateQR: {
		put:  prefix + '/two-factor/validate-code/'
	},
	invitesToDB: {
		get:  prefix + '/invite-from-master-user/?status=0',
		put:  prefix + '/invite-from-master-user/{id}/'
	},
	memberInvites: {
		get:  prefix + '/invite-to-user/',
		post:  prefix + '/create-invite-to-user/',
	},

};
