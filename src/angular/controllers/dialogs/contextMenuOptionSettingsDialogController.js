/**
 * Created by szhitenev on 05.05.2016.
 */

var MARK_ROW_TYPES = [
	{ id: 1, name: 'Mark row red', action_data: 'red' },
	{ id: 2, name: 'Mark row green', action_data: 'green' },
	{ id: 3, name: 'Undo mark row', action_data: 'undo_mark_row' },
]

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = {}
	vm.transactionTypes = []
	vm.layoutsGrouped = []

	if (data.item) {
		vm.item = data.item
	}

	if (data.transactionTypes) {
		vm.transactionTypes = data.transactionTypes
	}

	if (data.layoutsGrouped) {
		vm.layoutsGrouped = data.layoutsGrouped
	}

	vm.actions = [
		{
			name: 'Edit Transaction',
			action: 'rebook_transaction',
		},
		{
			name: 'Edit Instrument',
			action: 'edit_instrument',
		},
		{
			name: 'Edit Account',
			action: 'edit_account',
		},
		{
			name: 'Edit Portfolio',
			action: 'edit_portfolio',
		},
		{
			name: 'Edit Price',
			action: 'edit_price',
		},
		{
			name: 'Edit FX Rate',
			action: 'edit_fx_rate',
		},
		{
			name: 'Edit Pricing FX Rate',
			action: 'edit_pricing_currency_price',
		},
		{
			name: 'Edit Accrued FX Rate',
			action: 'edit_accrued_currency_fx_rate',
		},
		{
			name: 'Edit Currency',
			action: 'edit_currency',
		},
		{
			name: 'Edit Pricing Currency',
			action: 'edit_pricing_currency',
		},
		{
			name: 'Edit Accrued Currency',
			action: 'edit_accrued_currency',
		},
		{
			name: 'Open Book Manager',
			action: 'book_transaction',
		},
		{
			name: 'Book Specific Transaction Type',
			action: 'book_transaction_specific',
		},
		{
			name: 'Open Layout',
			action: 'open_layout',
		},
		{
			name: 'Mark row',
			action: 'mark_row',
		},

		{
			name: 'Add Instrument',
			action: 'add_instrument',
		},
		{
			name: 'Add Account',
			action: 'add_account',
		},
		{
			name: 'Add Currency',
			action: 'add_currency',
		},
		{
			name: 'Add Portfolio',
			action: 'add_portfolio',
		},
		{
			name: 'Add Price',
			action: 'add_price',
		},
		{
			name: 'Add FX Rate',
			action: 'add_fx_rate',
		},
	]

	vm.markRowTypes = MARK_ROW_TYPES

	vm.updateLayout = function (item) {
		if (!vm.item.hasOwnProperty('action_data')) {
			vm.item.action_data = {}
		}

		vm.item.action_data.content_type = item.content_type


	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({
			status: 'agree',
			data: {
				item: vm.item,
			},
		})
	}

	vm.init = function () {}

	vm.init()
}
