<template>
	<div class="control-accordion-component-dialog" @keydown.stop.prevent.enter>
		<div class="control-accordion-component-dialog__content">
			<div class="row-grid">
				<FmTextField v-model="itemData.name" label="Name" outlined />
			</div>
		</div>

		<div class="control-accordion-component-dialog__actions">
			<FmButton
				type="secondary"
				rounded
				@click.stop.prevent="emits('close')"
			>
				Cancel
			</FmButton>

			<FmButton
				rounded
				:disabled="!itemData.name"
				@click.stop.prevent="save"
			>
				Ok
			</FmButton>
		</div>
	</div>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmButton, FmTextField } from '@finmars/ui';
	import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
	import { md5 } from '~/utils/md5';

	const props = defineProps({
		item: {
			type: [Object, null]
		}
	});

	const emits = defineEmits(['close', 'confirm']);

	const dashboardConstructorStore = useDashboardConstructorStore();
	const { components } = storeToRefs(dashboardConstructorStore);
	const { updateComponent, setComponents } = dashboardConstructorStore;

	const itemData = ref(null);

	function save() {
		if (itemData.value.id) {
			updateComponent(itemData.value);
		} else {
			itemData.value.id = md5(`${Date.now()}_${itemData.value.id}`);
			const updatedComponents = cloneDeep(components.value);
			updatedComponents.push(itemData.value);
			setComponents(updatedComponents);
		}

		emits('confirm');
	}

	onBeforeMount(() => {
		if (props.item) {
			itemData.value = cloneDeep(props.item);
		} else {
			itemData.value = {
				type: 'accordion',
				id: null,
				name: '',
				settings: {}
			};
		}
	});
</script>

<style lang="scss" scoped>
	.control-accordion-component-dialog {
		position: relative;
		width: 100%;

		&__body {
			position: relative;
			width: 100%;
			padding: 24px 24px 0 24px;

			:deep(.v-tabs) {
				border-radius: 4px 4px 0 0;
				width: 320px;

				button {
					text-transform: none;
					background-color: transparent !important;
				}
			}
		}

		&__content {
			position: relative;
			width: 100%;
			height: 320px;
			border-radius: 8px;
			padding: 24px 24px 0 24px;
			border: 1px solid var(--outline-variant);
		}

		&__actions {
			display: flex;
			width: 100%;
			padding: 24px;
			justify-content: space-between;
			align-items: center;

			button {
				text-transform: none;
			}
		}
	}

	.row-grid {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 16px;
		margin-bottom: 16px;
	}
</style>
