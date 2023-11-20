<template>
	<div class="container layouts">
		<h1 class="title">Layouts</h1>
		<div class="layouts__header">
			<div class="layouts__btn">
				<a
					:href="getUrlToOldApp(store, apiUrl, '/dashboard')"
					class="link-primary"
				>
					<span class="side-nav-title">Dashboard Layout Manager</span>
				</a>
				<a
					:href="getUrlToOldApp(store, apiUrl, '/context-menu-layouts')"
					class="link-primary"
				>
					<span class="side-nav-title">Context Menu Layout Manager</span>
				</a>
			</div>
			<div class="search-input">
				<FmInputText v-model="filterText" label="(o) Search by name" />
			</div>
		</div>
		<div class="layouts__content">
			<div v-for="group in layoutMapRef" :key="group.content_type">
				<FmExpansionPanel :title="group.name">
					<div v-if="group.layouts.length > 0">
						<div
							class="layouts-card"
							v-for="layout in filterLayouts(group.layouts)"
							:key="layout.user_code"
						>
							<div class="layouts-card__inner">
								<div class="layouts-card__name">{{ layout?.name }}</div>
								<div class="layouts-card__setting">
									<div class="layouts-card__item layouts-card__rename">
										<FmBtn
											type="text"
											class="menu_item"
											@click="editEditLayouts(layout)"
											v-model="renameIsOpened"
										>
											<FmIcon btn icon="create" v-fm-tooltip="'Rename'" />
										</FmBtn>
									</div>
									<div
										class="layouts-card__item layouts-card__default"
										:class="{ active: layout?.is_default }"
									>
										<FmBtn type="text" class="menu_item">
											<div v-if="layout?.is_default">
												<FmIcon
													btn
													icon="star"
													@click="putDefaultLayout(layout)"
													v-fm-tooltip="'Set as default'"
												/>
											</div>
											<div v-else>
												<FmIcon
													btn
													icon="star_border"
													@click="putDefaultLayout(layout)"
													v-fm-tooltip="'Set as default'"
												/>
											</div>
										</FmBtn>
									</div>
									<div class="layouts-card__item layouts-card__delete">
										<FmBtn
											type="text"
											class="menu_item"
											@click="confirmDeleteLayoutsItem(layout)"
										>
											<FmIcon btn icon="delete" v-fm-tooltip="'Delete'" />
										</FmBtn>
									</div>

									<div class="layouts-card__item layouts-card__layout">
										<a
											:href="getUrlToOldApp(store, apiUrl, '/dashboard')"
											class="link"
										>
											<span class="side-nav-title">Open Layout</span>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div v-else class="no-item">This entity has no layouts.</div>
				</FmExpansionPanel>
			</div>

			<div v-if="isOpenEditLayouts">
				<ModalNameUserCode
					title="Layouts"
					:name="activeEditList.name"
					:id="activeEditList?.id"
					:user_code="activeEditList.user_code"
					:configuration_code="activeEditList.configuration_code"
					:content_type="activeEditList.content_type"
					:data="activeEditList.data"
					:is_active="activeEditList.is_active"
					:is_default="activeEditList.is_default"
					:is_systemic="activeEditList.is_systemic"
					v-model="isOpenEditLayouts"
					:сreation="сreation"
					@save="putEditLayouts"
					@create="getCreatePortfolioBundle"
				></ModalNameUserCode>
			</div>
		</div>
	</div>
</template>

