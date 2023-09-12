<template>
	<BaseModal :title="title">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmBtn type="text" @click="cancel">Add New</FmBtn>

				<FmBtn type="primary" @click="save">RETURN TO VIEW</FmBtn>
			</div>
			<div class="content">
				<div class="card">
					<div class="card__inner">
						<h3 class="card__title">Position Reverse (Lombard)</h3>
						<div class="card__btn">
							<div
								class="card__edit"
								@click=";(isOpenDeleteCustomColumns = true), close()"
							>
								<FmIcon class="m-l-4" icon="edit" />
							</div>
							<div
								class="card__delete"
								@click=";(isOpenEditCustomColumns = true), close()"
							>
								<FmIcon class="m-l-4" icon="delete" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<ModalDeleteCustomColumns
				title="Custom Field Manager"
				v-model="isOpenDeleteCustomColumns"
			></ModalDeleteCustomColumns>
			<ModalEditCustomColumns
				title="Custom Field Manager"
				v-model="isOpenEditCustomColumns"
			></ModalEditCustomColumns>
		</div>

		<template #controls="{ cancel }">
			<slot name="controls" :cancel="cancel">
				<div>
					<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>
				</div>
			</slot>
		</template>
	</BaseModal>
</template>

<script setup>
	let props = defineProps({
		title: String,
		content_type: String,
		attributeDataService: String,
		entityViewerEventService: String,
	})
	const isOpenDeleteCustomColumns = ref(false)
	const isOpenEditCustomColumns = ref(false)
	const evAttrsStore = useEvAttributesStore()

	let vm = reactive({ content_type: props.content_type })
	// console.log(' test props.content_type', props.content_type)
	console.log(' vm', vm)

	// vm.attributeDataService = attributeDataService
	// vm.entityViewerEventService = entityViewerEventService
	vm.customFields = []
	const attrsList = evAttrsStore.getFetchCustomColumns(props.content_type)
	const attrsList2 = evAttrsStore.getDataForAttributesSelector(props.content_type)
	vm.readyStatus = { customFields: false, attributes: false }

	console.log('attrsList', attrsList)
	console.log('attrsList2', attrsList2)
	// vm.getList = function () {
	// 	customFieldService.getList(props.content_type).then(function (data) {
	// 		vm.customFields = data.results

	// 		console.log('vm.customFields', vm.customFields)

	// 		vm.readyStatus.customFields = true

	// 		$scope.$apply()
	// 	})
	// }

	// init()
	// async function init() {
	// 	let res = await Promise.all([
	// 		evAttrsStore.getFetchCustomFields(),

	// 		console.log('evAttrsStore', evAttrsStore),
	// 	])
	// 	evAttrsStore.value = res[0].results
	// }
	// console.log('evAttrsStore', evAttrsStore)
</script>

<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
		min-width: 610px;
	}
	.card {
		padding: 14px;
		box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
			rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 2px 1px -1px;
		margin: 8px;
	}
	.card__btn {
		display: flex;
	}
	.card__inner {
		display: flex;
		justify-content: space-between;
	}
	.card__title {
		color: rgba(0, 0, 0, 0.87);
		font-size: 16px;
		font-weight: 700;
	}
</style>
