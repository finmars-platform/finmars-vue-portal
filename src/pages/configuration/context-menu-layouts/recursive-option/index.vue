<template>
	<div class="flex flex-col justify-start items-start">
		<div class="row">
			<div class="title">
				{{ optionItem?.name }}
			</div>
			<div @click="openCreateModal">
				<FmTooltip type="secondary">
					<template #activator="{ props }">
						<FmIcon
							v-bind="props"
							icon="mdi-plus"
							:size="26"
							class="cursor-pointer"
						/>
					</template>
					<span>Add Sub Option</span>
				</FmTooltip>
			</div>
			<div @click="moveUp">
				<FmTooltip type="secondary">
					<template #activator="{ props }">
						<FmIcon
							v-bind="props"
							icon="mdi-chevron-up"
							:size="26"
							class="cursor-pointer"
						/>
					</template>
					<span>Move up</span>
				</FmTooltip>
			</div>
			<div @click="moveDown">
				<FmTooltip type="secondary">
					<template #activator="{ props }">
						<FmIcon
							v-bind="props"
							icon="mdi-chevron-down"
							:size="26"
							class="cursor-pointer"
						/>
					</template>
					<span>Move down</span>
				</FmTooltip>
			</div>
			<div @click="openEditModal">
				<FmTooltip type="secondary">
					<template #activator="{ props }">
						<FmIcon
							v-bind="props"
							icon="mdi-pencil"
							:size="26"
							class="cursor-pointer"
						/>
					</template>
					<span>Edit option</span>
				</FmTooltip>
			</div>
			<div @click="deleteItem">
				<FmTooltip type="secondary">
					<template #activator="{ props }">
						<FmIcon
							v-bind="props"
							icon="mdi-close"
							:size="26"
							class="cursor-pointer"
						/>
					</template>
					<span>Delete option</span>
				</FmTooltip>
			</div>
		</div>
		<div
			class="ml-10"
			v-if="optionItem?.children && optionItem?.children.length"
		>
			<RecursiveOption
				v-for="child in optionItem.children"
				:key="child.order"
				:item="child"
				:list="optionItem.children"
				@update-list="$emit('update-list')"
			/>
		</div>
		<template v-if="showModal">
			<OptionModal
				v-model="showModal"
				:modal-type="modalType"
				:item="optionItem"
				@create="addChild"
				@edit="editItem"
				@close="closeModal"
			/>
		</template>
	</div>
</template>

<script setup>
	import RecursiveOption from '@/pages/configuration/context-menu-layouts/recursive-option';
	import OptionModal from '@/pages/configuration/context-menu-layouts/recursive-option/option-modal/index.vue';
	import { FmIcon } from '@finmars/ui';

	definePageMeta({
		middleware: 'auth'
	});

	const props = defineProps({
		item: {
			type: Object,
			default() {
				return {};
			}
		},
		list: {
			type: Array,
			default() {
				return [];
			}
		}
	});

	const emit = defineEmits(['update-list']);
	const modalType = ref('create');
	const showModal = ref(false);

	const optionItem = ref({});
	const optionList = ref([]);

	const addChild = (elem) => {
		if (!optionItem.value.children) {
			optionItem.value.children = [];
		}
		optionItem.value.children.push({
			name: elem.name,
			action: elem.action,
			order: optionItem.value.children.length
		});
		emit('update-list');
		closeModal();
	};

	const moveUp = () => {
		const index = optionList.value.indexOf(optionItem.value);
		if (index > 0) {
			optionList.value.splice(index, 1);
			optionList.value.splice(index - 1, 0, optionItem.value);
			emit('update-list');
		}
	};

	const moveDown = () => {
		const index = optionList.value.indexOf(optionItem.value);
		if (index < optionList.value.length - 1) {
			optionList.value.splice(index, 1);
			optionList.value.splice(index + 1, 0, optionItem.value);
			emit('update-list');
		}
	};

	const editItem = (editedItem) => {
		optionItem.value = editedItem;
		const index = optionList.value.findIndex(
			(item) => item.order === editedItem.order
		);
		if (index !== -1) {
			optionList.value[index] = { ...editedItem };
		}
		closeModal();
	};

	const deleteItem = async () => {
		const confirm = await useConfirm({
			title: 'Warning',
			text: `Are you sure you want to delete this option?`
		});
		if (confirm) {
			const index = optionList.value.indexOf(optionItem.value);
			if (index !== -1) {
				optionList.value.splice(index, 1);
				emit('update-list');
				useNotify({ title: 'Successfully deleted', type: 'success' });
			}
		}
	};

	const openCreateModal = () => {
		modalType.value = 'create';
		showModal.value = true;
	};

	const openEditModal = () => {
		modalType.value = 'edit';
		showModal.value = true;
	};

	const closeModal = () => {
		modalType.value = 'create';
		showModal.value = false;
	};

	function init() {
		optionItem.value = props.item;
		optionList.value = props.list;
	}

	init();
</script>

<style scoped lang="scss">
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-48);
		border: 1px solid var(--border-color);
		padding: var(--spacing-12) var(--spacing-16);
		.title {
			min-width: 260px;
			display: flex;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			flex: 1;
		}
	}
</style>
