<template>
	<div
		:class="[
			'component-list-item',
			{ 'component-list-item--dragging': isDragging }
		]"
		draggable="true"
		@dragstart="onDragstart"
		@drag="onDragThrottled"
		@dragend="onDragend"
	>
		<div class="component-list-item__content">
			<b>{{ item.name }}</b>
			<span>{{ getComponentItemVerboseType(item) }}</span>
		</div>

		<FmIconButton
			variant="text"
			size="small"
			icon="mdi-pencil"
			color="var(--on-surface-variant)"
			:disabled="disabled"
			@click.stop.prevent="emits('edit', item)"
		/>

		<FmIconButton
			variant="text"
			size="small"
			icon="mdi-delete"
			color="var(--error)"
			:disabled="disabled"
			@click.stop.prevent="emits('delete', item)"
		/>
	</div>
</template>

<script setup>
	import { inject, ref } from 'vue';
	import throttle from 'lodash/throttle';
	import { FmIconButton, FM_VUEBUS_KEY } from '@finmars/ui';
	import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
	import { getComponentItemVerboseType } from './utils';
	import { DASHBOARD_CONSTRUCTOR_EVENTS } from '~/constants';

	const props = defineProps({
		item: {
			type: Object
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['edit', 'delete']);

	const vueBus = inject(FM_VUEBUS_KEY);

	const { setDraggableComponent } = useDashboardConstructorStore();

	const isDragging = ref(false);
	const mouseAt = ref({ x: -1, y: -1 });

	const onDragThrottled = throttle(onDrag, 150);

	function onDragstart() {
		isDragging.value = true;
		setTimeout(() => {
			setDraggableComponent(props.item);
		}, 100);
	}

	function onDrag(event) {
		const x = event.clientX;
		const y = event.clientY;
		if (
			!(x === 0 && y === 0) &&
			(mouseAt.value.x !== x || mouseAt.value.y !== y)
		) {
			mouseAt.value = { x, y };
			vueBus.$emitter.emit(DASHBOARD_CONSTRUCTOR_EVENTS.DRAG_COMPONENT, {
				mouseAt: mouseAt.value,
				component: props.item
			});
		}
	}

	function onDragend() {
		isDragging.value = false;
		vueBus.$emitter.emit(DASHBOARD_CONSTRUCTOR_EVENTS.DRAGEND_COMPONENT, {
			mouseAt: mouseAt.value,
			component: props.item
		});

		mouseAt.value = { x: -1, y: -1 };
		setDraggableComponent(null);
	}
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/mixins' as mixins;

	.component-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 8px;
		border-radius: 8px;
		background-color: var(--surface-container);
		margin-bottom: 4px;
		cursor: move;

		&__content {
			position: relative;
			padding: 0 4px;
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;
			font: var(--body-medium-font);
			color: var(--on-surface);
			@include mixins.text-overflow-ellipsis();
		}

		&--dragging {
			opacity: 0.7;
			box-shadow:
				0 2px 3px 0 rgba(0, 0, 0, 0.3),
				0 6px 10px 4px rgba(0, 0, 0, 0.15);
		}
	}
</style>
