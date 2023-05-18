import stringHelper from './stringHelper'
import utilsHelper from './utils.helper'
import metaService from '../services/metaService'

var isDataLoading = function (evDataService) {
	var result = false

	var requestParameters = evDataService.getRequestParametersAsList()

	requestParameters.forEach(function (item) {
		if (item.status === 'loading') {
			result = true
		}
	})

	return result
}

export default {
	isDataLoading: isDataLoading,
}