<script setup>
	import metaContentTypesServiceInst from '@/angular/services/metaContentTypesService'

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Settings: Layouts',
				to: '/settings/layouts',
			},
		],
	})

	const store = useStore()
	const config = useRuntimeConfig()
	const apiUrl = config.public.apiURL

	const metaContentTypeService = new metaContentTypesServiceInst()

	let isOpenEditLayouts = ref(false)
	let сreation = ref(false)
	let activeEditList = ref([])

	let filterText = ref('')

	let activeDefaultLayout = ref(false)

	let layoutMapRef = ref([
		{ content_type: 'portfolios.portfolio', layouts: [], name: 'Portfolio' },
		{ content_type: 'accounts.account', layouts: [], name: 'Account' },
		{ content_type: 'instruments.instrument', layouts: [], name: 'Instrument' },
		{
			content_type: 'counterparties.responsible',
			layouts: [],
			name: 'Responsible',
		},
		{
			content_type: 'counterparties.counterparty',
			layouts: [],
			name: 'Counterparty',
		},
		{ content_type: 'currencies.currency', layouts: [], name: 'Currency' },
		{ content_type: 'strategies.strategy1', layouts: [], name: 'Strategy 1' },
		{ content_type: 'strategies.strategy2', layouts: [], name: 'Strategy 2' },
		{ content_type: 'strategies.strategy3', layouts: [], name: 'Strategy 3' },
		{ content_type: 'accounts.accounttype', layouts: [], name: 'Account Type' },
		{
			content_type: 'instruments.instrumenttype',
			layouts: [],
			name: 'Instrument Type',
		},
		{
			content_type: 'transactions.transactiontype',
			layouts: [],
			name: 'Transaction Type',
		},
	])

	const filterLayouts = (layouts) => {
		let inputFilter = filterText.value

		if (!inputFilter) return layouts

		return layouts.filter(function (layout) {
			return layout.name.toLowerCase().includes(inputFilter.toLowerCase())
		})
	}

	function editEditLayouts(newNamesData) {
		activeEditList = newNamesData

		сreation = false
		isOpenEditLayouts.value = true
	}

	const layoutStore = useLayoutsStore()
	getLayouts()
	async function getLayouts() {
		layoutMapRef.value = [
			{ content_type: 'portfolios.portfolio', layouts: [], name: 'Portfolio' },
			{ content_type: 'accounts.account', layouts: [], name: 'Account' },
			{
				content_type: 'instruments.instrument',
				layouts: [],
				name: 'Instrument',
			},
			{
				content_type: 'counterparties.responsible',
				layouts: [],
				name: 'Responsible',
			},
			{
				content_type: 'counterparties.counterparty',
				layouts: [],
				name: 'Counterparty',
			},
			{ content_type: 'currencies.currency', layouts: [], name: 'Currency' },
			{ content_type: 'strategies.strategy1', layouts: [], name: 'Strategy 1' },
			{ content_type: 'strategies.strategy2', layouts: [], name: 'Strategy 2' },
			{ content_type: 'strategies.strategy3', layouts: [], name: 'Strategy 3' },
			{
				content_type: 'accounts.accounttype',
				layouts: [],
				name: 'Account Type',
			},
			{
				content_type: 'instruments.instrumenttype',
				layouts: [],
				name: 'Instrument Type',
			},
			{
				content_type: 'transactions.transactiontype',
				layouts: [],
				name: 'Transaction Type',
			},
		]
		const res = await layoutStore.getListLayouts()
		res.forEach((layout) => {
			let layoutGroup = layoutMapRef.value.find((layoutGroup) => {
				return layoutGroup.content_type === layout.content_type
			})
			if (layoutGroup) {
				layoutGroup.layouts.push(layout)
			
			}
		})
	}

	async function putEditLayouts(newNamesData) {
		await layoutStore.updateLayout(activeEditList.id, newNamesData)

		useNotify({ type: 'success', title: `data delete on the server` })

		await getLayouts()

		isOpenEditLayouts.value = false
	}

	async function confirmDeleteLayoutsItem(item) {
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete "${item.name}" layout?`,
		})

		if (confirm) {
			deleteLayoutsItem(item)
		}
	}
	async function deleteLayoutsItem(item) {
		await layoutStore.deleteLayout(item.id)

		useNotify({ type: 'success', title: `data delete on the server` })
		getLayouts()
	}
	async function putDefaultLayout(item) {
		// activeDefaultLayout.value = true

		if (item.is_default == true) {
			item.is_default = false
		} else {
			item.is_default = true
		}

		let res = await useApi('listLayoutList.put', {
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
		getLayouts()
		// activeDefaultLayout.value = false
		useNotify({ type: 'success', title: `Layouts Edit on the server` })
	}
</script>

<style lang="scss" scoped>
	.layouts {
		// .layouts__btn

		&__btn {
			display: flex;
			margin-bottom: 20px;
			a:first-child {
				margin-right: 20px;
			}
		}
	}

	.layouts-card {
		// .layouts-card__inner

		&__inner {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15px;
		}

		// .layouts-card__setting

		&__setting {
			display: flex;
		}
	}
	.link-primary {
		max-width: 290px;
		background: #f05a22;
		color: #fff;

		height: 36px;
		line-height: 36px;
		padding: 0 16px;
		min-width: 64px;
		border-radius: 4px;
		text-transform: uppercase;
		font-weight: 500;
		font-size: 14px;
		letter-spacing: 0.4px;
		transition: 0.3s;
		-webkit-user-select: none;
		-moz-user-select: none;
		user-select: none;
		transform: 0.5s;
		&:hover,
		&:active,
		&:focus {
			background: #e2521c;
			transform: 0.5s;
		}
	}

	.link {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: 0.5s;
		border-radius: 5px;
		padding: 0 10px;
		text-transform: uppercase;
		&:hover {
			background-color: $optionHoverColor;
			transition: 0.5s;
		}
		&:active {
			background-color: $optionHoverColor;
			transition: 0.5s;
		}
		&:focus {
			background-color: $optionHoverColor;
			transition: 0.5s;
		}
	}

	.wrapp-select {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr;
		gap: 10px 5px;
	}
	.container {
		padding: 30px;
	}
	.title {
		margin-bottom: 24px;
		font-weight: 700;
	}
	.no-item {
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 32px;
		margin: 20px 0;
		align-items: center;
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
