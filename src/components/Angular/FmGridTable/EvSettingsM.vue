<template>
	<BaseModal title="Entity viewer settings" @close="vm.cancel()">
		<RvSettingsRow label="Rows per page">
			<BaseInput v-model="vm.itemsToLoad" />
		</RvSettingsRow>

		<RvSettingsRow label="Filter items by statuses">
			<BaseMultiSelectInput
				v-model="vm.entityFilters"
				title="Filter items by statuses"
				item_id="value"
				:items="vm.multiselectorOptions"
			/>
		</RvSettingsRow>

		<md-input-container
			flex="100"
			v-if="vm.entityType == 'complex-transaction'"
		>
			<label>Filter transactions by statuses</label>
			<md-select v-model="vm.complexTransactionFilters" multiple>
				<md-option value="booked">Booked</md-option>
				<md-option value="ignored">Ignored</md-option>
			</md-select>
		</md-input-container>

		<template #controls>
			<div class="flex aic sb">
				<FmBtn type="text" @click="vm.cancel()"> Cancel </FmBtn>

				<FmBtn @click="vm.saveSettings()">Save</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'

	const props = defineProps(['payload'])
	const { resolve, reject } = props.payload

	// $scope
	var vm = reactive({})

	vm.entityType = evDataService.getContentType()

	vm.multiselectorOptions = []

	var pagePagination = evDataService.getPagination()

	vm.cancel = function () {
		reject()
		delete $mdDialog.modals['GEntityViewerSettingsDialogController']
	}

	var getMultiselectorData = function () {
		var result = {
			optionsList: [],
			selectedByDefault: [],
		}

		switch (vm.entityType) {
			case 'instrument':
				result.optionsList = [
					{ value: 'active', name: 'Active', activeByDefault: '' },
					{ value: 'inactive', name: 'Inactive', activeByDefault: '' },
					{ value: 'disabled', name: 'Disabled', activeByDefault: '' },
					{ value: 'deleted', name: 'Deleted', activeByDefault: '' },
				]

				result.selectedByDefault = ['active', 'inactive', 'disabled']

				break

			case 'complex-transaction':
				result.optionsList = [
					{ value: 'locked', name: 'Locked' },
					{ value: 'unlocked', name: 'Unlocked' },
					{ value: 'ignored', name: 'Ignored' },
					{ value: 'partially_visible', name: 'Partially Visible' },
				]

				result.selectedByDefault = ['locked', 'unlocked']

				break

			default:
				result.optionsList = [
					{ value: 'enabled', name: 'Enabled' },
					{ value: 'disabled', name: 'Disabled' },
					{ value: 'deleted', name: 'Deleted' },
				]

				result.selectedByDefault = ['enabled', 'disabled']

				break
		}

		return result
	}

	vm.saveSettings = function () {
		if (pagePagination.page_size !== vm.itemsToLoad) {
			pagePagination = evDataService.getPagination()
			pagePagination.page_size = vm.itemsToLoad

			evDataService.setPagination(pagePagination)

			evEventService.dispatchEvent(evEvents.ENTITY_VIEWER_PAGINATION_CHANGED)
		}

		var entityViewerOptions = {}
		//entityViewerOptions.complex_transaction_filters = vm.complexTransactionFilters;
		entityViewerOptions.entity_filters = vm.entityFilters
		if (vm.entityType === 'complex-transaction') {
			entityViewerOptions.complex_transaction_filters =
				vm.complexTransactionFilters
		}
		evDataService.setEntityViewerOptions(entityViewerOptions)

		resolve({
			status: 'agree',
		})
		delete $mdDialog.modals['GEntityViewerSettingsDialogController']
	}

	var init = function () {
		var entityViewerOptions = evDataService.getEntityViewerOptions()

		var multselData = getMultiselectorData()
		vm.multiselectorOptions = multselData.optionsList
		//vm.complexTransactionFilters = entityViewerOptions.complex_transaction_filters;
		vm.entityFilters = entityViewerOptions.entity_filters

		if (vm.entityType === 'complex-transaction') {
			vm.complexTransactionFilters =
				entityViewerOptions.complex_transaction_filters
		} else {
			vm.complexTransactionFilters = ['booked']
		}

		if (!vm.entityFilters) {
			vm.entityFilters = multselData.selectedByDefault
		}

		vm.itemsToLoad = pagePagination.page_size
	}

	init()
</script>

<style lang="scss" scoped></style>
