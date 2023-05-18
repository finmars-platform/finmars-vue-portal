/**
 * Created by szhitenev on 30.10.2020.
 */
'use strict'
import systemMessageRepository from '../repositories/systemMessageRepository'
export default function systemMessageService() {
	const getList = function (options) {
		return systemMessageRepository.getList(options)
	}

	const getByKey = function (id) {
		return systemMessageRepository.getByKey(id)
	}

	const update = function (id, data) {
		return systemMessageRepository.update(id, data)
	}

	const viewFile = function (id) {
		return systemMessageRepository.viewFile(id)
	}

	const getAlerts = function (options) {
		if (!options) {
			const date = new Date()

			let day = date.getDate()
			let month = date.getMonth() + 1
			let year = date.getFullYear()

			let currentDate = `${year}-${month}-${day}`

			options = {
				pageSize: 100,
				filters: {
					created_after: currentDate,
					action_status: '2,3', // required
					type: '2,3', // warning & errors,
				},
			}
		}

		return systemMessageRepository.getList(options)
	}

	const solve = function (id, data) {
		return systemMessageRepository.solve(id, data)
	}

	const comment = function (id, data) {
		return systemMessageRepository.comment(id, data)
	}

	return {
		getList: getList,
		getByKey: getByKey,
		update: update,

		viewFile: viewFile,
		getAlerts: getAlerts,

		solve: solve,
		comment: comment,
	}
}
