import auth from './_auth.js'
import main from './_main.js'
import iam from './_iam.js'

export default {
    // Auth service
    ...auth,
    // Main service
    ...main,
    ...iam
};
