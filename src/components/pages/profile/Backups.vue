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
				colls="repeat(4, 1fr)"
				:items="backupsView"
				:headers="['Workspace', 'Backups', 'Autobackup', 'Last backup']"
				:cb="openMU"
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
				name: item.master_user.name,
				count: item.count,
				autobackup_status: '',
				last_backup: ''
			}

			if (item.last_backup) {
				result_item['autobackup_status'] = item.last_backup.status;
				result_item['last_backup'] item.last_backup.created_at;
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

	async function openMU(index) {
		useRouter().push('/profile/backups/' + (backups.value[index].master_user.base_api_url))
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
