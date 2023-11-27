<template>
	<div class="container task">
		<div class="task__inner">
			<h1 class="title">
				Tasks
				<div class="refresh"></div>
			</h1>
			<div class="task__header">
				<div class="task__date"></div>
				<!-- <div class="search-input">
					<FmInputText v-model="filterText" label="Search" />
				</div> -->
			</div>
			<div class="task__content">
				<div class="task-stats">
					<div class="task-stats__title">Stats</div>
					<div class="task-stats__link">
						<!-- <a
						:href="getUrlToOldApp(store, apiUrl, '/workers')"
						class="link-primary"
					>
						<span class="side-nav-title">Configure</span>
					</a> -->
					</div>
					<div class="task-stats__item">
						<span class="title"></span>
					</div>
				</div>
				<!-- <BaseTable
					:headers="['Status', 'Date', 'Task', 'User']"
					:items="members"
					colls="50px repeat(4, 1fr)"
					:cb="
						(id) =>
							$router.push(
								`/settings/permissions/members/${stockMembers[id].id}`
							)
					"
					class="clickable_rows"
				>
					<template #actions="{ index }">
						<div class="flex jcc aic height-100">
							<FmMenu attach="body">
								<template #btn>
									<FmIcon icon="more_vert" />
								</template>
								<div class="fm_list">
									<div class="fm_list_item" @click="deleteMember(index)">
										<FmIcon class="m-r-4" icon="delete" />
										Delete
									</div>
								</div>
							</FmMenu>
						</div>
					</template>
				</BaseTable> -->
			</div>
		</div>
		<div class="task__aside"><h2>Click on event to see details</h2></div>
	</div>
</template>

<script setup>
	// import metaContentTypesServiceInst from '@/angular/services/metaContentTypesService'

	// definePageMeta({
	// 	middleware: 'auth',
	// 	bread: [
	// 		{
	// 			text: 'Settings: task',
	// 			to: '/settings/task',
	// 		},
	// 	],
	// })

	// const store = useStore()
	// const config = useRuntimeConfig()
	// const apiUrl = config.public.apiURL

	// const metaContentTypeService = new metaContentTypesServiceInst()

	let isOpenEdittask = ref(false)
	let сreation = ref(false)
	let activeEditList = ref([])

	let filterText = ref('')

	let activeDefaultLayout = ref(false)

	let defaultsList = ref(false)

	// const filterTask = (task) => {
	// 	let inputFilter = filterText.value

	// 	if (!inputFilter) return task

	// 	return task.filter(function (layout) {
	// 		return layout.name.toLowerCase().includes(inputFilter.toLowerCase())
	// 	})
	// }

	// async function defaultsGet() {
	// 	let edRes = await useApi('taskListLight.get')
	// 	defaultsList.value = edRes
	// }
	// defaultsGet()
	// function editEdittask(newNamesData) {
	// 	activeEditList = newNamesData

	// 	сreation = false
	// 	isOpenEdittask.value = true
	// }

	// // const tasktore = usetaskStore()
	// gettask()
	// async function gettask() {
	// 	layoutMapRef.value = [
	// 		{ content_type: 'portfolios.portfolio', task: [], name: 'Portfolio' },
	// 		{ content_type: 'accounts.account', task: [], name: 'Account' },
	// 		{
	// 			content_type: 'instruments.instrument',
	// 			task: [],
	// 			name: 'Instrument',
	// 		},
	// 		{
	// 			content_type: 'counterparties.responsible',
	// 			task: [],
	// 			name: 'Responsible',
	// 		},
	// 		{
	// 			content_type: 'counterparties.counterparty',
	// 			task: [],
	// 			name: 'Counterparty',
	// 		},
	// 		{ content_type: 'currencies.currency', task: [], name: 'Currency' },
	// 		{ content_type: 'strategies.strategy1', task: [], name: 'Strategy 1' },
	// 		{ content_type: 'strategies.strategy2', task: [], name: 'Strategy 2' },
	// 		{ content_type: 'strategies.strategy3', task: [], name: 'Strategy 3' },
	// 		{
	// 			content_type: 'accounts.accounttype',
	// 			task: [],
	// 			name: 'Account Type',
	// 		},
	// 		{
	// 			content_type: 'instruments.instrumenttype',
	// 			task: [],
	// 			name: 'Instrument Type',
	// 		},
	// 		{
	// 			content_type: 'transactions.transactiontype',
	// 			task: [],
	// 			name: 'Transaction Type',
	// 		},
	// 	]
	// 	const res = await tasktore.getListtask()
	// 	res.forEach((layout) => {
	// 		let layoutGroup = layoutMapRef.value.find((layoutGroup) => {
	// 			return layoutGroup.content_type === layout.content_type
	// 		})
	// 		if (layoutGroup) {
	// 			layoutGroup.task.push(layout)
	// 		}
	// 	})
	// }

	// async function putEdittask(newNamesData) {
	// 	await tasktore.updateLayout(activeEditList.id, newNamesData)

	// 	useNotify({ type: 'success', title: `data delete on the server` })

	// 	await gettask()

	// 	isOpenEdittask.value = false
	// }

	// async function confirmDeletetaskItem(item) {
	// 	let confirm = await useConfirm({
	// 		title: 'Confirm action',
	// 		text: `Do you want to delete "${item.name}" layout?`,
	// 	})

	// 	if (confirm) {
	// 		deletetaskItem(item)
	// 	}
	// }
	// async function deletetaskItem(item) {
	// 	await tasktore.deleteLayout(item.id)

	// 	useNotify({ type: 'success', title: `data delete on the server` })
	// 	gettask()
	// }
	// async function putDefaultLayout(item) {
	// 	// activeDefaultLayout.value = true

	// 	if (item.is_default == true) {
	// 		item.is_default = false
	// 	} else {
	// 		item.is_default = true
	// 	}

	// 	let res = await useApi('listLayoutList.put', {
	// 		params: { id: item.id },
	// 		body: item,
	// 	})
	// 	if (res.error) {
	// 		useNotify({
	// 			type: 'error',
	// 			title: res.error.message || res.error.detail,
	// 		})
	// 		throw new Error(res.error)
	// 	}
	// 	gettask()
	// 	// activeDefaultLayout.value = false
	// 	useNotify({ type: 'success', title: `task Edit on the server` })
	// }
</script>

<style lang="scss" scoped>
	.task {
		// .task__btn

		&__btn {
			display: flex;
			margin-bottom: 20px;
			a:first-child {
				margin-right: 20px;
			}
		}
	}
	.task {
		display: flex;
		padding: 30px;
	}
	.task__inner {
		width: 100%;
	}
	.task__aside {
		width: 400px;
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
