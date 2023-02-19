<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<BaseInput type="text"
					v-model="searchParam"
					@keyup.enter="refresh()"
					placeholder="Search"
					class="bi_no_borders"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
				</BaseInput>
			</template>
		</FmTopRefresh>

		<div class="fm_container">
			<BaseTable
				:headers="['Workspace', 'Backups', 'Autobackup', 'Last backup']"
				:items="backupsView"
				colls="repeat(4, 1fr)"
			/>
		</div>
		<!-- <div v-else class="text-h4">No backups found</div> -->
	</div>
</template>

<script setup>

	import dayjs from 'dayjs'

	let searchParam = ref("");
	let process = false
	let backups = ref(null)

	refresh()

	let backupsView = computed(() => {
		if ( !backups.value ) return []
		let items = []
		backups.value.forEach((item) => {

			let result_item = {
				name: {value: item.master_user.name, link: `/profile/backups/${item.master_user.base_api_url}`},
				count: item.count,
				autobackup_status: undefined,
				last_backup: undefined
			}

			if (item.last_backup) {
				result_item['autobackup_status'] = item.last_backup.status;
				result_item['last_backup'] = dayjs(item.last_backup.created_at)
			}

			items.push(result_item)
		})

		return items
	})

	async function refresh() {
		if ( process ) return false
		process = true

		let res = await useApi("masterBackupInfo.get", {
			filters: {
				query: searchParam.value
			}
		});
		backups.value = res.results
		process = false
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
