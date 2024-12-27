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
					<div class="entity-type-mapping__body-row">
						<div class="entity-type-mapping__body-header">
							<div class="entity-type-mapping__body-title">Your value</div>
							<!-- TODO temporary hide
							<FmTextField
								v-model="search.value"
								outlined
								compact
								hide-details
								prepend-icon="mdi-magnify"
								label="Search"
							/>
							-->
							<div class="relative w-full h-[40px]" />
						</div>

						<div class="entity-type-mapping__body-header">
							<div class="entity-type-mapping__body-title">Map on</div>
							<FmTextField
								v-model="search.name"
								outlined
								compact
								hide-details
								prepend-icon="mdi-magnify"
								label="Search"
							/>
						</div>
					</div>

					<div class="entity-type-mapping__delimiter" />

					<div class="entity-type-mapping__body-content">
						<template v-for="entity in filteredEntityItems" :key="entity.id">
							<EntityTypeMappingItem
								:entity="entity"
								@update="updateEntityTypeMapping(entity.id, $event)"
							/>
						</template>
					</div>
				</div>

				<div class="entity-type-mapping__actions">
					<FmButton type="secondary" rounded @click="emits('close')">
						Cancel
					</FmButton>

					<FmButton rounded :disabled="isLoading" @click.stop.prevent="save">
						Update
					</FmButton>
				</div>
			</div>
		</section>
	</teleport>
</template>

<script setup>
	import { computed, onMounted, ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import {
		FmButton,
		FmIconButton,
		FmProgressLinear,
		FmTextField
	} from '@finmars/ui';
	import { loadDataFromAllPages } from '@/utils/commonHelper';
	import { getList as getEntityList } from '@/services/entityResolverService';
	import {
		create,
		update,
		deleteByKey
	} from '@/services/entityTypeMappingResolveService';
	import { getEntityTypeList } from './utils';
	import { ENTITY_WITHOUT_COUNT } from './constants';
	import EntityTypeMappingItem from './EntityTypeMappingItem.vue';

	const props = defineProps({
		locals: {
			type: Object
		}
	});

	const emits = defineEmits(['close']);

	const isLoading = ref(false);
	const items = ref([]);
	const entityItems = ref([]);
	const search = ref({
		name: '',
		value: ''
	});

	const mapEntityType = computed(() => {
		const value = props.locals.mapItem?.complexExpressionEntity;
		return value ? value.replaceAll('_', '-') : '';
	});

	const filteredEntityItems = computed(() =>
		entityItems.value.filter((e) => {
			const entityName = e.user_code ? `${e.name} ('${e.user_code}')` : e.name;
			return entityName.toLowerCase().includes(search.value.name.toLowerCase());
		})
	);

	async function loadEntityItems() {
		const inputMapEntityType =
			props.locals.mapItem?.complexExpressionEntity || '';
		const isEntityWithoutCount = inputMapEntityType
			? ENTITY_WITHOUT_COUNT.includes(inputMapEntityType)
			: false;

		if (isEntityWithoutCount) {
			entityItems.value = await getEntityList(mapEntityType.value, {
				page: 1,
				pageSize: 1000
			});
		} else {
			entityItems.value = await loadDataFromAllPages(getEntityList, [
				mapEntityType.value,
				{ page: 1, pageSize: 1000 }
			]);
		}
	}

	async function loadItems() {
		items.value = await loadDataFromAllPages(getEntityTypeList, [
			mapEntityType.value,
			{ page: 1, pageSize: 1000 }
		]);
		console.log('loadItems: ', items.value);

		entityItems.value.forEach((entity) => {
			items.value.forEach((item) => {
				if (item.content_object !== entity.id) {
					return;
				}

				if ('mapping' in entity) {
					const entityIndex = entity.mapping.findIndex((m) => m.id === item.id);
					if (entityIndex === -1) {
						entity.mapping.push(item);
					}
					return;
				}

				entity.mapping = [item];
			});
		});

		entityItems.value.forEach((entity) => {
			if (!entity.mapping) {
				entity.mapping = [{ value: '' }];
			}
		});
	}

	function updateEntityTypeMapping(id, value) {
		const updatedItemIndex = entityItems.value.findIndex((e) => e.id === id);
		if (updatedItemIndex === -1) {
			return;
		}

		entityItems.value[updatedItemIndex] = value;
	}

	async function save() {
		try {
			isLoading.value = true;

			for (const entityItem of entityItems.value) {
				const { mapping = [] } = entityItem;
				if (!isEmpty(mapping)) {
					for (const mapItem of mapping) {
						if (!mapItem.id) {
							mapItem.provider = 1;
							if (mapEntityType.value === 'classifier') {
								mapItem.attribute_type = entityItem.classifier;

								if (entityItem.value_type === 30) {
									mapItem.classifier = entityItem.id;
								}

								mapItem.content_object = mapItem.attribute_type;
							} else {
								mapItem.content_object = entityItem.id;
							}

							if (mapItem.value) {
								await create(mapEntityType.value, mapItem);
							}
							continue;
						}

						if (mapItem.isDeleted) {
							await deleteByKey(mapEntityType.value, mapItem.id);
							continue;
						}

						await update(mapEntityType.value, mapItem);
					}
				}
			}

			emits('close');
		} finally {
			isLoading.value = false;
		}
	}

	onMounted(async () => {
		try {
			isLoading.value = true;
			await loadEntityItems();
			await loadItems();
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
			height: 480px;
			padding: 24px;

			&-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				column-gap: 32px;
			}

			&-header {
				position: relative;
				width: 50%;
			}

			&-title {
				position: relative;
				width: 100%;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				font: var(--body-large-pro-font);
				margin-bottom: 4px;
			}

			&-content {
				position: relative;
				width: 100%;
				height: calc(100% - 92px);
				padding-top: 8px;
				overflow-y: auto;
			}
		}

		&__delimiter {
			position: relative;
			width: 100%;
			height: 1px;
			border-bottom: 1px solid var(--outline-variant);
			margin: 15px 0 8px;
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
