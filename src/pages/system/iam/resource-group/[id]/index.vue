<template>
	<div class="fm_container">
		<div class="m-t-20">
			<span v-if="!details.user_code.length">Field is required</span>
			<BaseInput class="m-b-10" v-model="details.user_code" label="User Code" />
			<span v-if="!details.name.length">Field is required</span>
			<BaseInput class="m-b-10" v-model="details.name" label="Name" />
			<BaseInput class="m-b-10" v-model="details.description" label="Description" />
			<div class="details-action-btns">
				<FmBtn class="btn" :disabled="!validateDetails" @click="updateDetails()" type="text">
					<span class="material-icons icon">save</span>
					<span class="btn">Save</span>
				</FmBtn>
				<FmBtn class="btn" @click="deleteResource()" >
					<span class="material-icons icon">delete_outline</span>
					<span class="btn">Delete</span>
				</FmBtn>
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
						<FmIcon class="delete-assignments-icon" icon="close" @click="deleteAssignment(index)" />
					</div>
				</template>
			</BaseTable>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Resource Group',
				to: `/`,
			},
			{
				text: "Details",
				disable: true,
			},
		],
	});
	const route = useRoute();
	const router = useRouter();

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
