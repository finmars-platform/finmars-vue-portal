/**
 * Created by szhitenev on 10.12.2019.
 */

import reconciliationProcessFileRepository from '../../repositories/reconciliation/reconciliationProcessFileRepository'

var process = function (config) {
	return reconciliationProcessFileRepository.process(config)
}

export default {
	process: process,
}
