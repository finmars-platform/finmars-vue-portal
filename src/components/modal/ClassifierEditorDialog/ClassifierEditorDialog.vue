<template>
	<section class="classifier-editor__wrapper">
		<div class="classifier-editor">
			<div class="classifier-editor__header">
				<span>Classifier Editor</span>

				<FmIconButton
					icon="mdi-close"
					variant="text"
					@click.stop.prevent="emits('close', false)"
				/>
			</div>

			<div class="classifier-editor__body">
				<div class="classifier-editor__content">
					<div
						class="classifier-editor__root"
						@click.prevent.stop="isRootOpen = !isRootOpen"
					>
						<div class="classifier-editor__root-block">
							<FmIcon
								:icon="isRootOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
								color="var(--on-surface-variant)"
							/>
							<FmIcon
								:icon="size(tree) ? 'mdi-label' : 'mdi-label-outline'"
								size="20"
								color="var(--on-surface-variant)"
							/>
							<span>ROOT</span>
						</div>

						<FmTooltip type="secondary" location="top">
							<template #activator="{ props }">
								<FmButton
									v-bind="props"
									type="secondary"
									icon
									@click.stop.prevent="insertItem"
								>
									<FmIcon
										icon="mdi-plus"
										size="20"
										color="var(--on-surface-variant)"
									/>
								</FmButton>
							</template>

							<span>Insert item</span>
						</FmTooltip>
					</div>

					<div v-if="isRootOpen" class="classifier-editor__tree">
						<ClassifierEditorItem
							v-for="(item, index) in tree"
							:key="index"
							:entity-type="entityType"
							:item="item"
							:parent-index="index"
							@update="updateItem($event, index)"
							@delete="deleteChild"
						/>
					</div>
				</div>
			</div>

			<div class="classifier-editor__actions">
				<FmButton type="secondary" rounded @click.stop.prevent="emits('close')">
					Cancel
				</FmButton>

				<FmButton
					rounded
					:disabled="isProcessing || !isDirty"
					@click.stop.prevent="save"
				>
					Save
				</FmButton>
			</div>

			<div v-if="isProcessing" class="classifier-editor__loader">
				<FmProgressCircular indeterminate size="80" />
			</div>
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import {
		FmButton,
		FmIcon,
		FmIconButton,
		FmProgressCircular,
		FmTooltip
	} from '@finmars/ui';
	import { getByKey, update } from '~/services/attributeTypeService';
	import useNotify from '~/composables/useNotify';
	import ClassifierEditorItem from './ClassifierEditorItem.vue';

	const props = defineProps({
		entityType: {
			type: String
		},
		item: {
			type: Object,
			default: () => ({})
		}
	});

	const emits = defineEmits(['close']);

	const isProcessing = ref(false);
	const isDirty = ref(false);
	const classifier = ref({});
	const tree = ref([]);
	const isRootOpen = ref(false);

	function insertItem() {
		isRootOpen.value = true;
		tree.value.push({
			name: 'New item',
			level: 0,
			children: [],
			isFocused: true
		});
	}

	function updateItem(item, index) {
		tree.value[index] = item;
		!isDirty.value && (isDirty.value = true);
	}

	function deleteChild(ind) {
		tree.value.splice(ind, 1);
		!isDirty.value && (isDirty.value = true);
	}

	function prepareTreeData(data) {
		data.isOpened = false;
		data.children = data.children.map(prepareTreeData);
		return data;
	}

	function prepareSavedData(data) {
		delete data.isOpened;
		data.children = data.children.map(prepareSavedData);
		return data;
	}

	async function save() {
		try {
			isProcessing.value = true;
			const updatedData = cloneDeep(classifier.value);
			updatedData.classifiers = toValue(tree.value).map(prepareSavedData);
			updatedData.classifiers_flat = [];
			await update(props.entityType, updatedData);

			useNotify({
				type: 'success',
				title: 'You are successfully save classifiers.'
			});
			emits('close');
		} finally {
			isRootOpen.value = false;
		}
	}

	onBeforeMount(async () => {
		try {
			isProcessing.value = true;
			classifier.value = await getByKey(props.entityType, props.item.id);
			tree.value = cloneDeep(classifier.value.classifiers || []).map(
				prepareTreeData
			);
		} finally {
			isProcessing.value = false;
		}
	});
</script>

<style lang="scss" scoped>
	.classifier-editor__wrapper {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.classifier-editor {
		position: relative;
		width: 520px;
		border-radius: 24px;
		background-color: var(--surface);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

		&__body {
			position: relative;
			width: 100%;
			padding: 24px;
			overflow-x: auto;
		}

		&__content {
			position: relative;
			width: 100%;
			min-height: 240px;
			max-height: 480px;
			color: var(--on-surface);
			overflow-y: auto;
		}

		&__root {
			display: flex;
			width: 100%;
			justify-content: space-between;
			align-items: center;
			cursor: pointer;

			&-block {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 16px;
				font-weight: 600;
				line-height: 24px;

				span {
					padding-left: 4px;
				}
			}

			button {
				--v-btn-height: 20px;

				min-width: calc(var(--v-btn-height) + 12px);
			}
		}

		&__tree {
			padding-left: 24px;
		}

		&__actions {
			position: relative;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--outline-variant);

			button {
				text-transform: none;
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
