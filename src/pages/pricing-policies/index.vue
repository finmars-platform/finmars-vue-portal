<template>
	<div class="container">
		<table class="portfolio-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Unique Code</th>
					<th>Notes</th>
					<th>Default Instrument Pricing Scheme</th>
					<th>Default Currency Pricing Scheme</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item, index) in pricingPolicyList" :key="index">
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td>{{ item.notes }}</td>
					<td>{{ item.default_instrument_pricing_scheme_object?.name }}</td>
					<td>{{ item.default_currency_pricing_scheme_object?.name }}</td>
					<td>
						<FmBtn
							type="text"
							class="g-toggle-filters-btn"
							@click="editPortfolioBundle(item)"
							>Edit
						</FmBtn>
						<FmBtn
							type="text"
							class="g-toggle-filters-btn"
							@click="deletePortfolioBundle(item)"
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
			@click="createPortfolioBundle(item)"
		>
			Add New
		</FmBtn>
		<div v-if="isOpenEditPortfolioBundle">
			<ModalPricingPolicies
				title="Edit Pricing Policy"
				v-model="isOpenEditPortfolioBundle"
				:name="activePricingPolicyList.name"
				:user_code="activePricingPolicyList.user_code"
				:notes="activePricingPolicyList.notes"
				:сreation="сreation"
				:configuration_code="activePricingPolicyList.configuration_code"
				:default_currency_pricing_scheme="
					activePricingPolicyList.default_currency_pricing_scheme
				"
				:default_currency_pricing_scheme_object="
					activePricingPolicyList.default_currency_pricing_scheme_object
				"
				:default_instrument_pricing_scheme="
					activePricingPolicyList.default_instrument_pricing_scheme
				"
				:default_instrument_pricing_scheme_object="
					activePricingPolicyList.default_instrument_pricing_scheme_object
				"
				:meta="activePricingPolicyList.meta"
				:expr="activePricingPolicyList.expr"
				:publicName="activePricingPolicyList.public_name"
				:shortName="activePricingPolicyList.short_name"
				@save="putEditPortfolioBundle"
				@create="getCreatePortfolioBundle"
			></ModalPricingPolicies>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Pricing policies',
				to: '/pricing-policies',
			},
		],
	})
	const pricingPolicyList = ref([])
	let activePricingPolicyList = ref([])

	let isOpenEditPortfolioBundle = ref(false)
	let сreation = ref(false)
	let portfolioRegister = ref()
	defaultsGet()
	async function defaultsGet() {
		let edRes = await useApi('pricingPolicyList.get')

		pricingPolicyList.value = edRes.error ? [] : edRes.results
	}

	async function deletePortfolioBundle(item) {
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			deletePortfolioBundleItem(item)
		}
	}

	async function deletePortfolioBundleItem(item) {
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

	function editPortfolioBundle(newNamesData) {
		// activePricingPolicyList = " "
		activePricingPolicyList = newNamesData
		сreation = false
		isOpenEditPortfolioBundle.value = true
	}
	function createPortfolioBundle(newNamesData) {
		activePricingPolicyList = ' '
		сreation = true

		isOpenEditPortfolioBundle.value = true
	}
	async function putEditPortfolioBundle(newNamesData) {
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

	async function getCreatePortfolioBundle(newNamesData) {
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
		min-width: 120px;
		width: auto;
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
