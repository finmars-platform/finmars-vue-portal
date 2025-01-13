<template>
	<div class="classifier-mapping-item">
		<div class="classifier-mapping-item__column">
			<div
				v-for="(m, index) in itemMapping"
				:key="index"
				class="classifier-mapping-item__value"
			>
				<div class="classifier-mapping-item__input">
					<FmTextField
						:model-value="m.value"
						outlined
						compact
						hide-details
						label="Value"
						@change="updateMapping(index, $event)"
					/>
				</div>

				<FmIconButton
					icon="mdi-plus"
					variant="tonal"
					@click.stop.prevent="addMapping"
				/>

				<FmIconButton
					v-if="size(itemMapping) > 1"
					icon="mdi-minus"
					variant="tonal"
					@click.stop.prevent="removeMapping(index)"
				/>
			</div>
		</div>

		<div class="classifier-mapping-item__column">
			{{ item.name }}
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import { FmIconButton, FmTextField } from '@finmars/ui';

	const props = defineProps({
		item: {
			type: Object
		}
	});

	const emits = defineEmits(['update']);

	const itemMapping = computed(() =>
		(props.item.mapping || []).filter((i) => !i.isDeleted)
	);

	function addMapping() {
		const updatedItem = cloneDeep(props.item);
		updatedItem.mapping.splice(0, 0, { value: '' });
		emits('update', updatedItem);
	}

	function removeMapping(index) {
		const updatedItem = cloneDeep(props.item);
		const mappingItem = updatedItem.mapping[index];
		if (mappingItem.id) {
			updatedItem.mapping[index].isDeleted = true;
		} else {
			updatedItem.mapping.splice(index, 1);
		}
		emits('update', updatedItem);
	}

	function updateMapping(index, val) {
		const updatedItem = cloneDeep(props.item);
		updatedItem.mapping[index].value = val;
		emits('update', updatedItem);
	}
</script>

<style lang="scss" scoped>
	.classifier-mapping-item {
		position: relative;
		width: 100%;
		min-height: 40px;
		padding: 4px;
		margin-bottom: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 32px;
		overflow: hidden;
		border-bottom: 1px solid var(--outline-variant);

		&__column {
			position: relative;
			width: 50%;
		}

		&__value {
			position: relative;
			width: 100%;
			display: grid;
			grid-template-columns: auto 40px 40px;
			column-gap: 8px;
			margin-bottom: 8px;
		}

		&__input {
			position: relative;
			width: 100%;

			& > div {
				--backgroundColor-fmTextField: transparent !important;
			}
		}
	}
</style>
