<template>
	<div class="container">
		<table class="portfolio-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Unique Code</th>

					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item, index) in transactionTypeList" :key="index">
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td>{{ item.notes }}</td>

					<td>
						<FmBtn
							type="text"
							class="g-toggle-filters-btn"
							@click="editTransactionType(item)"
							>Edit
						</FmBtn>
						<FmBtn
							type="text"
							class="g-toggle-filters-btn"
							@click="deleteTransaction(item)"
						>
							Delete
						</FmBtn>
					</td>
				</tr>
			</tbody>
		</table>
		<FmBtn
			type="primary"
			class="g-toggle-filters-btn"
			@click="createTransactionType(item)"
		>
			Add New
		</FmBtn>
		<div v-if="isOpenEditTransactionType">
			<ModalTransactionTypeGroup
				title="Transaction Type Group"
				v-model="isOpenEditTransactionType"
				:name="activeTransactionTypeList.name"
				:user_code="activeTransactionTypeList.user_code"
				:ShortName="activeTransactionTypeList.short_name"
				:configCode="activeTransactionTypeList.configuration_code"
				:сreation="сreation"
				:modelValue="true"
				@save="putEditTransactionType"
				@create="getCreateTransactionType"

			></ModalTransactionTypeGroup>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Default settings',
				to: '/settings/default-settings',
			},
		],
	})
	const transactionTypeList = ref([])
	let activeTransactionTypeList = ref([])

	let isOpenEditTransactionType = ref(false)
	let сreation = ref(false)

	defaultsGet()
	async function defaultsGet() {
		let edRes = await useApi('transactionTypeGroupList.get')

		transactionTypeList.value = edRes.error ? {} : edRes.results
	}
	async function deleteTransaction(item) {
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			deleteTransactionType(item)
		}
	}

	async function deleteTransactionType(item) {
		let res =  await useApi('transactionTypeGroup.delete', {
			params: { id: item.id },
			body: item,
		})
		if (res._$error) {
			throw new Error(res._$error)
		} else if (res.status === 'conflict') {
			useNotify({
				type: 'error',
				title: 'You can not delete attributed that already in use',
			})
			throw new Error(res._$error)
		}
		defaultsGet()
		useNotify({ type: 'success', title: `data delete on the server` })
	}

	function editTransactionType(newNamesData) {
		activeTransactionTypeList = newNamesData
		сreation = false
		isOpenEditTransactionType.value = true
	}
	function createTransactionType(newNamesData) {
		activeTransactionTypeList = ' '
		сreation = true

		isOpenEditTransactionType.value = true
	}
	async function putEditTransactionType(newNamesData) {
		let res = await useApi('transactionTypeGroup.put', {
			params: { id: activeTransactionTypeList.id },
			body: newNamesData,
		})
		if (res._$error) {
			useNotify({
				type: 'error',
				title: res._$error.message || res._$error.detail,
			})
			throw new Error(res._$error)
		} else if (res.status === 'conflict') {
			useNotify({
				type: 'error',
				title: 'You can not Edit CustomColumns that already in use',
			})
			throw new Error(res._$error)
		}
		useNotify({ type: 'success', title: `data Edit on the server` })
		defaultsGet()
		isOpenEditTransactionType.value = false
	}

	async function getCreateTransactionType(newNamesData) {
		activeTransactionTypeList = {}
		let res = await useApi('transactionTypeGroup.post', {
			body: newNamesData,
		})
		if (res._$error) {
			throw new Error(res._$error)
		} else if (res.status === 'conflict') {
			useNotify({
				type: 'error',
				title: 'You can not Edit CustomColumns that already in use',
			})
			throw new Error(res._$error)
		}
		useNotify({ type: 'success', title: `data Edit on the server` })
		defaultsGet()
		isOpenEditTransactionType.value = false
	}
</script>

<style lang="scss" scoped>
	td,
	th {
		width: 25%;
		padding: 5px 5px;
		display: table-cell;
		text-align: left;
		vertical-align: middle;
		border-radius: 2px;
	}
	.container {
		padding: 30px;
	}
	.title {
		margin-bottom: 24px;
		font-weight: 700;
	}
	.portfolio-table {
		width: 100%;
		margin-bottom: 40px;
	}
	@media (max-width: 1200px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
	@media (max-width: 767px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
</style>
