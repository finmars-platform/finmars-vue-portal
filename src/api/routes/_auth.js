let prefix = useRuntimeConfig().public.authorizerURL

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
	spaceBackup: {
		get: prefix + '/api/v2/space-backup/',
		'delete': prefix + '/api/v2/space-backup/{id}/',
		put: prefix + '/api/v2/space-backup/{id}/restore-from-backup/' // Bad, need rework
	},
	spaceBackupSave: {
		put: prefix + '/api/v2/space-backup/{id}/'
	},
	spaceBackupInfo: {
		get: prefix + '/api/v2/space/backups-info/'
	},

	masterRollback: {
		put: prefix + '/master-user/{id}/rollback-from-backup/'
	},
	masterRedeploy: {
		get: prefix + '/master-user-redeploy/?base_api_url={baseApi}'
	},
	masterLog: {
		get: prefix + '/master-user-log/?base_api_url={baseApi}'
	},
	masterHealth: {
		get: prefix + '/master-user-health/?base_api_url={baseApi}'
	},
	masterStart: {
		get: prefix + '/master-user-start/?base_api_url={baseApi}'
	},
	masterStop: {
		get: prefix + '/master-user-stop/?base_api_url={baseApi}'
	},
	masterExport: {
		post: prefix + '/api/v2/space/{id}/create-backup/'
	},
	masterLeave: {
		get: prefix + '/master-user-leave/{id}/'
	},
	masterDelete: {
		delete: prefix + '/master-user-delete/{id}/'
	},
	masterSet: {
		patch: prefix + '/master-user/{id}/set-current/'
	},
	masterCreate: {
		post: prefix + '/master-user-create/'
	},
	masterCreateFrom: {
		post: prefix + '/master-user-create-from-backup/'
	},
	me: {
		get: prefix + "/user/0/",
		put: prefix + "/user/0/",
	},
	user: {
		put: prefix + "/user/{id}/",
	},
	meSetPassword: {
		put: prefix + '/user/0/set-password/'
	},
	meTwoFactor: {
		get: prefix + '/two-factor/',
		patch: prefix + '/two-factor/{id}/',
		delete: prefix + '/two-factor/{id}/',
	},
	generateQR: {
		put: prefix + '/two-factor/generate-code/'
	},
	validateQR: {
		put: prefix + '/two-factor/validate-code/'
	},
	invitesToDB: {
		get: prefix + '/invite-from-master-user/?status=0',
		put: prefix + '/invite-from-master-user/{id}/'
	},
	memberKick: {
		post: prefix + '/master-user-kick-member/',
	},
	memberInvites: {
		get: prefix + '/invite-to-user/?base_api_url={baseApi}',
		post: prefix + '/create-invite-to-user/',
	},
	masterInitUpdate: {
		put: prefix + '/master-user/{id}/init-update/'
	},

// 	REALM

	realm: {
		get: prefix + "/api/v2/realm/",
		put: prefix + "/api/v2/realm/{id}/",
		delete: prefix + "/api/v2/realm/{id}/",
	},
	realmProvisionLog: {
		get: prefix + "/api/v2/realm/{id}/log/",
	},
	realmCreate: {
		post: prefix + '/api/v2/realm/'
	},
	realmRestart: {
		put: prefix + '/api/v2/realm/{id}/restart/'
	},
	realmStart: {
		put: prefix + '/api/v2/realm/{id}/start/'
	},
	realmStop: {
		put: prefix + '/api/v2/realm/{id}/stop/'
	},
	realmCreateSpace: {
		put: prefix + '/api/v2/realm/{id}/create-space/'
	},
	realmCreateSpaceFromBackup: {
		put: prefix + '/api/v2/realm/{id}/create-space-from-backup/'
	},
	realmDeleteSpace: {
		put: prefix + '/api/v2/realm/{id}/delete-space/'
	},
	realmInitUpdate: {
		put: prefix + '/api/v2/realm/{id}/init-update/'
	},

};
