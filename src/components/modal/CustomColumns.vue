<template>
	<BaseModal :title="title">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmBtn type="text" @click=";(isOpenEditCustomColumns = true), close()"
					>Add New</FmBtn
				>

				<FmBtn type="primary" @click="save">RETURN TO VIEW</FmBtn>
			</div>
			<div class="content">
				<div class="card" v-for="(item, index) in attrsList" :key="index">
					<div class="card__inner">
						<h3 class="card__title">{{ item?.name }}</h3>
						<div class="card__btn">
							<div class="card__edit">
								<FmIcon
									@click=";(isOpenEditCustomColumns = true), close()"
									class="m-l-4"
									icon="edit"
								/>
							</div>
							<div class="card__delete">
								<FmIcon
									@click="deleteColumns(item)"
									class="m-l-4"
									icon="delete"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ModalEditCustomColumns
				title="Edit Custom Column"
				v-model="isOpenEditCustomColumns"
				:content_type="content_type"
				@save="renameCustomColumns"
			></ModalEditCustomColumns>
			<!-- :name="activeLayout.name"
		:user_code="activeLayout.user_code"
		:content_type="content_type"
		:occupiedUserCodes="occupiedUserCodes"
		v-model="renameIsOpened"
		@save="renameLayout" -->
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
		activeLayout: Object,
		layouts: Array,
		autosaveLayout: Object,
		loadingLayout: Boolean,
		loadingLayoutsList: Boolean,
		content_type: String,

		isLayoutDefault: Function,
	})
	const isOpenDeleteCustomColumns = ref(false)
	const isOpenEditCustomColumns = ref(false)
	const evAttrsStore = useEvAttributesStore()

	let vm = reactive({ content_type: props.content_type })
	// console.log(' test props.content_type', props.content_type)
	// console.log(' vm', vm)

	// vm.attributeDataService = attributeDataService
	// vm.entityViewerEventService = entityViewerEventService
	vm.customFields = []

	const attrsList = await evAttrsStore.getFetchCustomFields(props.content_type)

	vm.readyStatus = { customFields: false, attributes: false }

	async function deleteColumns(item) {
		console.log('itemitem', item)
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			deleteCustomColumns(item)
		}
	}
	console.log('attrsListfv', attrsList)
	// function renameCustomColumns(newNamesData) {

	// }
	// function deleteCustomColumns(item) {
	// 	let res = useApi('balanceReportCustomFieldList.put', {
	// 		params: { id: item.id },
	// 		body: item,
	// 	})
	// 	if (res.error) {
	// 		useNotify({
	// 			type: 'error',
	// 			title: res.error.message || res.error.detail,
	// 		})
	// 		throw new Error(res.error)
	// 	} else if (res.status === 'conflict') {
	// 		useNotify({
	// 			type: 'error',
	// 			title: 'You can not delete attributed that already in use',
	// 		})
	// 		throw new Error(res.error)
	// 	}
	// }
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
	// delete.forEach(function (textField) {
	// 		if (textField.id >= 0) {
	// 			let res = useApi('complexTransactionUserField.put', {
	// 				params: { id: textField.id },
	// 				body: textField,
	// 			})
	// 			if (res.error) {
	// 				useNotify({
	// 					type: 'error',
	// 					title: res.error.message || res.error.detail,
	// 				})
	// 				throw new Error(res.error)
	// 			}
	// 		} else {
	// 			textField.configuration_code = configurationListActive.value
	// 			textField.user_code = `${configurationListActive.value}:${textField.key}`
	// 			let res = useApi('complexTransactionUserField.post', {
	// 				body: textField,
	// 			})
	// 			if (res.error) {
	// 				useNotify({
	// 					type: 'error',
	// 					title: res.error.message || res.error.detail,
	// 				})
	// 				throw new Error(res.error)
	// 			}
	// 		}
	// 	})
	// 	useNotify({ type: 'success', title: `data saved on the server` })
	// }
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
