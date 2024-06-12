<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<BaseInput
					type="text"
					v-model="searchParam"
					placeholder="Search"
					class="bi_no_borders"
					@keyup.enter="refresh()"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
				</BaseInput>
			</template>
		</FmTopRefresh>

		<div class="fm_container">
			<BaseTable
				colls="50px 1fr 200px 100px 200px 100px 1fr"
				:items="backupsByMU"
				:headers="[
					'',
					'Name',
					'Date',
					'Status',
					'Performed by',
					'Size',
					'Notes',
				]"
			>
				<template #actions="{ index }">
					<div class="flex jcc">
						<FmMenu anchor="bottom left">
							<template #btn>
								<FmIcon icon="more_vert" />
							</template>
							<div class="fm_list">
								<div class="fm_list_item" @click="edit(index)">
									<FmIcon class="m-r-4" icon="edit" /> Edit
								</div>

								<a
									target="download"
									class="fm_list_item mr-10"
									:href="`${config.public.authorizerURL}/master-user-backups/${backups[index].id}/view/`"
								>
									<FmIcon class="m-r-4" icon="cloud_download" /> Download
								</a>

								<div
									v-if="backups[index].owner == store.member.id"
									class="fm_list_item"
									@click="restore(index)"
								>
									<FmIcon class="m-r-4" icon="settings_backup_restore" />
									Restore
								</div>
								<div
									class="fm_list_item"
									@click="
										;(isShowRestore = true), (restoredID = backups[index].id)
									"
								>
									<FmIcon class="m-r-4" icon="add_circle" /> Create new
									workspace
								</div>
								<div class="fm_list_item" @click="deleteBackup(index)">
									<FmIcon class="m-r-4" icon="delete" /> Delete
								</div>
							</div>
						</FmMenu>
					</div>
				</template>
			</BaseTable>
		</div>
		<!-- <div v-else class="text-h4">No backups found</div> -->

		<BaseModal
			title="Edit backup"
			v-model="isOpenEdit"
			:controls="{
				cancel: {
					name: 'cancel',
					cb: () => {},
				},
				action: {
					name: 'Save',
					cb: saveBackup,
				},
			}"
		>
			{{ editable.master_user_base_api_url }}
			<BaseInput label="Name" v-model="editable.name" />
			<BaseInput label="Notes" v-model="editable.notes" />
		</BaseModal>

		<PagesProfileRestoreFromBackup
			v-model="isShowRestore"
			:backupId="restoredID"
			@cancel=";(isShowRestore = false), (restoredID = null)"
		/>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Profile',
				to: '/v/profile',
			},
			{
				text: 'Backups',
				to: '/v/profile?tab=Backups',
			},
			{
				text: 'Backup detail',
				disabled: true,
			},
		],
	})
	const config = useRuntimeConfig()
	const store = useStore()
	const route = useRoute()

	let searchParam = ref('')
	let processing = false

	let backupsByMU = ref([])
	let editable = ref(null)
	let restoredID = ref(null)
	let isOpenEdit = ref(false)
	let isShowRestore = ref(false)
	let isShowNewBackup = ref(false)
	let backups = null

	refresh()

	async function refresh() {
		let res = await useApi('masterBackups.get', {
			filters: {
				space_id: route.params.id,
				query: searchParam.value,
			},
		})
		backups = res.results
		backupsByMU.value = []

		backups.forEach((item) => {
			backupsByMU.value.push({
				name: item.name,
				date: dayjs(item.created_at).format('DD MMM YYYY HH:mm'),
				status: item.status,
				created_by: item.created_by_object.username,
				file_size: Math.round(item.file_size / 1024) + ' KB',
				notes: item.notes,
			})
		})
	}
	function edit(index) {
		editable.value = backups[index]
		isOpenEdit.value = true
	}

	async function saveBackup() {
		let res = await useApi('spaceBackupSave.put', {
			params: { id: editable.value.id },
			body: editable.value,
		})

		refresh()
	}
	async function restore(index) {
		let isConfirm = await useConfirm({
			text: `Are you sure you want to restore ${backups[index].master_user_base_api_url} from
			backup ${backups[index].name}? All data that was created after this backup will be deleted.`,
		})
		if (!isConfirm) return false

		let res = await useApi('masterRollback.put', {
			params: { id: backups[index].master_user },
			body: {
				master_user_backup_id: backups[index].id,
				create_backup_before_rollback: true,
			},
		})

		if (!res.error) {
			useNotify({
				type: 'success',
				title: 'Success',
			})
		} else {
			useNotify({
				type: 'error',
				title: 'No success',
			})
		}
	}
	async function deleteBackup(index) {
		let isConfirm = await useConfirm({
			text: `Are you sure you want to delete ${backups[index].name}?`,
		})
		if (!isConfirm) return false

		let res = await useApi('masterBackups.delete', {
			params: { id: backups[index].id },
		})
		refresh()
	}
</script>

<style lang="scss" scoped>
	.backups {
		display: grid;
		grid-template-columns: repeat(3, auto);
		grid-gap: 30px;
		justify-content: flex-start;
	}
</style>
