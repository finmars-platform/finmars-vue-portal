import membersAndGroupsService from '../../services/membersAndGroupsService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.group = {
		name: '',
		is_public: false,
		members: [],
	}

	vm.membersList = []
	vm.assignedMembersList = []

	vm.processing = false

	vm.readyStatus = { content: false }

	vm.presets = [
		{
			id: 1,
			name: 'Administrators',
			data: {
				data: {
					create_objects: true,
					inherit_rights: false,
					manage_attributes: true,
					creator_manage: true,
					creator_change: true,
					creator_view: true,
					other_manage: true,
					other_change: true,
					other_view: true,
				},
				configuration: {
					creator_change: true,
					creator_view: true,
				},
				function: {
					creator_view: true,
				},
			},
		},
		{
			id: 2,
			name: 'Extended Access Users',
			data: {
				data: {
					create_objects: true,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: true,
					creator_change: true,
					creator_view: true,
					other_manage: false,
					other_change: true,
					other_view: true,
				},
				configuration: {
					creator_change: true,
					creator_view: false,
				},
				function: {
					creator_view: true,
				},
			},
		},
		{
			id: 3,
			name: 'Normal Access Users',
			data: {
				data: {
					create_objects: true,
					inherit_rights: true,
					manage_attributes: false,
					creator_manage: false,
					creator_change: true,
					creator_view: true,
					other_manage: false,
					other_change: true,
					other_view: true,
				},
				configuration: {
					creator_change: false,
					creator_view: false,
				},
				function: {
					creator_view: false,
				},
			},
		},
		{
			id: 4,
			name: 'Restricted Access Users',
			data: {
				data: {
					create_objects: true,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: true,
					creator_view: true,
					other_manage: false,
					other_change: false,
					other_view: true,
				},
				configuration: {
					creator_change: false,
					creator_view: false,
				},
				function: {
					creator_view: false,
				},
			},
		},
		{
			id: 5,
			name: 'View Access Users',
			data: {
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: true,
				},
				configuration: {
					creator_change: false,
					creator_view: false,
				},
				function: {
					creator_view: false,
				},
			},
		},
		{
			id: 6,
			name: 'Restricted Access Guests',
			data: {
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
				configuration: {
					creator_change: false,
					creator_view: false,
				},
				function: {
					creator_view: false,
				},
			},
		},
	]

	vm.permissionTable = {
		data: [
			{
				name: 'Portfolios',
				content_type: 'portfolios.portfolio',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Accounts',
				content_type: 'accounts.account',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Instruments',
				content_type: 'instruments.instrument',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Counterparties',
				content_type: 'counterparties.counterparty',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Responsibles',
				content_type: 'counterparties.responsible',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Currency',
				content_type: 'currencies.currency',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Strategy 1',
				content_type: 'strategies.strategy1',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Strategy 2',
				content_type: 'strategies.strategy2',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Strategy 3',
				content_type: 'strategies.strategy3',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Account Type',
				content_type: 'accounts.accounttype',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Instrument Type',
				content_type: 'instruments.instrumenttype',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
			{
				name: 'Transaction Type',
				content_type: 'transactions.transactiontype',
				data: {
					create_objects: false,
					inherit_rights: false,
					manage_attributes: false,
					creator_manage: false,
					creator_change: false,
					creator_view: false,
					other_manage: false,
					other_change: false,
					other_view: false,
				},
			},
		],
		configuration: [
			{
				name: 'User Attributes',
				content_type: 'obj_attrs.attributetype',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Reference Tables',
				content_type: 'reference_tables.referencetable',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Templates',
				content_type: 'ui.templatelayout',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Mapping Tables',
				content_type: 'integrations.mappingtable',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Price Schemes',
				content_type: 'integrations.pricedownloadscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Instrument Schemes',
				content_type: 'integrations.instrumentdownloadscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Data Import',
				content_type: 'csv_import.csvimportscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Transaction Import',
				content_type: 'integrations.complextransactionimportscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Complex Import',
				content_type: 'complex_import.compleximportscheme',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
			{
				name: 'Aliases',
				content_type: 'ui.userfield',
				data: {
					creator_change: false,
					creator_view: false,
				},
			},
		],
		function: [
			{
				name: 'Import Data',
				content_type: 'function.import_data',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import Transactions',
				content_type: 'function.import_transactions',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import Complex',
				content_type: 'function.import_complex',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import From Provider - Instrument',
				content_type: 'function.provider_download_instrument',
				data: {
					creator_view: false,
				},
			},
			{
				name: 'Import From Provider - Prices',
				content_type: 'function.provider_download_price',
				data: {
					creator_view: false,
				},
			},
		],
	}

	vm.activePresetId = 6

	vm.presetChange = function ($event) {


		var preset

		vm.presets.forEach(function (item) {
			if (item.id === vm.activePresetId) {
				preset = item
			}
		})



		vm.permissionTable.data = vm.permissionTable.data.map(function (item) {
			Object.keys(preset.data.data).forEach(function (key) {
				if (key === 'inherit_rights') {
					if (
						item.content_type === 'accounts.account' ||
						item.content_type === 'instruments.instrument'
					) {
						item.data[key] = preset.data.data[key]
					}
				} else {
					if (!item.data.inherit_rights) {
						item.data[key] = preset.data.data[key]
					}
				}
			})

			return item
		})

		vm.permissionTable.configuration = vm.permissionTable.configuration.map(
			function (item) {
				Object.keys(preset.data.configuration).forEach(function (key) {
					item.data[key] = preset.data.configuration[key]
				})

				return item
			}
		)

		vm.permissionTable.function = vm.permissionTable.function.map(function (
			item
		) {
			Object.keys(preset.data.function).forEach(function (key) {
				item.data[key] = preset.data.function[key]
			})

			return item
		})

		setTimeout(function () {
			$scope.$apply()
		}, 0)


	}

	vm.getData = function () {
		membersAndGroupsService.getMembersList().then(function (data) {
			vm.membersList = data.results



			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.agree = function () {
		vm.processing = true

		vm.group.members = vm.assignedMembersList.map(function (group) {
			return group.id
		})

		vm.group.permission_table = vm.permissionTable

		membersAndGroupsService.createGroup(vm.group).then(function () {
			vm.processing = false

			$mdDialog.hide({ status: 'agree' })
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.init = function () {
		vm.getData()
	}

	vm.init()
}
