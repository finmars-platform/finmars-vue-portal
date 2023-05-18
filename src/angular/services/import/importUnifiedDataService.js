/**
 * Created by szhitenev on 19.01.2022.
 */

import importUnifiedDataRepository from '../../repositories/import/importUnifiedDataRepository'

var download = function (config) {
	return importUnifiedDataRepository.download(config)
}

export default {
	download: download,
}
