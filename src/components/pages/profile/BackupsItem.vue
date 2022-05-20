<template>
	<v-card width="360">
		<v-card-title>{{ backup.name }}</v-card-title>
		<v-card-subtitle>File size: {{ backup.file_size }} MB</v-card-subtitle>

		<v-spacer></v-spacer>
		<v-card-actions class="justify-space-between d-flex">
			<v-btn v-if="!showActions" icon="mdi-lock" color="primary" @click="showActions = true"></v-btn>

			<div v-if="showActions">
				<v-btn target="download" :href="`${config.public.apiURL}/authorizer/master-user-backups/${backup.id}/view/`" icon="mdi-cloud-download" color="primary"></v-btn>
				<v-btn icon="mdi-delete" color="primary" class="ml-0" @click="deleteBackup()"></v-btn>
			</div>

			<v-btn color="primary">restore</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script setup>
	const emit = defineEmits(["refresh"]);
	const props = defineProps({
		backup: Object,
	});

	let showActions = ref(false)
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
