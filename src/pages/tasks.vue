<template>
	<div class="container task">
		<div class="task__inner">
			<h1 class="title">
				Tasks
				<div class="refresh"></div>
			</h1>
			<div class="task__header">
				<div class="task__date"></div>
				<div class="search-input">
					<FmInputText v-model="filterText" label="Search" />
				</div>
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
				<BaseTable
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
				</BaseTable>
			</div>
		</div>
		<div class="task__aside">
			<!-- <div v-if="activeTask">
				<div v-if="!activeTaskProcessing">
					<a data-ng-click="refreshTask($event)" class="refresh-task-button"
						><span class="material-icons">refresh</span>
						<md-tooltip md-direction="bottom">Refresh</md-tooltip>
					</a>

					<a
						data-ng-click="cancelTask($event)"
						v-if="
							activeTask.status == 'I' ||
							activeTask.status == 'P' ||
							activeTask.status == 'progress' ||
							activeTask.status == 'W'
						"
						class="cancel-task-button"
						><span class="material-icons">cancel</span>
						<md-tooltip md-direction="bottom">Cancel</md-tooltip>
					</a>

					<h1>
						{{ activeTask.verbose_name }}
					</h1>

					<div class="task-detail">
						<span class="task-detail__title">Id</span>:
						{{ activeTask.id }}
					</div>
					<div class="task-detail">
						<span class="task-detail__title">Type</span>:
						{{ activeTask.type }}
					</div>

					<div class="task-detail">
						<span class="task-detail__title">Start Date</span>:
						{{activeTask.created | date:'yyyy-MM-dd' : 'UTC'}}
					</div>
					<div class="task-detail">
						<span class="task-detail__title">Start Time</span>:
						{{activeTask.created | date:'HH:mm:ss' : 'UTC'}}
						<md-tooltip md-direction="bottom">{{
							activeTask.created
						}}</md-tooltip>
					</div>

					<div class="task-detail" v-if="activeTask.finished_at">
						<span class="task-detail__title">Finished Time</span>:
						{{activeTask.finished_at | date:'HH:mm:ss' : 'UTC'}}
						<md-tooltip md-direction="bottom">{{
							activeTask.finished_at
						}}</md-tooltip>
					</div>

					<div class="task-detail" v-if="activeTask.execution_time_pretty">
						<span class="task-detail__title">Execution Time</span>:

						{{ activeTask.execution_time_pretty }}
					</div>

					<div class="task-detail">
						<span class="task-detail__title">Status</span>:
						<span
							v-if="activeTask.status == 'D'"
							class="{{activeTask.status == 'D' ? 'calendar-detail-status-green' : '' }}"
						>
							Success
						</span>
						<span
							v-if="activeTask.status == 'E'"
							class="{{activeTask.status == 'E' ? 'calendar-detail-status-red' : '' }}"
						>
							Error
						</span>
						<span v-if="activeTask.status != 'D' && activeTask.status != 'D'">
							{{ activeTask.status }}
						</span>
					</div>

					<div class="task-detail" v-if="activeTask.member_object">
						<span class="task-detail__title">Member</span>:
						{{ activeTask.member_object.username }}
					</div>

					<div class="task-detail">
						<span class="task-detail__title">Worker</span>:
						{{ activeTask.worker_name }}
					</div>

					<hr />

					<div class="task-detail" v-if="activeTask.notes">
						<span class="task-detail__title">Notes</span>:

						<div>
							{{ activeTask.notes }}
						</div>
					</div>

					<hr />

					<div class="task-detail" v-if="activeTask.verbose_result">
						<span class="task-detail__title">Verbose result</span>:

						<div>
							{{ activeTask.verbose_result }}
						</div>

						<hr />
					</div>

					<div class="task-detail" v-if="activeTaskPayload.notes">
						<span class="task-detail__title">Notes</span>:
						<div>
							{{ activeTask.notes }}
						</div>
					</div>

					<div class="task-detail" v-if="activeTask.error_message">
						<span class="task-detail__title">Error Message</span>:
						<div class="task-detail-error-message">
							{{ activeTask.error_message }}
						</div>

						<hr />
					</div>

					<div class="task-detail" v-if="activeTask.options_object">
						<span class="task-detail__title">Options</span>

						<div>
							<json-editor
								data-source="activeTask.options_object"
								data-index="1"
							></json-editor>
						</div>
						<hr />
					</div>

					<div
						class="task-detail"
						v-if="activeTask.status == 'P' && activeTask.progress_object"
					>
						<div class="task-detail__title m-b-8">Progress</div>

						<div>
							<div
								layout="row"
								layout-sm="column"
								layout-align="space-around"
								class="loader-spinner"
							>
								<md-progress-linear
									md-mode="determinate"
									value="{{activeTask.progress_object.percent}}"
								></md-progress-linear>
								<md-tooltip class="tooltip_2" md-direction="bottom">
									{{ activeTask.progress_object.percent }}%
								</md-tooltip>
							</div>

							<div class="task-card-progress-text">
								{{ activeTask.description }}
							</div>
						</div>

						<hr />
					</div>

					<div class="task-detail" v-if="activeTask.result_object">
						<span class="task-detail__title">Results</span>

						<div>
							<json-editor
								data-source="activeTask.result_object"
								data-index="2"
							></json-editor>
						</div>

						<hr />
					</div>

					<div class="task-detail" v-if="activeTask.attachments.length">
						<span class="task-detail__title">Attachments</span>

						<div data-ng-repeat="item inactiveTask.attachments">
							<span
								class="download-file-button"
								data-ng-click="downloadFile($event, item)"
								>{{ item.file_report_object.name }}</span
							>
						</div>
					</div>

					<div>
						<h3>Actions:</h3>

						<md-button
							class="md-raised md-warn"
							v-if="activeTask.type == 'transaction_import'"
							data-ng-click="abortTransactionImport($event,activeTask)"
						>
							Abort Transactions
						</md-button>
					</div>
				</div>

				<div v-if="activeTaskProcessing">
					<div layout="row" layout-sm="column" layout-align="space-around">
						<progress-circular diameter="50"></progress-circular>
					</div>
				</div>
			</div> -->
			<h1>Click on event to see details</h1>
		</div>
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
	let activeTask = ref([])

	let tableList = ref([])

	let tableFilterItems= null

	// async function refresh() {
	// 	let res = await useApi('taskListLight.get', {
		
	// 	})
	// 	tableList = res.results
	// 	tableFilterItems.value = []

	// 	tableList.forEach((item) => {
	// 		tableFilterItems.value.push({
	// 			name: item.name,
	// 			date: dayjs(item.created_at).format('DD MMM YYYY HH:mm'),
	// 			status: item.status,
	// 			created_by: item.created_by_object.username,
	// 			file_size: Math.round(item.file_size / 1024) + ' KB',
	// 			notes: item.notes,
	// 		})
	// 	})
	// }
	// const filterTask = (task) => {
	// 	let inputFilter = filterText.value

	// 	if (!inputFilter) return task

	// 	return task.filter(function (layout) {
	// 		return task.name.toLowerCase().includes(inputFilter.toLowerCase())
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
		padding: 16px 16px 100px;
		width: 450px;
		position: fixed;
		right: 0;
		top: 50px;
		box-sizing: border-box;
		background: #fff;
		height: 100%;
		z-index: 1;
		overflow: auto;
		border-left: 1px solid #ddd;
		font-size: 14px;
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
