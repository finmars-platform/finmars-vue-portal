import {
	computed,
	inject,
	onBeforeUnmount,
	onMounted,
	ref,
	toValue,
	watch
} from 'vue';
import get from 'lodash/get';
import size from 'lodash/size';
import cloneDeep from 'lodash/cloneDeep';
import { FM_VUEBUS_KEY } from '@finmars/ui';
import { getComponentItemVerboseType } from './utils';
import { DASHBOARD_CONSTRUCTOR_EVENTS } from '~/constants';
import set from 'lodash/set';

export function useLayout(data, path, emits) {
	const vueBus = inject(FM_VUEBUS_KEY);

	const wrapper = ref();
	const gridLayout = ref();

	const gridData = ref([]);

	const layout = computed(() =>
		get(toValue(data), [...toValue(path), 'layout'], {})
	);
	const components = computed(() => toValue(data).components || []);
	const componentsLabels = computed(() =>
		components.value.reduce((res, item) => {
			res[item.id] =
				`<b>${item.name}</b> <span>(${getComponentItemVerboseType(item)})</span>`;
			return res;
		}, {})
	);
	const columnsCount = computed(() => get(layout.value, 'columns_count', 10));
	const rows = computed(() => get(layout.value, 'rows', []));
	const rowsCount = computed(() => size(rows.value));
	const rowHeight = 75;
	const rowHeightCss = computed(() => `${rowHeight}px`);

	const isDragging = ref(false);
	const dragItem = ref({ x: -1, y: -1, w: 1, h: 1, i: '' });

	function getComponentById(id) {
		return (toValue(data).components || []).find((c) => c.id === id);
	}

	function isMouseInGrid(mouseAt, parentRect) {
		return (
			mouseAt.x > parentRect.left &&
			mouseAt.x < parentRect.right &&
			mouseAt.y > parentRect.top &&
			mouseAt.y < parentRect.bottom
		);
	}

	function transformLayoutRowsToGridData(rowsData = []) {
		return rowsData.reduce((res, row) => {
			const y = row.row_number;
			(row.columns || []).forEach((column) => {
				const {
					column_number: x,
					cell_type,
					colspan: w,
					rowspan: h,
					data,
					is_hidden
				} = column;
				if (cell_type !== 'empty' && !is_hidden && data.id) {
					res.push({ x, y, w, h, i: data.id, moved: false });
				}
			});

			return res;
		}, []);
	}

	function transformGridDataToLayoutData(
		gridDataValue = [],
		columnsCountValue,
		rowsCountValue
	) {
		const layoutData = {
			columns_count: columnsCountValue,
			rows_count: rowsCountValue,
			rows: []
		};

		Array.from({ length: rowsCountValue }).forEach((_, rowNumber) => {
			const row = {
				row_number: rowNumber,
				columns: []
			};
			Array.from({ length: columnsCountValue }).forEach(
				(_, columnNumber) => {
					row.columns.push({
						cell_type: 'empty',
						column_number: columnNumber,
						colspan: 1,
						rowspan: 1,
						data: {}
					});
				}
			);
			layoutData.rows.push(row);
		});

		gridDataValue.forEach((item) => {
			const { x, y, w, h, i } = item;
			const component = getComponentById(i);
			if (component) {
				const value = {
					cell_type: 'component',
					colspan: w,
					rowspan: h,
					column_number: x,
					data: {
						id: component.id,
						type: component.type,
						value_type: component.settings.value_type
					}
				};
				set(layoutData.rows, [y, 'columns', x], value);

				for (let diffX = 0; diffX < w; diffX += 1) {
					for (let diffY = 0; diffY < h; diffY += 1) {
						if (!(diffX === 0 && diffY === 0)) {
							set(
								layoutData.rows,
								[y + diffY, 'columns', x + diffX, 'is_hidden'],
								true
							);
						}
					}
				}
			}
		});

		return layoutData;
	}

	function isRowEmpty(rowIndex) {
		const columns = get(layout.value, ['rows', rowIndex, 'columns'], []);
		const filteredColumns = columns.filter(
			(c) => c.cell_type !== 'empty' || !!c.is_hidden
		);
		return !size(filteredColumns);
	}

	function isRowAddable(rowIndex) {
		if (rowIndex === rowsCount.value - 1) {
			return true;
		}

		return !rows.value[rowIndex].columns.some((cell, index) => {
			const { cell_type, is_hidden } = cell;
			const { cell_type: next_cell_type, is_hidden: next_is_hidden } =
				rows.value[rowIndex + 1].columns[index];
			return (
				(cell_type === 'component' ||
					(cell_type === 'empty' && !!is_hidden)) &&
				next_cell_type === 'empty' &&
				!!next_is_hidden
			);
		});
	}

	function updateDashboard(layoutGridData = []) {
		if (isDragging.value) return;

		const updatedLayout = transformGridDataToLayoutData(
			layoutGridData,
			columnsCount.value,
			rowsCount.value
		);

		emits('update', {
			path: ['data', ...toValue(path), 'layout'],
			value: updatedLayout
		});
	}

	function insertRow(rowIndex) {
		const newRow = {
			columns: [],
			row_number: rowIndex + 1
		};
		for (let i = 0; i < columnsCount.value; i++) {
			newRow.columns.push({
				cell_type: 'empty',
				colspan: 1,
				column_number: i,
				data: {},
				rowspan: 1
			});
		}
		const updatedLayout = cloneDeep(layout.value);
		updatedLayout.rows.splice(rowIndex + 1, 0, newRow);
		updatedLayout.rows_count = size(updatedLayout.rows);
		updatedLayout.rows.forEach((row, index) => {
			row.row_number = index;
		});

		emits('update', {
			path: ['data', ...toValue(path), 'layout'],
			value: updatedLayout
		});
	}

	function deleteRow(rowIndex) {
		const updatedLayout = cloneDeep(layout.value);
		updatedLayout.rows.splice(rowIndex, 1);
		updatedLayout.rows_count = size(updatedLayout.rows);
		updatedLayout.rows.forEach((row, index) => {
			row.row_number = index;
		});

		emits('update', {
			path: ['data', ...toValue(path), 'layout'],
			value: updatedLayout
		});
	}

	function removeComponent(item) {
		const updatedGridData = cloneDeep(gridData.value);
		const currentItemIndex = updatedGridData.findIndex(
			(i) => i.i === item.i
		);
		updatedGridData.splice(currentItemIndex, 1);

		updateDashboard(updatedGridData);
	}

	function runEditComponent(item) {
		const { i: id } = item;
		const component = components.value.find((comp) => comp.id === id);
		emits('edit:component', component);
	}

	function onComponentDrag({ mouseAt, component }) {
		const parentRect = wrapper.value?.getBoundingClientRect();
		if (!parentRect || !gridLayout.value) return;
		isDragging.value = true;

		const mouseInGrid = isMouseInGrid(mouseAt, parentRect);
		if (
			mouseInGrid &&
			!gridData.value.find((item) => item.i === component.id)
		) {
			gridData.value.push({
				x: columnsCount.value - 1,
				y: 0,
				w: 1,
				h: 1,
				i: component.id
			});
		}

		const index = gridData.value.findIndex(
			(item) => item.i === component.id
		);
		if (index !== -1) {
			const item = gridLayout.value.getItem(component.id);
			if (!item) return;

			try {
				item.wrapper.style.display = 'none';
			} catch (e) {
				//
			}

			Object.assign(item.state, {
				top: mouseAt.y - parentRect.top,
				left: mouseAt.x - parentRect.left
			});
			const newPos = item.calcXY(
				mouseAt.y - parentRect.top,
				mouseAt.x - parentRect.left
			);

			if (mouseInGrid) {
				gridLayout.value.dragEvent(
					'dragstart',
					component.id,
					newPos.x,
					newPos.y,
					dragItem.value.h,
					dragItem.value.w
				);
				dragItem.value.i = component.id;
				dragItem.value.x = gridData.value[index].x;
				dragItem.value.y = gridData.value[index].y;
			} else {
				gridLayout.value.dragEvent(
					'dragend',
					component.id,
					newPos.x,
					newPos.y,
					dragItem.value.h,
					dragItem.value.w
				);
				gridData.value = gridData.value.filter(
					(item) => item.i !== component.id
				);
			}
		}
	}

	function onComponentDragend({ mouseAt, component }) {
		isDragging.value = false;
		const parentRect = wrapper.value?.getBoundingClientRect();
		if (!parentRect || !gridLayout.value) return;

		const mouseInGrid = isMouseInGrid(mouseAt, parentRect);
		if (!mouseInGrid) return;

		gridLayout.value.dragEvent(
			'dragend',
			component.id,
			dragItem.value.x,
			dragItem.value.y,
			dragItem.value.h,
			dragItem.value.w
		);
		gridData.value = gridData.value.filter(
			(item) => item.i !== component.id
		);
		gridData.value.push({
			x: dragItem.value.x,
			y: dragItem.value.y,
			w: dragItem.value.w,
			h: dragItem.value.h,
			i: component.id
		});
		gridLayout.value.dragEvent(
			'dragend',
			component.id,
			dragItem.value.x,
			dragItem.value.y,
			dragItem.value.h,
			dragItem.value.w
		);

		const item = gridLayout.value.getItem(component.id);
		dragItem.value = { x: -1, y: -1, w: 1, h: 1, i: '' };

		if (!item) return;
		try {
			item.wrapper.style.display = '';
		} catch (e) {
			//
		}
	}

	onMounted(() => {
		vueBus.$emitter.on(
			DASHBOARD_CONSTRUCTOR_EVENTS.DRAG_COMPONENT,
			onComponentDrag
		);

		vueBus.$emitter.on(
			DASHBOARD_CONSTRUCTOR_EVENTS.DRAGEND_COMPONENT,
			onComponentDragend
		);
	});

	onBeforeUnmount(() => {
		vueBus.$emitter.off(
			DASHBOARD_CONSTRUCTOR_EVENTS.DRAG_COMPONENT,
			onComponentDrag
		);

		vueBus.$emitter.off(
			DASHBOARD_CONSTRUCTOR_EVENTS.DRAGEND_COMPONENT,
			onComponentDragend
		);
	});

	watch(
		() => rows.value,
		(val) => {
			if (size(val)) {
				const updatedGridData = transformLayoutRowsToGridData(val);
				if (
					JSON.stringify(updatedGridData) !==
					JSON.stringify(gridData.value)
				) {
					gridData.value = updatedGridData;
				}
			}
		},
		{ immediate: true, deep: true }
	);

	return {
		vueBus,
		wrapper,
		gridLayout,
		gridData,
		columnsCount,
		rowHeight,
		rowHeightCss,
		rowsCount,
		components,
		componentsLabels,
		isRowEmpty,
		isRowAddable,
		updateDashboard,
		insertRow,
		deleteRow,
		removeComponent,
		runEditComponent
	};
}
