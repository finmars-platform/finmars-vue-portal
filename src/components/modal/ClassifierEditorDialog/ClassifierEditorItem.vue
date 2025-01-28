<template>
	<div class="classifier-editor-item">
		<div
			:class="[
				'classifier-editor-item__content',
				{
					'classifier-editor-item__content--filled': !!size(
						item.children
					)
				}
			]"
			@click.prevent.stop="toggleList"
		>
			<div class="classifier-editor-item__icon">
				<FmIcon
					v-if="!!size(item.children)"
					:icon="
						item.isOpened ? 'mdi-chevron-up' : 'mdi-chevron-down'
					"
					color="var(--on-surface-variant)"
				/>
			</div>
			<FmIcon
				:icon="size(item.children) ? 'mdi-label' : 'mdi-label-outline'"
				size="20"
				color="var(--on-surface-variant)"
			/>

			<div class="classifier-editor-item__name">
				<FmTextField
					:model-value="item.name"
					outlined
					compact
					hide-details
					:autofocus="item.isFocused"
					@init="inputEl = $event.input"
					@change="changeName"
				/>
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

			<FmTooltip type="secondary" location="top">
				<template #activator="{ props }">
					<FmButton
						v-bind="props"
						type="secondary"
						icon
						@click.stop.prevent="deleteItem"
					>
						<FmIcon
							icon="mdi-delete"
							size="20"
							color="var(--error)"
						/>
					</FmButton>
				</template>

				<span>Delete item</span>
			</FmTooltip>
		</div>

		<div v-if="item.isOpened" class="classifier-editor-item__tree">
			<ClassifierEditorItem
				v-for="(item, index) in item.children"
				:key="index"
				:entity-type="entityType"
				:item="item"
				:parent-index="index"
				@scroll="emits('scroll', $event)"
				@update="updateItem($event, index)"
				@delete="deleteChild"
			/>
		</div>
	</div>
</template>

<script setup>
	import { ref, watch } from 'vue';
	import size from 'lodash/size';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmButton, FmIcon, FmTextField, FmTooltip } from '@finmars/ui';
	import ClassifierEditorItem from './ClassifierEditorItem.vue';

	const props = defineProps({
		entityType: {
			type: String
		},
		item: {
			type: Object
		},
		parentIndex: {
			type: Number
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update', 'scroll', 'delete']);

	const inputEl = ref(null);

	function toggleList() {
		if (size(props.item.children) > 0 && !props.disabled) {
			const updatedItem = cloneDeep(props.item);
			updatedItem.isOpened = !updatedItem.isOpened;
			emits('update', updatedItem);
		}
	}

	function changeName(val) {
		const updatedItem = cloneDeep(props.item);
		updatedItem.name = val;
		delete updatedItem.isFocused;
		emits('update', updatedItem);
	}

	function insertItem() {
		const updatedItem = cloneDeep(props.item);
		updatedItem.isOpened = true;
		updatedItem.children.push({
			name: 'New item',
			level: props.item.level + 1,
			children: [],
			isFocused: true
		});
		emits('update', updatedItem);
	}

	function deleteItem() {
		emits('delete', props.parentIndex);
	}

	function deleteChild(ind) {
		const updatedItem = cloneDeep(props.item);
		updatedItem.children.splice(ind, 1);
		emits('update', updatedItem);
	}

	function updateItem(value, index) {
		const updatedItem = cloneDeep(props.item);
		updatedItem.children[index] = value;
		emits('update', updatedItem);
	}

	watch(
		() => props.item?.isFocused,
		(val, oVal) => {
			if (val && val !== oVal) {
				setTimeout(() => {
					emits('scroll', inputEl.value);
				}, 100);
			}
		},
		{ immediate: true }
	);
</script>

<style lang="scss" scoped>
	.classifier-editor-item {
		position: relative;
		width: fit-content;
		margin: 4px 0;

		&__content {
			position: relative;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			cursor: default;

			button {
				--v-btn-height: 20px;

				min-width: calc(var(--v-btn-height) + 12px);
			}

			&--filled {
				cursor: pointer;
			}
		}

		&__icon {
			position: relative;
			width: 24px;
			min-width: 24px;
			height: 24px;
		}

		&__name {
			position: relative;
			width: 200px;
			padding: 0 4px;
		}

		&__tree {
			padding-left: 24px;
		}
	}
</style>
