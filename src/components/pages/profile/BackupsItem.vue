<template>
	<FmCard :title="backup.name" controls>
		<div class="fm_card_subtitle">File size: {{ backup.file_size }} MB</div>

		<template #controls>
			<div class="flex sb aic">

				<FmIcon v-if="!showActions" icon="lock" tooltip="Show more" primary @click="showActions = true"></FmIcon>

				<div v-if="showActions" class="flex-row">
					<a target="download" class="mr-10"
						:href="`${config.public.apiURL}/authorizer/master-user-backups/${backup.id}/view/`"
					>
						<FmIcon icon="cloud_download" tooltip="Export backup" primary class="" />
					</a>

					<FmIcon icon="delete" primary tooltip="Delete backup" @click="deleteBackup()" />
				</div>

				<FmBtn type="basic" @click="isShowRestore = true">
					RESTORE
				</FmBtn>
			</div>
		</template>

		<PagesProfileRestoreFromBackup
			@cancel="isShowRestore = false"
			@save="emit('refresh')"
			v-model="isShowRestore"
		/>
	</FmCard>
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
