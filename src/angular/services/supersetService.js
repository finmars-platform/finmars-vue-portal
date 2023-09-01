/**
 * Created by szhitenev on 27.06.2022.
 */

import supersetRepository from '../repositories/supersetRepository'

var getSecurityToken = function (id) {
	return supersetRepository.getSecurityToken(id)
}

export default {
	getSecurityToken: getSecurityToken,
}
