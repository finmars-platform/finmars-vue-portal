/**
 * Created by szhitenev on 22.06.2020.
 */

export default function entityTooltipPage(
	$scope,
	toastNotificationService,
	attributeTypeService,
	metaContentTypesService,
	uiService
) {
	var vm = this

	vm.readyStatus = {
		content: false,
		attributeTypes: false,
	}

	vm.tabs = [
		{
			name: 'Instrument',
			content_type: 'instruments.instrument',
			items: [],
		},
		{
			name: 'Portfolio',
			content_type: 'portfolios.portfolio',
			items: [],
		},
		{
			name: 'Account',
			content_type: 'accounts.account',
			items: [],
		},
		{
			name: 'Responsible',
			content_type: 'counterparties.responsible',
			items: [],
		},
		{
			name: 'Counterparty',
			content_type: 'counterparties.counterparty',
			items: [],
		},
		{
			name: 'Currency',
			content_type: 'currencies.currency',
			items: [],
		},
		{
			name: 'Strategy 1',
			content_type: 'strategies.strategy1',
			items: [],
		},
		{
			name: 'Strategy 2',
			content_type: 'strategies.strategy2',
			items: [],
		},
		{
			name: 'Strategy 3',
			content_type: 'strategies.strategy3',
			items: [],
		},
		{
			name: 'Account Type',
			content_type: 'accounts.accounttype',
			items: [],
		},
		{
			name: 'Instrument Type',
			content_type: 'instruments.instrumenttype',
			items: [],
		},
		// {
		//     name: "Transaction Type",
		//     content_type: 'transactions.transactiontype',
		//     items: []
		// },
		{
			name: 'Price',
			content_type: 'instruments.pricehistory',
			items: [],
		},
		{
			name: 'FX Rate',
			content_type: 'currencies.currencyhistory',
			items: [],
		},
	]

	vm.attributeTypes = {}

	vm.getData = function () {
		vm.tabs = [
			{
				name: 'Instrument',
				content_type: 'instruments.instrument',
				items: [],
			},
			{
				name: 'Portfolio',
				content_type: 'portfolios.portfolio',
				items: [],
			},
			{
				name: 'Account',
				content_type: 'accounts.account',
				items: [],
			},
			{
				name: 'Responsible',
				content_type: 'counterparties.responsible',
				items: [],
			},
			{
				name: 'Counterparty',
				content_type: 'counterparties.counterparty',
				items: [],
			},
			{
				name: 'Currency',
				content_type: 'currencies.currency',
				items: [],
			},
			{
				name: 'Strategy 1',
				content_type: 'strategies.strategy1',
				items: [],
			},
			{
				name: 'Strategy 2',
				content_type: 'strategies.strategy2',
				items: [],
			},
			{
				name: 'Strategy 3',
				content_type: 'strategies.strategy3',
				items: [],
			},
			{
				name: 'Account Type',
				content_type: 'accounts.accounttype',
				items: [],
			},
			{
				name: 'Instrument Type',
				content_type: 'instruments.instrumenttype',
				items: [],
			},
			// {
			//     name: "Transaction Type",
			//     content_type: 'transactions.transactiontype',
			//     items: []
			// },
			{
				name: 'Price',
				content_type: 'instruments.pricehistory',
				items: [],
			},
			{
				name: 'FX Rate',
				content_type: 'currencies.currencyhistory',
				items: [],
			},
		]

		vm.readyStatus.content = false

		uiService.getEntityTooltipList({ pageSize: 1000 }).then(function (data) {
			vm.readyStatus.content = true

			data.results.forEach(function (item) {
				vm.tabs.forEach(function (tab) {
					if (tab.content_type === item.content_type) {
						tab.items.push(item)
					}
				})
			})



			$scope.$apply()
		})
	}

	vm.getAttributeTypes = function () {
		var promises = []

		vm.tabs.forEach(function (tab) {
			var entity = metaContentTypesService.findEntityByContentType(
				tab.content_type
			)

			promises.push(
				new Promise(function (resolve, reject) {


					try {
						attributeTypeService
							.getList(entity, { pageSize: 1000 })
							.then(function (data) {
								vm.attributeTypes[tab.content_type] = data.results

								resolve()
							})
					} catch (error) {


						resolve()
					}
				})
			)
		})

		Promise.all(promises).then(function (value) {
			vm.readyStatus.attributeTypes = true

			$scope.$apply()
		})
	}

	vm.saveTooltips = function () {
		var promises = []



		vm.tabs.forEach(function (tab) {
			tab.items.forEach(function (item) {
				if (item.changed) {
					promises.push(
						new Promise(function (resolve, reject) {
							uiService
								.updateEntityTooltip(item.id, item)
								.then(function (data) {
									resolve(data)
								})
						})
					)
				}
			})

			if (vm.attributeTypes[tab.content_type]) {
				vm.attributeTypes[tab.content_type].forEach(function (attributeType) {
					if (attributeType.changed) {
						var entity = metaContentTypesService.findEntityByContentType(
							tab.content_type
						)

						promises.push(
							new Promise(function (resolve, reject) {
								attributeTypeService
									.update(entity, attributeType.id, attributeType)
									.then(function (value) {
										resolve()
									})
							})
						)
					}
				})
			}
		})

		Promise.all(promises)
			.then(function (data) {
				vm.getData()

				toastNotificationService.success('Success. Changes have been saved')
			})
			.catch(function (error) {
				toastNotificationService.error(
					'Error. Error occurred while trying to save tooltips'
				)
			})
	}

	vm.init = function () {
		vm.getData()
		vm.getAttributeTypes()
	}

	vm.init()
}
