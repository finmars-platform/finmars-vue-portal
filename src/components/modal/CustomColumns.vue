<template>
	<BaseModal :title="title">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmBtn type="text" @click="createCustomColumns(item)">Add New</FmBtn>

				<FmBtn type="primary" @click="save">RETURN TO VIEW</FmBtn>
			</div>
			<div class="content">
				<div class="card" v-for="(item, index) in newAttrsList" :key="index">
					<div class="card__inner">
						<h3 class="card__title">{{ item?.name }}</h3>
						<div class="card__btn">
							<div class="card__edit">
								<FmIcon
									@click="editCustomColumns(item)"
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
			<div v-if="isOpenEditCustomColumns">
				<ModalEditCustomColumns
					title="Edit Custom Column"
					v-model="isOpenEditCustomColumns"
					:name="activeCustomColumns.name"
					:user_code="activeCustomColumns.user_code"
					:notes="activeCustomColumns.notes"
					:value_type="activeCustomColumns.value_type"
					:expr="activeCustomColumns.expr"
					:valueTypeItems="valueTypeItems"
					:typeModal="typeModal"
					@save="putEditCustomColumns"
					@create="getCreateCustomColumns"
				></ModalEditCustomColumns>
			</div>

			<!-- :name="activeCustomColumns.name"

			 :user_code="activeCustomColumns.user_code"
		:content_type="content_type"
				@save="renameCustomColumns" 

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
	import { VAceEditor } from 'vue3-ace-editor'
	import 'ace-builds/src-noconflict/mode-json'
	import 'ace-builds/src-noconflict/theme-monokai'
	let props = defineProps({
		title: String,
		content_type: String,
	})

	const isOpenDeleteCustomColumns = ref(false)
	const isOpenEditCustomColumns = ref(false)
	const evAttrsStore = useEvAttributesStore()

	let vm = reactive({ content_type: props.content_type })
	let valueTypeItems = reactive([
		{
			id: 10,
			name: 'Text',
		},
		{
			id: 20,
			name: 'Number',
		},
		{
			id: 40,
			name: 'Date',
		},
	])
	let typeModal = ref()
	let activeCustomColumns = ref([
		{
			expr: '',
		},
		{
			id: '',
		},
		{
			name: '',
		},
		{
			notes: '',
		},
		{
			user_code: '',
		},
		{
			value_type: '',
		},
	])

	// activeCustomColumns.name = ""
	// activeCustomColumns.user_code = ""
	// console.log(' test props.content_type', props.content_type)
	// console.log(' vm', vm)

	// vm.attributeDataService = attributeDataService
	// vm.entityViewerEventService = entityViewerEventService
	vm.customFields = []
	// async function getAttrsList() {}

	// let attrsList = ref()

	let attrsList = await evAttrsStore.getFetchCustomFields(props.content_type)
	let newAttrsList = ref(attrsList)

	// console.log('attrsListfv снаружиs', attrsList)
	// console.log('newAttrsList снаружиs', newAttrsList.value)

	// async function init() {
	// 	let res = await evAttrsStore.getFetchCustomFields(props.content_type)
	// 	console.log('res внутри ', res)
	// 	return attrsList = res
	// }

	// init()
	// console.log('attrsListfv снаружи', attrsList)

	// getAttrsList()

	vm.readyStatus = { customFields: false, attributes: false }

	async function deleteColumns(item) {
		// console.log('itemitem', item)
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			deleteCustomColumns(item)
		}
	}

	function deleteCustomColumns(item) {
		let res = useApi('balanceReportCustomFieldList.delete', {
			params: { id: item.id },
			body: item,
		})
		if (res.error) {
			useNotify({
				type: 'error',
				title: res.error.message || res.error.detail,
			})
			throw new Error(res.error)
		} else if (res.status === 'conflict') {
			useNotify({
				type: 'error',
				title: 'You can not delete attributed that already in use',
			})
			throw new Error(res.error)
		}
		useNotify({ type: 'success', title: `data delete on the server` })
		newAttrsList = newAttrsList.value.filter((number) => number.id !== item.id)
		// console.log('newAttrsList  deleteCustomColumns', newAttrsList)
	}

	function editCustomColumns(newNamesData) {
		activeCustomColumns = newNamesData
		console.log('activeCustomColumns снаружиs', activeCustomColumns)
		// emit('rename', newNamesData)
		typeModal = 'edit'
		isOpenEditCustomColumns.value = true
	}
	function createCustomColumns(newNamesData) {
		// console.log('activeCustomColumns снаружиs', activeCustomColumns)
		// emit('rename', newNamesData)
		typeModal = 'create'
		isOpenEditCustomColumns.value = true
	}
	function putEditCustomColumns(newNamesData) {
		console.log('putEditCustomColumns newNamesData.id', activeCustomColumns.id)
		let res = useApi('balanceReportCustomFieldList.put', {
			params: { id: activeCustomColumns.id },
			body: newNamesData,
		})
		if (res.error) {
			useNotify({
				type: 'error',
				title: res.error.message || res.error.detail,
			})
			throw new Error(res.error)
		} else if (res.status === 'conflict') {
			useNotify({
				type: 'error',
				title: 'You can not Edit CustomColumns that already in use',
			})
			throw new Error(res.error)
		}
		useNotify({ type: 'success', title: `data Edit on the server` })
		console.log(
			'isOpenEditCustomColumns.value сначала',
			isOpenEditCustomColumns.value
		)
		isOpenEditCustomColumns.value = false
		console.log(
			'isOpenEditCustomColumns.value снаружиs',
			isOpenEditCustomColumns.value
		)
	}

	function getCreateCustomColumns(newNamesData) {
		let res = useApi('balanceReportCustomFieldList.get', {
			body: newNamesData,
		})
		if (res.error) {
			useNotify({
				type: 'error',
				title: res.error.message || res.error.detail,
			})
			throw new Error(res.error)
		} else if (res.status === 'conflict') {
			useNotify({
				type: 'error',
				title: 'You can not Edit CustomColumns that already in use',
			})
			throw new Error(res.error)
		}
		useNotify({ type: 'success', title: `data Edit on the server` })
		console.log(
			'isOpenEditCustomColumns.value сначала',
			isOpenEditCustomColumns.value
		)
		isOpenEditCustomColumns.value = false
		console.log(
			'isOpenEditCustomColumns.value снаружиs',
			isOpenEditCustomColumns.value
		)
	}
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
