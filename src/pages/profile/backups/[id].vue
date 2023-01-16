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
				colls="1fr 200px 100px 200px 100px 1fr 50px"
				:items="backupsByMU"
				:headers="['Name', 'Date', 'Status', 'Performed by', 'Size', 'Notes']"
			>
				<template #actions="{index}">
					<div class="flex jcc">
						<FmMenu anchor="bottom right">
							<template #btn>
								<FmIcon icon="more_vert" />
							</template>
							<div class="fm_list">
								<div class="fm_list_item"
									@click="edit(index)"
								>
									<FmIcon class="m-r-4" icon="edit" /> Edit
								</div>

								<a
									target="download"
									class="fm_list_item mr-10"
									:href="`${config.public.authorizerURL}/master-user-backups/${backups[index].id}/view/`"
								>
									<FmIcon icon="cloud_download" /> Download
								</a>

								<div class="fm_list_item"><FmIcon class="m-r-4" icon="undo" /> Restore</div>
								<div class="fm_list_item"><FmIcon class="m-r-4" icon="add_circle" /> Create new workspace</div>
								<div class="fm_list_item"
									@click="deleteBackup()"
								>
									<FmIcon class="m-r-4" icon="delete" /> Delete
								</div>
							</div>
						</FmMenu>
					</div>
				</template>
			</BaseTable>
		</div>
		<!-- <div v-else class="text-h4">No backups found</div> -->

		<BaseModal title="Editable" v-model="isOpenEdit">
			<BaseInput label="Name" v-model="editable.name" />
			<BaseInput label="Notice" v-model="editable.notice" />
		</BaseModal>
	</div>
</template>

<script setup>

	import dayjs from 'dayjs'

	definePageMeta({
		middleware: 'auth',
		isHideSidebar: true,
		bread: [
			{
				text: "Profile",
				to: "/profile",
			},
			{
				text: "Backups",
				to: "/profile",
			},
			{
				text: "Backups",
				to: "/profile",
				disabled: true,
			},
		],
	})
	const config = useRuntimeConfig()

	let muNameTerms = ref("");
	let processing = false

	let backupsByMU = ref([])
	let editable = ref(null)
	let isOpenEdit = ref(false)

	let res = await useApi("masterBackups.get", {
	});
	let backups = res.results

	backups.forEach((item) => {
		backupsByMU.value.push({
			name: item.name,
			date: dayjs(item.created_at).format('DD MMM YYYY HH:mm'),
			status: 'hz',
			created_by: item.created_by,
			file_size: Math.round(item.file_size / 1024) + ' KB',
			notes: item.notes,
		})
	})

	function edit( index ) {
		editable.value = backups[index]
		isOpenEdit.value = true
	}
	function restore( index ) {
		editable.value = backups[index]
	}
	async function deleteBackup() {
		let res = await useApi('masterBackups.delete', {params: {id: backupsByMU.value.id }})
		console.log('res:', res)
		emit('refresh')
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
