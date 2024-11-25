<template>
	<div class="draft-toolbar">
		<div v-if="!loading" class="draft-toolbar-content">
			<FmMenu>
				<template #btn>
					<div class="toolbar-icon-content">
						<FmIcon
							class="draft-icon"
							v-tooltip="'Draft Manager'"
							icon="gesture"
						/>
						<div
							v-if="getLastUpdated"
							class="draft-toolbar-content-last-update"
						>
							Last Updated: {{ getLastUpdated }}
						</div>
					</div>
				</template>
				<template #default>
					<div class="fm_list">
						<div class="fm_list_item" @click="previewDraft()">
							Preview Draft
						</div>
						<div class="fm_list_item" @click="userSaveDraft()">Save Draft</div>
						<div class="fm_list_item" @click="applyDraftToFrom()">
							Apply Draft to Form
						</div>
					</div>
				</template>
			</FmMenu>
		</div>
		<template v-else>
			<FmLoader size="23" />
		</template>
	</div>
</template>

<script setup>
	const emit = defineEmits([
		'previewDraft',
		'userSaveDraft',
		'applyDraftToFrom'
	]);
	const props = defineProps({
		date: Date
	});
	const loading = ref(false);

	const getLastUpdated = computed(() => {
		if (!props.date) return '';
		let jsDate = new Date(props.date);
		let formattedTime = jsDate.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
		const now = new Date();
		const timeDifferenceInMs = now - jsDate;
		const seconds = Math.floor(timeDifferenceInMs / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		let relativeTime;

		if (days > 0) {
			relativeTime = `${days} day${days > 1 ? 's' : ''} ago`;
		} else if (hours > 0) {
			relativeTime = `${hours} hour${hours > 1 ? 's' : ''} ago`;
		} else if (minutes > 0) {
			relativeTime = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		} else {
			relativeTime = `${seconds} second${seconds > 1 ? 's' : ''} ago`;
		}
		return formattedTime + ' (' + relativeTime + ')';
	});

	const previewDraft = () => {
		emit('previewDraft');
	};

	const userSaveDraft = () => {
		loading.value = true;
		emit('userSaveDraft');
		setTimeout(() => {
			loading.value = false;
		}, 500);
	};

	const applyDraftToFrom = () => {
		loading.value = true;
		emit('applyDraftToFrom');
		setTimeout(() => {
			loading.value = false;
		}, 500);
	};
</script>

<style scoped lang="scss">
	.draft-toolbar {
		-webkit-box-shadow: 0 0 5px 2px var(--border-color);
		box-shadow: 0 0 5px 2px var(--border-color);
		border-radius: 5px;
		padding: 4px;
		.draft-toolbar-content {
			display: flex;
			align-items: center;
			justify-content: center;
			.toolbar-icon-content {
				display: flex;
				flex-direction: row;
				flex-wrap: nowrap;
				align-items: center;
				justify-content: space-between;
				gap: 10px;
				.draft-icon {
					border: 1px solid var(--border-color);
					border-radius: 5px;
				}
				.draft-toolbar-content-last-update {
					font-size: 10px;
					max-width: 120px;
				}
			}
		}
	}
</style>
