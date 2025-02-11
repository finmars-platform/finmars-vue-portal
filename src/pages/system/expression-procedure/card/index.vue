<template>
	<div v-if="item" class="card flex flex-col justify-start items-center p-4 w-full">
		<div class="flex justify-between items-center w-full">
			<div class="flex flex-col justify-start gap-2 mb-2 text-sm">
				<span>Name: <strong>{{ item.name }}</strong></span>
				<span v-if="item.notes">Notes: <strong>{{ item.notes }}</strong></span>
			</div>
			<div class="flex justify-end gap-4">
				<FmIconButton
					icon="mdi-play"
					size="small"
					@click.stop.prevent="executeItem(item)"
				>
					<FmTooltip activator="parent" type="secondary" location="top">
						Execute
					</FmTooltip>
				</FmIconButton>
				<FmIconButton
					icon="mdi-pencil"
					size="small"
					@click.stop.prevent="editItem(item)"
				>
					<FmTooltip activator="parent" type="secondary" location="top">
						Edit
					</FmTooltip>
				</FmIconButton>
				<FmIconButton
					icon="mdi-delete"
					size="small"
					@click.stop.prevent="deleteItem(item)"
				>
					<FmTooltip activator="parent" type="secondary" location="top">
						Delete
					</FmTooltip>
				</FmIconButton>
			</div>
		</div>
		<template v-if="executedItemData">
			<div
				v-if="processing"
				class="flex w-full justify-center items-center min-h-36"
			>
				<FmProgressCircular :size="30" indeterminate />
			</div>
			<div v-else class="flex flex-col items-start justify-start w-full text-sm">
				<hr>
				<div class="mb-1">
					<span>Status:</span>
					<div class="pl-4">
						<strong>{{ executedItemData.status }}</strong>
					</div>
				</div>
				<div class="mb-1">
					<span>Notes:</span>
					<div class="pl-4">
						<pre><strong>{{ executedItemData.notes }}</strong></pre>
					</div>
				</div>
				<div class="mb-1">
					<span>Options:</span>
					<div class="pl-4">
						<pre><strong>{{ executedItemData.options_object }}</strong></pre>
					</div>
				</div>
				<div class="mb-1">
					<span>Error Message:</span>
					<div class="pl-4">
						<pre><strong>{{ executedItemData.error_message }}</strong></pre>
					</div>
				</div>
				<div class="mb-1">
					<span>Result:</span>
					<div class="pl-4">
						<pre><strong>{{ executedItemData.result_object }}</strong></pre>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup>
	import { FmIconButton, FmProgressCircular, FmTooltip } from '@finmars/ui';

	const props = defineProps({
		item: {
			type: Object,
			required: true
		}
	});

	const emit = defineEmits(['editItem', 'deleteItem']);
	const executedItemData = ref(null);
	const processing = ref(false);

	async function executeItem(item) {
		processing.value = true;
		useNotify({
			type: 'warning',
			title: `Execute is in processing`
		});
		const res = await useApi('expressionProcedureId.post', { params: { id: item.id } });
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			const result = await useApi('taskCard.get', { params: { taskId: res.task_id } });
			if (result && result._$error) {
				useNotify({ type: 'error', title: result._$error.message || result._$error.detail });
			} else {
				useNotify({
					type: 'success',
					title: `"${item.name}" Procedure is being processed`
				});
				executedItemData.value = result;
			}
		}
		processing.value = false;
	}

	const editItem = (item) => {
		emit('editItem', item);
	};

	const deleteItem = (item) => {
		emit('deleteItem', item);
	};
</script>

<style scoped lang="scss">
	.card {
		border-radius: var(--spacing-8);
		border: 1px solid var(--card-border-color);
		hr {
			width: 100%;
			height: 1px;
			background: var(--primary-color);
			margin: var(--spacing-12) 0;
		}
	}
</style>
