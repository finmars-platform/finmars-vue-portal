let host = useRuntimeConfig().public.apiURL
let prefix = host + '/{client}/api/v1'

export default {
    groupList: {
        get: prefix + '/iam/group/',
        post: prefix + '/iam/group/',
    },
    group: {
        get: prefix + '/iam/group/{id}/',
        put: prefix + '/iam/group/{id}/',
        delete: prefix + '/iam/group/{id}/',
    },
    roleList: {
        get: prefix + '/iam/role/',
        post: prefix + '/iam/role/',
    },
    role: {
        get: prefix + '/iam/role/{id}/',
        put: prefix + '/iam/role/{id}/',
        delete: prefix + '/iam/role/{id}/',
    },
    accessPolicyList: {
        get: prefix + '/iam/access-policy/',
        post: prefix + '/iam/access-policy/',
    },
    accessPolicy: {
        get: prefix + '/iam/access-policy/{id}/',
        put: prefix + '/iam/access-policy/{id}/',
        delete: prefix + '/iam/access-policy/{id}/',
    },
}
