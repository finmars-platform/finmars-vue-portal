<template>
	<BaseModal :title="title">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmBtn type="text" @click="addCustomField(item)">Add New</FmBtn>
			</div>
			<div class="content">
				<div
					class="card"
					v-for="(item, index) in customFieldsList"
					:key="index"
				>
					<div class="card__inner">
						<h3 class="card__title">{{ item?.name }}</h3>
						<div class="card__btn">
							<div class="card__edit m-r-10">
								<FmIcon
									@click="editCustomField(item)"
									class="m-l-4"
									icon="edit"
								/>
							</div>
							<div class="card__delete">
								<FmIcon
									@click="deleteColumn(item)"
									class="m-l-4"
									icon="delete"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div v-if="isOpeneditCustomField">
				<ModalEditCustomField
					title="Edit Custom Column"
					v-model="isOpeneditCustomField"
					:name="activeCustomColumn.name"
					:user_code="activeCustomColumn.user_code"
					:notes="activeCustomColumn.notes"
					:value_type="activeCustomColumn.value_type"
					:expr="activeCustomColumn.expr"
					:editing="editing"
					@save="updateCustomField"
					@create="postCustomColumn"
				></ModalEditCustomField>
			</div>
		</div>

		<template #controls="{ cancel }">
			<slot name="controls" :cancel="cancel">
				<div>
					<FmBtn type="basic" @click="cancel">CLOSE</FmBtn>
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
	
	const isOpeneditCustomField = ref(false)
	const evAttrsStore = useEvAttributesStore()
	let editing = ref('')
	let vm = reactive({ content_type: props.content_type })



	let activeCustomColumn = ref([
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

	let customFieldsList = computed(() => {
		return evAttrsStore.customFields[props.content_type]
	})

	vm.readyStatus = { customFields: false, attributes: false }

	async function deleteColumn(item) {
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			deleteCustomColumn(item)
		}
	}

	async function deleteCustomColumn(item) {
		let res = await useApi('balanceReportCustomFieldList.delete', {
			params: { id: item.id },
			body: item,
		})

		if (res.error) {
			useNotify({
				type: 'error',
				title: res.error.message || res.error.detail,
			})

			throw new Error(res.error)
		}
		await evAttrsStore.fetchCustomFields(props.content_type)
		useNotify({ type: 'success', title: `Column delete on the server` })
		
		isOpeneditCustomField.value = false
	
	}

	function editCustomField(newNamesData) {
		activeCustomColumn = newNamesData
		editing = 'edit'
		isOpeneditCustomField.value = true
	}
	function addCustomField(newNamesData) {
		activeCustomColumn = []
		editing = 'create'
		isOpeneditCustomField.value = true
	}
	async function updateCustomField(newNamesData) {

		let res = await useApi('balanceReportCustomFieldList.put', {
			params: { id: activeCustomColumn.id },
			body: newNamesData,
		})

		if (res.error) {
			useNotify({
				type: 'error',
				title: res.error.message || res.error.detail,
			})

			throw new Error(res.error)
		}

		useNotify({ type: 'success', title: `Column Edit on the server` })

		await evAttrsStore.fetchCustomFields(props.content_type)
		isOpeneditCustomField.value = false
	}

	async function postCustomColumn(newNamesData) {
		let res = await useApi('balanceReportCustomFieldList.post', {
			body: newNamesData,
		})
		if (res.error) {
			useNotify({
				type: 'error',
				title: res.error.message || res.error.detail,
			})
			throw new Error(res.error)
		} 
		useNotify({ type: 'success', title: `Column create on the server` })
		await evAttrsStore.fetchCustomFields(props.content_type)
		isOpeneditCustomField.value = false
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
