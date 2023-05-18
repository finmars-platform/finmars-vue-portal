/**
 * Created by szhitenev on 28.07.2020.
 */

import healthcheckRepository from '../repositories/healthcheckRepository'

var getData = function () {
	return healthcheckRepository.getData()
}

export default {
	getData: getData,
}
