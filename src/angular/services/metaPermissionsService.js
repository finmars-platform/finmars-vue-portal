/**
 * Created by szhitenev on 09.08.2016.
 */

import metaPermissionsRepository from '../repositories/metaPermissionsRepository'

var getEntitiesWithDisabledPermissions = function () {
	return metaPermissionsRepository.getEntitiesWithDisabledPermissions()
}

export default {
	getEntitiesWithDisabledPermissions: getEntitiesWithDisabledPermissions,
}
