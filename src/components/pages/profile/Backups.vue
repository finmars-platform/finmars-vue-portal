<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<BaseInput type="text"
					v-model="muNameTerms"
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
				v-if="!activeBackupId"
				colls="repeat(4, 1fr)"
				:items="backupsMetas"
				:headers="['Workspace', 'Backups', 'Autobackup', 'Last backup']"
				:cb="openMU"
			/>
			<BaseTable
				v-else
				colls="1fr 200px 100px 200px 100px 1fr"
				:items="backupsByMU"
				:headers="['Name', 'Date', 'Status', 'Performed by', 'Size', 'Notes']"
			/>
		</div>

		<!-- <div v-else class="text-h4">No backups found</div> -->

	</div>
</template>

<script setup>

	import dayjs from 'dayjs'

	let muNameTerms = ref("");
	let processing = false

	let backupsMetas = [
		{name: 'New Marscap Production', count: 11, autobackup_status: 'Success', last_backup: '07 Apr 2022 19:23'},
		{name: 'New Marscap 2', count: 2, autobackup_status: 'Failed', last_backup: '07 Apr 2022 19:23'},
		{name: 'New Marscap Produc 3', count: 2, autobackup_status: 'Disabled', last_backup: '07 Apr 2022 19:23'},
	]
	let backupsByMU = ref([])
	let activeBackupId = ref(null)

	async function openMU(index) {
		useRouter().push('/profile/backups/' + (backupsMetas[index].id || 18))
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
