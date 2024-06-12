<template>
	<FmCard :title="backup.name" controls>
		<div class="fm_card_subtitle">File size: {{ Math.round(backup.file_size / 1024 / 1024 * 100) / 100 }} MB</div>

		<template #controls>
			<div class="flex sb aic">

				<FmIcon v-if="!showActions" icon="lock" tooltip="Show more" primary @click="showActions = true"></FmIcon>

				<div v-if="showActions" class="flex-row">
					<a target="download" class="mr-10"
						:href="`${config.public.authorizerURL}/master-user-backups/${backup.id}/view/`"
					>
						<FmIcon icon="cloud_download" tooltip="Export backup" primary class="" />
					</a>

					<FmIcon icon="delete" primary tooltip="Delete backup" @click="deleteBackup()" />
				</div>

				<FmBtn type="basic" @click="isShowRestore = true">
					REStore
				</FmBtn>
			</div>
		</template>

		<PagesProfileRestoreFromBackup
			@cancel="isShowRestore = false"
			@save="emit('refresh')"
			v-model="isShowRestore"
			:backupId="backup.id"
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
		let res = await useApi('spaceBackup.delete', {params: {id: props.backup.id }})
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
