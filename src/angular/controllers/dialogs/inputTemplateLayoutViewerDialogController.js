/**
 * Created by szhitenev on 05.11.2019.
 */

export default function ($scope, $mdDialog, metaContentTypesService, data) {
	console.log('data', data)

	var vm = this

	vm.template = JSON.parse(JSON.stringify(data.template))

	vm.template.data.inputs.forEach(function (input) {
		input.is_active = true
	})

	vm.contentTypes = metaContentTypesService.getListForTransactionTypeInputs()

	vm.valueTypes = [
		{
			display_name: 'Number',
			value: 20,
		},
		{
			display_name: 'String',
			value: 10,
		},
		{
			display_name: 'Date',
			value: 40,
		},
		{
			display_name: 'Relation',
			value: 100,
		},
	]

	vm.contextProperties = {
		'instruments.instrument': [
			{
				key: 'context_instrument',
				name: 'Context Instrument',
			},

			// TODO is not in use now
			// {
			//     id: 9,
			//     name: 'position'
			// },
			// {
			//     id: 10,
			//     name: 'effective_date'
			// }
		],
		'currencies.currency': [
			{
				key: 'context_pricing_currency',
				name: 'Context Pricing Currency',
			},
			{
				key: 'context_accrued_currency',
				name: 'Context Accrued Currency',
			},
		],
		'portfolios.portfolio': [
			{
				key: 'context_portfolio',
				name: 'Context Portfolio',
			},
		],
		'accounts.account': [
			{
				key: 'context_account',
				name: 'Context Account',
			},
		],
		'strategies.strategy1': [
			{
				key: 'context_strategy1',
				name: 'Context Strategy 1',
			},
		],
		'strategies.strategy2': [
			{
				key: 'context_strategy2',
				name: 'Context Strategy 2',
			},
		],
		'strategies.strategy3': [
			{
				key: 'context_strategy3',
				name: 'Context Strategy 3',
			},
		],
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.template.data.inputs = vm.template.data.inputs.filter(function (input) {
			return input.is_active
		})

		$mdDialog.hide({ status: 'agree', data: { template: vm.template } })
	}
}
