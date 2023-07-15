/**
 * Created by szhitenev on 22.06.2020.
 */

export default function crossEntityAttributeExtensionPage(
	$scope,
	toastNotificationService,
	attributeTypeService,
	uiService
) {
	var vm = this

	vm.readyStatus = {
		content: false,
		attributeTypes: false,
	}

	vm.currencyAttributes = [
		{
			key: 'name',
			name: 'Name',
			value_type: 10,
			is_hidden: true,
			extension_type: 'ATTRIBUTE',
			key_to: 'name',
		},
		{
			key: 'short_name',
			name: 'Short Name',
			value_type: 10,
			is_hidden: true,
			extension_type: 'ATTRIBUTE',
			key_to: 'short_name',
		},
		{
			key: 'user_code',
			name: 'User code',
			value_type: 10,
			is_hidden: true,
			extension_type: 'ATTRIBUTE',
			key_to: 'user_code',
		},
	]
	vm.instrumentAttributes = [
		{
			key: 'name',
			name: 'Name',
			value_type: 10,
			is_hidden: true,
			extension_type: 'ATTRIBUTE',
			key_to: 'name',
		},
		{
			key: 'short_name',
			name: 'Short Name',
			value_type: 10,
			is_hidden: true,
			extension_type: 'ATTRIBUTE',
			key_to: 'short_name',
		},
		{
			key: 'user_code',
			name: 'User code',
			value_type: 10,
			is_hidden: true,
			extension_type: 'ATTRIBUTE',
			key_to: 'user_code',
		},
		{
			key: 'public_name',
			name: 'Public name',
			value_type: 10,
			extension_type: 'ATTRIBUTE',
			key_to: 'name',
		},
		{
			key: 'user_text_1',
			name: 'User text 1',
			value_type: 10,
			extension_type: 'ATTRIBUTE',
			key_to: 'short_name',
		},
		{
			key: 'user_text_2',
			name: 'User text 2',
			value_type: 10,
			extension_type: 'ATTRIBUTE',
			key_to: 'short_name',
		},
		{
			key: 'user_text_3',
			name: 'User text 3',
			value_type: 10,
			extension_type: 'ATTRIBUTE',
			key_to: 'short_name',
		},

		{
			key: 'instrument_type.name',
			name: 'Instrument type. Name',
			value_type: 10,
			extension_type: 'NULL',
			options_for_key_to: 'dynamic_attributes',
		},

		{
			key: 'instrument_type.short_name',
			name: 'Instrument type. Short name',
			value_type: 10,
			extension_type: 'NULL',
			options_for_key_to: 'dynamic_attributes',
		},
		{
			key: 'instrument_type.user_code',
			name: 'Instrument type. User code',
			value_type: 10,
			extension_type: 'NULL',
			options_for_key_to: 'dynamic_attributes',
		},
	]

	vm.currencyAttributeTypes = []
	vm.instrumentAttributeTypes = []

	vm.instrument_system_attributes = []
	vm.instrument_dynamic_attributes = []
	vm.currency_system_attributes = []
	vm.currency_dynamic_attributes = []

	vm.getData = function () {
		vm.instrument_system_attributes = []
		vm.instrument_dynamic_attributes = []
		vm.currency_system_attributes = []
		vm.currency_dynamic_attributes = []

		vm.readyStatus.content = false

		uiService
			.getCrossEntityAttributeExtensionList({ pageSize: 1000 })
			.then(function (data) {
				vm.readyStatus.content = true

				vm.createDataStructure(data)

				$scope.$apply()
			})
	}

	vm.createDataStructure = function (data) {



		console.log(
			'createDataStructure.instrumentAttributes',
			vm.instrumentAttributes
		)

		console.log(
			'createDataStructure.currencyAttributeTypes',
			vm.currencyAttributeTypes
		)
		console.log(
			'createDataStructure.instrumentAttributeTypes',
			vm.instrumentAttributeTypes
		)

		// Creating Instrument System Attribute

		vm.instrumentAttributes.forEach(function (item) {
			vm.instrument_system_attributes.push({
				context_content_type: 'reports.balancereport',
				content_type_from: 'instruments.instrument',
				content_type_to: 'currencies.currency',
				is_hidden: item.is_hidden,
				key_from: item.key,
				value_type: item.value_type,
				name: item.name,
				extension_type: item.extension_type,
				key_to: item.key_to,
				value_to: null,
				options_for_key_to: item.options_for_key_to,
			})
		})

		// Creating Instrument Dynamic Attribute

		vm.instrumentAttributeTypes.forEach(function (item) {
			vm.instrument_dynamic_attributes.push({
				context_content_type: 'reports.balancereport',
				content_type_from: 'instruments.instrument',
				content_type_to: 'currencies.currency',
				key_from: item.key,
				value_type: item.value_type,
				name: item.name,
				extension_type: 'NULL',
				key_to: null,
				value_to: null,
			})
		})

		// Creating Currency System Attribute

		vm.currencyAttributes.forEach(function (item) {
			vm.currency_system_attributes.push({
				context_content_type: 'reports.balancereport',
				content_type_from: 'currencies.currency',
				content_type_to: 'instruments.instrument',
				is_hidden: item.is_hidden,
				key_from: item.key,
				value_type: item.value_type,
				name: item.name,
				extension_type: item.extension_type,
				key_to: item.key_to,
				value_to: null,
			})
		})

		// Creating Currency Dynamic Attribute

		vm.currencyAttributeTypes.forEach(function (item) {
			vm.currency_dynamic_attributes.push({
				context_content_type: 'reports.balancereport',
				content_type_from: 'currencies.currency',
				content_type_to: 'instruments.instrument',
				key_from: item.key,
				value_type: item.value_type,
				name: item.name,
				extension_type: 'NULL',
				key_to: null,
				value_to: null,
			})
		})

		function mapItem(itemToMap) {
			data.results.forEach(function (item) {
				if (itemToMap.context_content_type === item.context_content_type) {
					if (itemToMap.content_type_from === item.content_type_from) {
						if (itemToMap.content_type_to === item.content_type_to) {
							if (itemToMap.key_from === item.key_from) {
								itemToMap.id = item.id
								itemToMap.key_to = item.key_to
								itemToMap.value_to = item.value_to
								itemToMap.extension_type = item.extension_type
							}
						}
					}
				}
			})
		}

		vm.instrument_system_attributes.forEach(mapItem)
		vm.instrument_dynamic_attributes.forEach(mapItem)

		vm.currency_system_attributes.forEach(mapItem)
		vm.currency_dynamic_attributes.forEach(mapItem)

		console.log(
			'createDataStructure.currency_system_attributes',
			vm.currency_system_attributes
		)
		console.log(
			'createDataStructure.instrument_system_attributes',
			vm.instrument_system_attributes
		)

		console.log(
			'createDataStructure.currency_dynamic_attributes',
			vm.currency_dynamic_attributes
		)
		console.log(
			'createDataStructure.instrument_dynamic_attributes',
			vm.instrument_dynamic_attributes
		)
	}

	vm.getAttributeTypes = function () {
		return new Promise(function (resolve, reject) {
			var promises = []

			promises.push(
				new Promise(function (resolve, reject) {


					try {
						attributeTypeService
							.getList('instrument', { pageSize: 1000 })
							.then(function (data) {
								vm.instrumentAttributeTypes = data.results.map(function (item) {
									item.key = 'attributes.' + item.user_code

									if (item.value_type === 30) {
										item.value_type = 10
									}

									return item
								})

								resolve()
							})
					} catch (error) {


						resolve()
					}
				})
			)

			promises.push(
				new Promise(function (resolve, reject) {


					try {
						attributeTypeService
							.getList('currency', { pageSize: 1000 })
							.then(function (data) {
								vm.currencyAttributeTypes = data.results.map(function (item) {
									if (item.value_type === 30) {
										item.value_type = 10
									}

									item.key = 'attributes.' + item.user_code

									return item
								})

								resolve()
							})
					} catch (error) {


						resolve()
					}
				})
			)

			Promise.all(promises).then(function (value) {
				vm.readyStatus.attributeTypes = true

				$scope.$apply()

				resolve()
			})
		})
	}

	vm.save = function () {
		vm.readyStatus.processing = true

		var promises = []

		function handleItem(item) {
			promises.push(
				new Promise(function (resolve, reject) {
					if (item.key_to || item.value_to) {
						if (item.id) {
							uiService
								.updateCrossEntityAttributeExtension(item.id, item)
								.then(function (data) {
									resolve(data)
								})
						} else {
							uiService
								.createCrossEntityAttributeExtension(item)
								.then(function (data) {
									resolve(data)
								})
						}
					} else {
						resolve()
					}
				})
			)
		}

		vm.instrument_system_attributes.forEach(handleItem)
		vm.instrument_dynamic_attributes.forEach(handleItem)

		vm.currency_system_attributes.forEach(handleItem)
		vm.currency_dynamic_attributes.forEach(handleItem)

		Promise.all(promises)
			.then(function (data) {


				vm.getData()

				vm.readyStatus.processing = false

				$scope.$apply()

				toastNotificationService.success('Success. Changes have been saved')
			})
			.catch(function (error) {
				vm.readyStatus.processing = false

				$scope.$apply()

				toastNotificationService.error(
					'Error. Error occurred while trying to save tooltips'
				)
			})
	}

	vm.init = function () {
		vm.getAttributeTypes().then(function () {
			vm.getData()
		})
	}

	vm.init()
}
