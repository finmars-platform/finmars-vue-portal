<template>
	<teleport to="body">
		<section class="entity-type-mapping-overlay">
			<div class="entity-type-mapping">
				<div class="entity-type-mapping__header">
					Entity type mapping

					<FmIconButton
						icon="mdi-close"
						variant="text"
						@click.stop.prevent="emits('close')"
					/>

					<div v-if="isLoading" class="entity-type-mapping__loader">
						<FmProgressLinear indeterminate />
					</div>
				</div>

				<div class="entity-type-mapping__body">
					{{ locals }}
				</div>

				<div class="entity-type-mapping__actions">
					<FmButton type="secondary" rounded @click="emits('close')">
						Cancel
					</FmButton>

					<FmButton rounded>Update</FmButton>
				</div>
			</div>
		</section>
	</teleport>
</template>

<script setup>
	import { computed, onMounted, ref } from 'vue';
	import { FmButton, FmIconButton, FmProgressLinear } from '@finmars/ui';
	import { loadDataFromAllPages } from '@/utils/commonHelper';
	import { getEntityList } from './utils';
	import { ENTITY_WITHOUT_COUNT } from './constants';

	const props = defineProps({
		locals: {
			type: Object
		}
	});

	const emits = defineEmits(['close', 'update']);

	const isLoading = ref(false);
	const items = ref([]);
	const entityItems = ref([]);

	const mapEntityType = computed(() => {
		const value = props.locals.mapItem?.complexExpressionEntity;
		return value ? value.replaceAll('_', '-') : '';
	});

	async function loadEntityItems() {
		const inputMapEntityType =
			props.locals.mapItem?.complexExpressionEntity || '';
		const isEntityWithoutCount = inputMapEntityType
			? ENTITY_WITHOUT_COUNT.includes(inputMapEntityType)
			: false;

		if (isEntityWithoutCount) {
			const res = await getEntityList(mapEntityType.value);
			console.log('isEntityWithoutCount 1: ', res);
		} else {
			const res = await loadDataFromAllPages(getEntityList, [
				mapEntityType.value,
				{ page: 1, pageSize: 1000 }
			]);
			console.log('isEntityWithoutCount 2: ', res);
		}
	}

	async function loadItems() {
		// TODO
	}

	onMounted(async () => {
		try {
			isLoading.value = true;
			await loadEntityItems();
		} catch (e) {
			console.error(e);
		} finally {
			isLoading.value = false;
		}
	});
</script>

<style lang="scss" scoped>
	.entity-type-mapping-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1100;
	}

	.entity-type-mapping {
		position: relative;
		width: 840px;
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
			height: 400px;
			padding: 24px;
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--outline-variant);

			button {
				text-transform: none;
			}
		}

		&__loader {
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;
		}
	}
</style>
