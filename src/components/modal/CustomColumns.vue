<template>
	<BaseModal :title="title">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmBtn type="text" @click="createCustomColumns(item)">Add New</FmBtn>

				<FmBtn type="primary" @click="save">RETURN TO VIEW</FmBtn>
			</div>
			<div class="content">
				<div class="card" v-for="(item, index) in attrsList" :key="index">
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


	vm.customFields = []


	await evAttrsStore.getFetchCustomFields(props.content_type)


	let attrsList = computed(() => {
		return evAttrsStore.customFields[props.content_type]
	})
	

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
	}

	function editCustomColumns(newNamesData) {
		activeCustomColumns = newNamesData
		console.log('activeCustomColumns снаружиs', activeCustomColumns)
		typeModal = 'edit'
		isOpenEditCustomColumns.value = true
	}
	function createCustomColumns(newNamesData) {
		typeModal = 'create'
		isOpenEditCustomColumns.value = true
	}
	async function putEditCustomColumns(newNamesData) {
		console.log('putEditCustomColumns newNamesData.id', activeCustomColumns.id)
		let res = await useApi('balanceReportCustomFieldList.put', {
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

		await evAttrsStore.fetchCustomFields(props.content_type)
		isOpenEditCustomColumns.value = false
	}

	async function getCreateCustomColumns(newNamesData) {
		let res = await useApi('balanceReportCustomFieldList.post', {
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
		await evAttrsStore.fetchCustomFields(props.content_type)
		isOpenEditCustomColumns.value = false
	}
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
