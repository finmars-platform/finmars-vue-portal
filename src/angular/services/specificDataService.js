/**
 * Created by szhitenev on 22.12.2020.
 */

import specificDataRepository from '../repositories/specificDataRepository'

var getValuesForSelect = function (contentType, key, valueType) {
	return specificDataRepository.getValuesForSelect(contentType, key, valueType)
}

export default {
	getValuesForSelect: getValuesForSelect,
}
