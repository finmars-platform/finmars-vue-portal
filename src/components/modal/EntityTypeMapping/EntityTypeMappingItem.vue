<template>
	<div class="type-mapping-item">
		<div class="type-mapping-item__column">
			<div
				v-for="(mappingItem, index) in entityMapping"
				:key="index"
				class="type-mapping-item__value"
			>
				<div class="type-mapping-item__input">
					<FmTextField
						:model-value="mappingItem.value"
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
					v-if="size(entityMapping) > 1"
					icon="mdi-minus"
					variant="tonal"
					@click.stop.prevent="removeMapping(index)"
				/>
			</div>
		</div>

		<div class="type-mapping-item__column">
			{{ entityName }}
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import size from 'lodash/size';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmIconButton, FmTextField } from '@finmars/ui';

	const props = defineProps({
		entity: {
			type: Object
		}
	});

	const emits = defineEmits(['update']);

	const entityName = computed(() =>
		props.entity.user_code
			? `${props.entity.name} ('${props.entity.user_code}')`
			: props.entity.name
	);

	const entityMapping = computed(() =>
		(props.entity.mapping || []).filter((i) => !i.isDeleted)
	);

	function addMapping() {
		const updatedEntity = cloneDeep(props.entity);
		updatedEntity.mapping.splice(0, 0, { value: '' });
		emits('update', updatedEntity);
	}

	function removeMapping(index) {
		const updatedEntity = cloneDeep(props.entity);
		const mappingItem = updatedEntity.mapping[index];
		if (mappingItem.id) {
			updatedEntity.mapping[index].isDeleted = true;
		} else {
			updatedEntity.mapping.splice(index, 1);
		}
		emits('update', updatedEntity);
	}

	function updateMapping(index, value) {
		const updatedEntity = cloneDeep(props.entity);
		updatedEntity.mapping[index].value = value;
		emits('update', updatedEntity);
	}
</script>

<style lang="scss" scoped>
	.type-mapping-item {
		position: relative;
		width: 100%;
		min-height: 40px;
		padding-top: 4px;
		margin-bottom: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 32px;
		overflow: hidden;

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
