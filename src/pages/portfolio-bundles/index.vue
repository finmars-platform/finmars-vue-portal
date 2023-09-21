<template>
	<div class="container">
		<!-- <h1 class="title">Ecosystem Default</h1> -->
		<table class="portfolio-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Unique Code</th>
					<th>Notes</th>
					<!-- <th>Default Instrument Pricing Scheme</th>
					<th>Default Currency Pricing Scheme</th> -->
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item, index) in pricingPolicyList" :key="index">
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td>{{ item.notes }}</td>
					<!-- <td>{{ item.default_instrument_pricing_scheme_object.name }}</td> -->
					<!-- <td>{{ item.default_currency_pricing_scheme_object.name }}</td>  -->
					<td>
						<FmBtn type="text" class="g-toggle-filters-btn" @click="editPricingPolicy(item)">Edit </FmBtn>
                        <FmBtn type="text" class="g-toggle-filters-btn" @click="deletePricingPolicy(item)"> Delete </FmBtn>
					</td>
				</tr>
			</tbody>
		</table>
		<FmBtn type="primary" class="g-toggle-filters-btn" @click="createPricingPolicy(item)">
			<!-- @click="defaultSettingsCreate()"
			:disabled="disabledBtn" -->
			Add New
		</FmBtn>
		<ModalPortfolioBundleManager
				title="Portfolio Bundle Manager"
				v-model="isOpenEditPricingPolicy"
				
			></ModalPortfolioBundleManager>
			<!-- :name="activeCustomColumns.name"
				:user_code="activeCustomColumns.user_code"
				@save="renameLayout" -->
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
	const pricingPolicyList = ref([])
	let activePolicyList = ref([])
	let isOpenEditPricingPolicy  = ref(false)
	defaultsGet()
	async function defaultsGet() {
		let edRes = await useApi('portfolioBundles.get')
		// let edRes = await useApi('pricingPolicyList.get')
		
		pricingPolicyList.value = edRes.error ? {} : edRes.results
	}
	console.log('portfolioBundles', pricingPolicyList)
	async function deletePricingPolicy(item) {
		console.log('itemitem', item)
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			deletePricingPolicyItem(item)
		}
	}

	function deletePricingPolicyItem(item) {
		let res = useApi('portfolioBundles.delete', {
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
	function editPricingPolicy(newNamesData) {
		activePolicyList = newNamesData
		// emit('rename', newNamesData)
		isOpenEditPricingPolicy.value = true
	}
	function createPricingPolicy(newNamesData) {
		activePolicyList = newNamesData
		// emit('rename', newNamesData)
		isOpenEditPricingPolicy.value = true
	}
	
	// async function defaultSettingsCreate() {
	// 	let res = await useApi('defaultSettings.put', {
	// 		params: { id: ecosystemDefaults.value.id },
	// 		body: ecosystemDefaults.value,
	// 	})

	// 	if (res.error) {
	// 		// console.error(res.error);
	// 		useNotify({ type: 'error', title: res.error.message || res.error.detail })
	// 		throw new Error(res.error)
	// 	} else {
	// 		useNotify({ type: 'success', title: `data saved on the server` })
	// 	}
	// 	disabledBtn.value = true
	// }
</script>

<style lang="scss" scoped>
	td,
	th {
		width: 25%;
		padding: 0 5px;
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
    .portfolio-table{
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
