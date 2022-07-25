<template>
	<v-card width="360">
		<v-card-title>{{ backup.name }}</v-card-title>
		<v-card-subtitle>File size: {{ backup.file_size }} MB</v-card-subtitle>

		<v-spacer></v-spacer>
		<v-card-actions class="justify-space-between d-flex pa-4 py-2">

<!--			<v-btn v-if="!showActions" icon="mdi-lock" color="primary" @click="showActions = true"></v-btn>-->

			<FmIcon v-if="!showActions" icon="lock" class="orange-text" @click="showActions = true"></FmIcon>

			<div v-if="showActions" class="flex-row">
<!--				<v-btn target="download" :href="`${config.public.apiURL}/authorizer/master-user-backups/${backup.id}/view/`" icon="mdi-cloud-download" color="primary"></v-btn>
				<v-btn icon="mdi-delete" color="primary" class="ml-0" @click="deleteBackup()"></v-btn>-->
				<a :href="`${config.public.apiURL}/authorizer/master-user-backups/${backup.id}/view/`" target="download">
					<FmIcon icon="cloud_download" class="orange-text p-8"></FmIcon>
				</a>

				<FmIcon icon="delete"
								class="orange-text m-l-0 p-8"
								@click="deleteBackup()"></FmIcon>
			</div>

<!--			<v-btn color="primary">
				restore
				<PagesProfileRestoreFromBackup
					@close="isShowRestore = false, emit('refresh')"
					v-model="isShowRestore"
					activator="parent"
				/>
			</v-btn>-->
			<FmBtn color="primary-text">
				RESTORE
				<PagesProfileRestoreFromBackup
					@close="isShowRestore = false, emit('refresh')"
					v-model="isShowRestore"
					activator="parent"
				/>
			</FmBtn>
		</v-card-actions>
	</v-card>
</template>

<script setup>

	const emit = defineEmits(["refresh"]);
	const props = defineProps({
		backup: Object,
	});

	let showActions = ref(false)
	let isShowRestore = ref(false)
	let config = useRuntimeConfig()

	// async function save() {
	// 	let res = await useApi("masterUser.put", {
	// 		body: editingData,
	// 		params: { id: editingData.id },
	// 	});

	// 	if (res.status) {
	// 		emit("refresh");
	// 	}
	// }
	async function deleteBackup() {
		let res = await useApi('masterBackups.delete', {params: {id: props.backup.id }})
		console.log('res:', res)
		emit('refresh')
	}
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
