let host = useRuntimeConfig().public.apiURL
let prefix = host + '/{client}/api/v1'

export default {
	group: {
		list: prefix + '/iam/group/',
		get: prefix + '/iam/group/{id}/',
		post: prefix + '/iam/group/{id}/',
		put: prefix + '/iam/group/{id}/',
		delete: prefix + '/iam/group/{id}/',
	},
	role: {
		list: prefix + '/iam/role/',
		get: prefix + '/iam/role/{id}/',
		post: prefix + '/iam/role/{id}/',
		put: prefix + '/iam/role/{id}/',
		delete: prefix + '/iam/role/{id}/',
	},
	accessPolicyTemplate: {
		list: prefix + '/iam/access-policy-template/',
		get: prefix + '/iam/access-policy-template/{id}/',
		post: prefix + '/iam/access-policy-template/{id}/',
		put: prefix + '/iam/access-policy-template/{id}/',
		delete: prefix + '/iam/access-policy-template/{id}/',
	},
}
