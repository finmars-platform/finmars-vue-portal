<template>
	<section class="classifier-mapping-dialog__wrapper">
		<div class="classifier-mapping-dialog">
			<div class="classifier-mapping-dialog__header">
				<span>Entity type classifier mapping</span>

				<FmIconButton
					icon="mdi-close"
					variant="text"
					@click.stop.prevent="emits('close', false)"
				/>
			</div>

			<div class="classifier-mapping-dialog__body">
				<div class="classifier-mapping-dialog__body-row">
					<div class="classifier-mapping-dialog__body-header">
						<div class="classifier-mapping-dialog__body-title">Your value</div>
					</div>

					<div class="classifier-mapping-dialog__body-header">
						<div class="classifier-mapping-dialog__body-title">
							Map on portfolio
						</div>
					</div>
				</div>

				<div class="classifier-mapping-dialog__delimiter" />

				<div class="classifier-mapping-dialog__body-content">
					<template v-for="item in items" :key="item.id">
						<ClassifierMappingItem
							:item="item"
							@update="updateItemMapping(item.id, $event)"
						/>
					</template>
				</div>
			</div>

			<div class="classifier-mapping-dialog__actions">
				<FmButton type="secondary" rounded @click.stop.prevent="emits('close')">
					Close
				</FmButton>

				<FmButton
					rounded
					:disabled="isProcessing"
					@click.stop.prevent="updateMapping"
				>
					Update
				</FmButton>
			</div>

			<div v-if="isProcessing" class="classifier-mapping-dialog__loader">
				<FmProgressCircular indeterminate size="80" />
			</div>
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import { FmButton, FmIconButton, FmProgressCircular } from '@finmars/ui';
	import { getByKey } from '~/services/attributeTypeService';
	import {
		getList,
		create,
		update,
		deleteByKey
	} from '~/services/entity/entityTypeClassifierMappingResolveService';
	import ClassifierMappingItem from './ClassifierMappingItem.vue';

	const props = defineProps({
		entityType: {
			type: String
		},
		id: {
			type: Number
		}
	});

	const emits = defineEmits(['close']);

	const isProcessing = ref(false);
	const classifier = ref();
	const items = ref([]);

	async function updateMapping() {
		try {
			isProcessing.value = true;

			for (const item of items.value) {
				const { mapping = [] } = item;
				if (!isEmpty(mapping)) {
					for (const mapItem of mapping) {
						mapItem.provider = 1;
						mapItem.content_object = item.id;
						mapItem.attribute_type = classifier.value.id;

						if (!mapItem.id) {
							if (mapItem.value) {
								await create(props.entityType, mapItem);
							}
							continue;
						}

						if (mapItem.isDeleted) {
							await deleteByKey(props.entityType, mapItem.id);
							continue;
						}

						if (mapItem.value) {
							await update(props.entityType, mapItem);
						} else {
							await deleteByKey(props.entityType, mapItem.id);
						}
					}
				}
			}

			emits('close');
		} finally {
			isProcessing.value = false;
		}
	}

	function updateItemMapping(id, value) {
		const updatedItemIndex = items.value.findIndex((e) => e.id === id);
		if (updatedItemIndex === -1) {
			return;
		}

		items.value[updatedItemIndex] = value;
	}

	onBeforeMount(async () => {
		try {
			isProcessing.value = true;
			classifier.value = await getByKey(props.entityType, props.id);
			const data = await getList(props.entityType, props.id);

			items.value = (classifier.value.classifiers_flat || [])
				.map((c) => {
					c.mapping = [];
					data.results.forEach((mapItem) => {
						if (mapItem.content_object === c.id) {
							c.mapping.push(mapItem);
						}
					});
					return c;
				})
				.map((c) => {
					if (!c.mapping.length) {
						c.mapping = [{ value: '' }];
					}
					return c;
				});
		} catch (err) {
			console.error(err);
		} finally {
			isProcessing.value = false;
		}
	});
</script>

<style lang="scss" scoped>
	.classifier-mapping-dialog__wrapper {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.classifier-mapping-dialog {
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
			padding: 24px;
			font: var(--body-large-font);
			color: var(--on-surface);

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
				min-height: 200px;
				max-height: 480px;
				padding-top: 8px;
				overflow-y: auto;
			}
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

		&__delimiter {
			position: relative;
			width: 100%;
			height: 1px;
			border-bottom: 1px solid var(--outline-variant);
			margin: 15px 0 8px;
		}
	}
</style>
