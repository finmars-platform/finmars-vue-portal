<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div class="fm_container">
			<div class="m-t-20">
				<FmTextField
					v-model="details.user_code"
					label="User Code"
					:rules="[rules.required]"
					outlined
					class="mb-2"
				/>
				<FmTextField
					v-model="details.name"
					label="Name"
					:rules="[rules.required]"
					outlined
					class="mb-2"
				/>
				<FmTextField
					v-model="details.description"
					label="Description"
					outlined
					class="mb-2"
				/>
				<div class="details-action-btns">
					<FmButton type="secondary" @click="updateDetails()" :disabled="!validateDetails">
						Save
						<template #prepend>
							<FmIcon icon="mdi-content-save-outline" :size="18" />
						</template>
					</FmButton>
					<FmButton type="primary" @click="deleteResource()">
						Delete
						<template #prepend>
							<FmIcon icon="mdi-delete" :size="18" color="var(--primary-container)" />
						</template>
					</FmButton>
				</div>
			</div>
			<div class="assignments-content" v-if="details.assignments.length">
				<span class="assignments-title">Assignments</span>
				<BaseTable
					colls="50px 60px 1fr 1fr 1fr 1fr"
					:items="details.assignments"
					:isRightKebab="true"
					:headers="[
					'',
					'ID',
					'Object ID',
					'User Code',
					'Resource Group',
					'Content Type'
				]"
				>
					<template #actions="{index}">
						<div class="flex jcc aic height-100">
							<FmIcon icon="mdi-close" :size="18" @click="deleteAssignment(index)" />
						</div>
					</template>
				</BaseTable>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import { FmBreadcrumbs, FmIcon, FmButton, FmTextField } from '@finmars/ui';

	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Resource Groups', path: 'resource-group' },
		{ title: 'Details', path: '' }
	]);

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const resourceGroupItem = await useApi('resourceGroupDetails.get', {
		params: {
			id: route.params.id
		}
	});

	const details = reactive(resourceGroupItem);

	const validateDetails = computed(() => {
		return details.name.length && details.user_code.length;
	});

	async function deleteResource() {
		const confirm = await useConfirm({
			title: 'Confirm action',
			text: `Do you want to delete ${resourceGroupItem.name}?`,
		});
		if (confirm) {
			await useApi('resourceGroupDetails.delete', {
				params: {id: route.params.id}
			});
			useNotify({
				type: 'success',
				title: 'Successfully deleted',
			})
			router.back()
		}
	}

	async function updateDetails() {
		await useApi('resourceGroupDetails.put', {
			params: {id: route.params.id},
			body: details
		});
		useNotify({
			type: 'success',
			title: 'Successfully saved',
		})
	}

	async function deleteAssignment(index) {
		const assignment = details.assignments[index].object_user_code;
		const isConfirm = await useConfirm({
			title: 'Delete Assignment',
			text: `Do you want to delete an Assignment "${assignment}"?`
		});
		if (!isConfirm) return false;
		details.assignments.splice(index, 1);
	}

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system/iam` + newPath);
	};
</script>

<style scoped lang="scss">
	:deep(.table-cell-btn) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-align: left;
		user-select: auto;
		cursor: text;
	}
	.details-action-btns {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 10px;
		margin-top: 6px;
		.btn {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 5px;
			.icon {
				font-size: 16px;
			}
		}
	}
	.assignments-content {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 40px;
		.assignments-title {
			font-size: 18px;
		}
		.delete-assignments-icon {
			transition: transform 0.1s ease, opacity 0.5s ease;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 18px;
			min-width: 22px;
			min-height: 22px;
			&:hover {
				opacity: 0.8;
				transform: scale(1.2);
			}
		}
	}
</style>
