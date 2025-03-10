<template>
	<div class="button-set">
		<FmTextField
			:model-value="item.name"
			label="Name"
			outlined
			compact
			hide-details
			:disabled="disabled"
			@update:model-value="updateButton('name', $event)"
		/>

		<FmSelect
			:model-value="item.action"
			:options="actions"
			title-key="name"
			label="Action"
			variant="outlined"
			compact
			:disabled="disabled"
			@update:model-value="updateButton('action', $event)"
		/>

		<FmSelect
			:model-value="item.target"
			:options="getTargetsByAction(item.action)"
			title-key="name"
			label="Target"
			variant="outlined"
			compact
			:disabled="disabled"
			@update:model-value="updateButton('target', $event)"
		/>

		<FmSelect
			v-if="
				item.target &&
				['open_data_viewer', 'open_report'].includes(item.action)
			"
			:model-value="item.target_specific"
			:options="targetSpecificsSorted"
			title-key="name"
			label="Target Specific"
			variant="outlined"
			compact
			:loading="isTargetSpecificsLoading"
			:disabled="
				disabled ||
				isTargetSpecificsLoading ||
				!isTargetSpecificsLoaded ||
				isEmpty(targetSpecificsSorted)
			"
			@update:model-value="updateButton('target_specific', $event)"
		/>

		<FmTooltip type="secondary">
			<template #activator="{ props }">
				<FmCheckbox
					v-if="item.action === 'book_transaction'"
					v-bind="props"
					:model-value="item.options.get_context"
					label="Get context"
					@update:model-value="
						updateButton('options.get_context', $event)
					"
				/>
			</template>

			<span>
				Take last selected position inside another report based
				component as context.
			</span>
		</FmTooltip>

		<FmButton rounded @click.stop.prevent="clearButton">Clear</FmButton>
	</div>
</template>

<script setup>
	import { computed, onBeforeMount, ref, watch } from 'vue';
	import get from 'lodash/get';
	import set from 'lodash/set';
	import isEmpty from 'lodash/isEmpty';
	import cloneDeep from 'lodash/cloneDeep';
	import {
		FmButton,
		FmCheckbox,
		FmSelect,
		FmTextField,
		FmTooltip
	} from '@finmars/ui';
	import { findEntityByContentType } from '~/services/meta/metaContentTypeService';
	import { getListLayout } from '~/services/uiService';

	const props = defineProps({
		rowIndex: {
			type: Number
		},
		colIndex: {
			type: Number
		},
		item: {
			type: Object,
			default: () => ({})
		},
		actions: {
			type: Array,
			default: () => []
		},
		targets: {
			type: Object,
			default: () => ({})
		},
		targetSpecifics: {
			type: Object,
			default: () => ({})
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['update:button', 'update:targetSpecifics']);

	const isTargetSpecificsLoading = ref(false);
	const isTargetSpecificsLoaded = ref(false);

	const targetSpecificsSorted = computed(() => {
		return get(
			props.targetSpecifics,
			[props.item.action, props.item.target],
			[]
		).sort(sortByName);
	});

	function sortByName(a, b) {
		return a.name > b.name ? -1 : 1;
	}

	function getTargetsByAction(action) {
		return get(props.targets, action, []).sort(sortByName);
	}

	async function getTargetSpecificsByActionAndTarget(action, target) {
		if (isTargetSpecificsLoaded.value) {
			return;
		}

		try {
			isTargetSpecificsLoading.value = true;

			if (['open_report', 'open_data_viewer'].includes(action)) {
				const entityType = findEntityByContentType(target);
				const data = await getListLayout(entityType);
				console.log('DATA:  ', data);
				const updatedTargetSpecifics = cloneDeep(props.targetSpecifics);

				updatedTargetSpecifics[action][target] = (
					data?.results || []
				).map((i) => ({
					value: i.user_code,
					name: i.name
				}));
				emits('update:targetSpecifics', updatedTargetSpecifics);
			}

			isTargetSpecificsLoaded.value = true;
		} finally {
			isTargetSpecificsLoading.value = false;
		}
	}

	async function updateButton(path, value) {
		if (get(props.item, path) !== value) {
			const updatedButton = cloneDeep(props.item);
			set(updatedButton, path, value);

			if (path === 'target') {
				updatedButton.target_specific = null;
				isTargetSpecificsLoaded.value = false;
			} else if (path === 'action') {
				updatedButton.target = null;
				updatedButton.target_specific = null;
				isTargetSpecificsLoaded.value = false;
			}

			emits('update:button', updatedButton);
		}
	}

	function clearButton() {
		emits('update:button', { options: {} });
	}

	onBeforeMount(async () => {
		if (props.item.action && props.item.target) {
			isTargetSpecificsLoaded.value = false;
			await getTargetSpecificsByActionAndTarget(
				props.item.action,
				props.item.target
			);
		}
	});

	watch(
		() => props.item.target,
		async (val, oVal) => {
			if (val && val !== oVal) {
				isTargetSpecificsLoaded.value = false;
				await getTargetSpecificsByActionAndTarget(
					props.item.action,
					val
				);
			}
		}
	);
</script>

<style lang="scss" scoped>
	.button-set {
		position: relative;
		padding: 8px 16px;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: stretch;
		row-gap: 16px;

		button {
			text-transform: none;
		}
	}
</style>
