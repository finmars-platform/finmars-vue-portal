<template>
	<BaseModal title="Matrix Settings">
		<div layout="row">
			<div style="margin: 10px 16px">
				<table-attribute-selector
					title="Abscissa"
					dialog-title="Abscissa"
					available-attrs="vm.attributes"
					item="vm.settings.abscissa"
				></table-attribute-selector>
			</div>

			<div style="margin: 10px 16px">
				<table-attribute-selector
					title="Ordinate"
					dialog-title="Ordinate"
					available-attrs="vm.attributes"
					item="vm.settings.ordinate"
				></table-attribute-selector>
			</div>

			<div style="margin: 10px 16px">
				<table-attribute-selector
					title="Value"
					dialog-title="Value"
					available-attrs="vm.numericAttributes"
					item="vm.settings.value_key"
				></table-attribute-selector>
			</div>

			<FmBtn @click="vm.openNumberFormatSettings($event)">
				Format Settings
			</FmBtn>
		</div>

		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="vm.cancel()">CANCEL</FmBtn>

				<FmBtn @click="vm.save()">OK</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	// export default function ($scope, $mdDialog, data) {
	const props = defineProps(['payload'])
	var vm = reactive({})

	const { evDataService, attributeDataService } = inject('fmTableData')
	const $mdDialog = inject('$mdDialog')
	const { resolve, reject, data } = props.payload

	vm.attributeDataService = attributeDataService
	vm.evDataService = evDataService

	vm.entityType = evDataService.getEntityType()

	vm.settings = {}

	if (data.settings) {
		vm.settings = data.settings
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.save = function () {
		$mdDialog.hide({ status: 'agree', data: { settings: vm.settings } })
	}

	vm.getAttributes = function () {
		vm.attributes = vm.attributeDataService.getAllAttributesByEntityType(
			vm.entityType
		)

		vm.numericAttributes = vm.attributes.filter(function (item) {
			return item.value_type === 20
		})
	}

	vm.openNumberFormatSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'NumberFormatSettingsDialogController as vm',
				templateUrl: 'views/dialogs/number-format-settings-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						settings: vm.settings.number_format,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.settings.number_format = res.data
				}
			})
	}

	vm.init = function () {
		vm.getAttributes()
	}

	vm.init()
</script>

<style lang="scss" scoped></style>
