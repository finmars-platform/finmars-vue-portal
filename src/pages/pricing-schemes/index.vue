<template>
	<div class="container">
		<FmTabs v-model="activeTab" :tabs="tabsList" />
		<div v-show="activeTab === 'Instruments Pricing Schemes'" class="p-t-16">
			<table class="portfolio-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>User Code</th>
						<th>Type</th>
						<th>Notes</th>
						<th>Clarification for Users:</th>
						<th>Error Handler</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in instrumentSchemeList" :key="index">
						<td>{{ item.name }}</td>
						<td>{{ item.user_code }}</td>
						<td>{{ item.type_object.name }}</td>
						<td>{{ item.notes }}</td>
						<td>{{ item.notes_for_users }}</td>
						<td>{{ getErrorHandler(item) }}</td>
						<td>
							<FmBtn
								type="text"
								class="g-toggle-filters-btn"
								@click="afterEditItems(item)"
								>Edit
							</FmBtn>
							<FmBtn
								type="text"
								class="g-toggle-filters-btn"
								@click="deleteItem(item)"
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
				@click="afterCreateItems(item)"
			>
				Add New
			</FmBtn>
		</div>
		<div v-show="activeTab === 'Currencies Pricing Schemes'" class="p-t-16">
			<table class="portfolio-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>User Code</th>
						<th>Type</th>
						<th>Notes</th>
						<th>Clarification for Users:</th>
						<th>Error Handler</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in currencySchemeList" :key="index">
						<td>{{ item.name }}</td>
						<td>{{ item.user_code }}</td>
						<td>{{ item.type_object.name }}</td>
						<td>{{ item.notes }}</td>
						<td>{{ item.notes_for_users }}</td>
						<td>{{ getErrorHandler(item) }}</td>
						<td>
							<FmBtn
								type="text"
								class="g-toggle-filters-btn"
								@click="afterEditItems(item)"
								>Edit
							</FmBtn>
							<FmBtn
								type="text"
								class="g-toggle-filters-btn"
								@click="deleteItem(item)"
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
				@click="afterCreateItems(item)"
			>
				Add New
			</FmBtn>
		</div>
		<div v-if="isOpenEditModal">
			<PricingSchemesManager
				title="Portfolio Bundle Manager"
				v-model="isOpenEditModal"
				:name="activeList.name"
				:user_code="activeList.user_code"
				:notes="activeList.notes"
				:typeModal="typeModal"
				:registers="activeList.registers"
				:registersItems="portfolioRegister"
				:instrument = 'instrument'
				@save="getCreateItem"
				@create="getCreateItem"
			></PricingSchemesManager>
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
	const instrumentSchemeList = ref([])
	const currencySchemeList = ref([])
	let activeList = ref([])
	let isOpenEditModal = ref(false)
	let typeModal = ref()
	let portfolioRegister = ref()
	const tabsList = ['Instruments Pricing Schemes', 'Currencies Pricing Schemes']
	let activeTab = ref('Instruments Pricing Schemes')

	defaultsGet()
	async function defaultsGet() {
		let edResInstrument = await useApi('instrumentSchemeList.get')
		let edResCurrency = await useApi('currencySchemeList.get')

		instrumentSchemeList.value = edResInstrument.error
			? []
			: edResInstrument.results
		currencySchemeList.value = edResCurrency.error ? [] : edResCurrency.results
		console.log('instrumentSchemeList', instrumentSchemeList)
		console.log('currencySchemeList', currencySchemeList)
	}

	let getErrorHandler = function (item) {
		if (item.error_handler === 1) {
			return 'Add to Error Table and notify in the End'
		}

		if (item.error_handler === 2) {
			return 'Add to Error Table, no notification'
		}

		if (item.error_handler === 3) {
			return 'Add to Error Table, notify directly'
		}

		if (item.error_handler === 3) {
			return 'Notify Directly and request Prices'
		}
	}
	async function deleteItem(item) {
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			confirmDeleteItem(item)
		}
	}

	async function confirmDeleteItem(item) {
		let res = await useApi('pricingPolicyList.delete', {
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
		defaultsGet()
	}

	function afterEditItems(newNamesData) {
		// activePricingPolicyList = " "
		activePricingPolicyList = newNamesData
		сreation = false
		isOpenEditPortfolioBundle.value = true
	}
	function afterCreateItems(newNamesData) {
		activePricingPolicyList = ' '
		сreation = true

		isOpenEditPortfolioBundle.value = true
	}
	async function getEditItem(newNamesData) {
		let res = await useApi('pricingPolicyList.put', {
			params: { id: activePricingPolicyList.id },
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
		defaultsGet()

		isOpenEditPortfolioBundle.value = false
	}

	async function getCreateItem(newNamesData) {
		activePricingPolicyList = {}
		let res = await useApi('pricingPolicyList.post', {
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
		defaultsGet()
		isOpenEditPortfolioBundle.value = false
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
