<template>
	<div class="table" :class="{'readonly': isReadonly}">
		<div class="table-row t_header" :style="{ gridTemplateColumns: colls }">
			<div v-if="isActions">
				<FmCheckbox/>
			</div>
			<div v-if="isActions" class="table-cell"></div>
			<div
				class="table-cell font-weight-bold"
				v-for="(header, index) in headers"
				:key="index"
			>
				<button
					class="table-cell-btn"
					:disabled="isDisabled"
					@click="sortTable(index)"
				>
					<span class="header-text">{{ header }}</span>

					<div v-if="index == sortColumn"
						 class="arrow"
						 v-bind:class="ascending ? 'arrow_up' : 'arrow_down'"></div>
				</button>
			</div>
		</div>

		<div
			class="table-row"
			:class="{
				active: active == index,
				selectable: !isReadonly && active !== undefined,
				disabled: isDisabled,
			}"
			:style="{ gridTemplateColumns: colls }"
			v-for="(row, index) in items"
			:key="index"
		>
			<div class="center" v-if="isActions">
				<FmCheckbox/>
			</div>

			<div class="table-cell no_collapsed" v-if="$slots.actions">
				<slot name="actions" :index="index"/>
			</div>
			<div
				class="table-cell"
				v-for="(item, indexRow) in row"
				:key="indexRow"
			>
				<button
					:disabled="isDisabled"
					class="table-cell-btn"
					@click="
						() => {
							if (cb) cb(index, indexRow)
						}
					"
					@click.right.prevent.stop="
						() => {
							if (rightClickCallback) rightClickCallback(index, indexRow)
						}
					"
				>
					<FmLoader v-if="item === null"/>

					<template v-else-if="typeof item == 'object'">

						<div
							class="overflow-hidden text-overflow-ellipsis"
							v-fm-tooltip="item.value"
						>
							<NuxtLink
								v-if="item.link"
								class="link dib"
								:to="item.link"

							>{{ item.value }}
							</NuxtLink>

							<template v-else>{{ item.value }}</template>
						</div>

					</template>

					<template v-else>
						<div
							class="overflow-hidden text-overflow-ellipsis"
							v-fm-tooltip="item"
						>{{ item === '' ? '-' : item }}
						</div>
					</template>
				</button>
			</div>
		</div>
	</div>
	<div class="center p-16" v-if="status === 'loading'">
		<FmLoader/>
	</div>
</template>

<script setup>
let props = defineProps({
	headers: {
		type: Array,
	},
	items: {
		type: Array,
	},
	colls: {
		type: String,
	},
	cb: {
		type: Function,
	},
	rightClickCallback: {
		type: Function,
	},
	status: {
		// done, loading, fail
		type: String,
		default: 'done',
	},
	active: {
		type: Number,
	},
	isActions: {
		type: Boolean,
	},
	isDisabled: Boolean,
	isReadonly: Boolean,
})

let sortColumn = ref(-1)
let ascending = ref(true)


const sortTable = (col_index) => {
  var col = Object.keys(props.items[0])[col_index];

  if (sortColumn.value === col_index) {
    ascending.value = !ascending.value;
  } else {
    ascending.value = true;
    sortColumn.value = col_index;
  }

  props.items.sort(function(a, b) {
    let valueA = a[col].replace("%","");
    let valueB = b[col].replace("%","");

	console.log(valueA, valueB)

    if (!isNaN(valueA) && !isNaN(valueB)){
      valueA = parseFloat(valueA) || 0;
	  valueB = parseFloat(valueB) || 0;
    }

    if (valueA > valueB) {
      return ascending.value ? 1 : -1;
    } else if (valueA < valueB) {
      return ascending.value ? -1 : 1;
    }

    return 0;
  });
}

</script>

<style lang="scss" scoped>
.table {
	border: 1px solid $border;
	width: 100%;
	font-size: 14px;
}

.table.readonly {
  .table-row {

	&:not(.t_header) {

	  .table-cell .table-cell-btn {
		cursor: default;
	  }

	}

  }
}

.table-row {
	display: grid;
	align-items: center;
	background: #fff;
	height: 36px;
	border-bottom: 1px solid $border;
	line-height: 36px;
	transition: outline 0.1s;
	outline: solid transparent;

	&:not(.disabled).selectable {
		cursor: pointer;

		&:not(.active):hover {
			background: #fac87863;
		}
	}

	&.active {
		background: #fac87863;
	}

	&.t_header {
		background: #f2f2f2;
		height: 50px;
		line-height: 50px;
		font-weight: 500;
	}
}

.table-cell {
	height: inherit;
	line-height: inherit;

	&:not(.no_collapsed) {
		overflow: hidden;

		.table-cell-btn {
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	& + & {
		border-left: 1px solid $border;
	}

	&.disabled {
		background: $main-darken-2;
	}
}

.table-cell-btn {
	display: block;
	width: 100%;
	height: 100%;
	padding: 0 14px;
	// inherit from .table-cell
	text-align: inherit;
	font-size: inherit;
	/*display: flex;
	justify-content: space-between;
	align-items: center;*/
	white-space: nowrap;

	&:not([disabled]):hover {
		.header-text {
			color: $text-lighten;
		}
	}
}

.link {
	text-decoration: underline;
}

.arrow {
	float: right;
	width: 12px;
	height: 15px;
	background-repeat: no-repeat;
	background-size: contain;
	background-position-y: bottom;
}
.arrow_down {
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAaCAYAAABPY4eKAAAAAXNSR0IArs4c6QAAAvlJREFUSA29Vk1PGlEUHQaiiewslpUJiyYs2yb9AyRuJGm7c0VJoFXSX9A0sSZN04ULF12YEBQDhMCuSZOm1FhTiLY2Rky0QPlQBLRUsICoIN/0PCsGyox26NC3eTNn3r3n3TvnvvsE1PkwGo3yUqkkEQqFgw2Mz7lWqwng7ztN06mxsTEv8U0Aam5u7r5EInkplUol/f391wAJCc7nEAgE9Uwmkzo4OPiJMa1Wq6cFs7Ozt0H6RqlUDmJXfPIx+qrX69Ti4mIyHA5r6Wq1egND+j+IyW6QAUoul18XiUTDNHaSyGazKcZtdgk8wqhUKh9o/OMvsVgsfHJy0iWqVrcQNRUMBnd6enqc9MjISAmRP3e73T9al3XnbWNjIw2+KY1Gc3imsNHR0YV4PP5+d3e32h3K316TySQFoX2WyWR2glzIO5fLTSD6IElLNwbqnFpbWyO/96lCoai0cZjN5kfYQAYi5H34fL6cxWIZbya9iJyAhULBHAqFVlMpfsV/fHxMeb3er+Vy+VUzeduzwWC45XA4dlD/vEXvdDrj8DvURsYEWK3WF4FA4JQP9mg0WrHZbEYmnpa0NxYgPVObm5teiLABdTQT8a6vrwdRWhOcHMzMzCiXlpb2/yV6qDttMpkeshEzRk4Wo/bfoe4X9vb2amzGl+HoXNT29vZqsVi0sK1jJScG+Xx+HGkL4Tew2TPi5zUdQQt9otPpuBk3e0TaHmMDh1zS7/f780S0zX6Yni+NnBj09fUZUfvudDrNZN+GkQbl8Xi8RLRtHzsB9Hr9nfn5+SjSeWUCXC7XPq5kw53wsNogjZNohYXL2EljstvtrAL70/mVaW8Y4OidRO1/gwgbUMvcqGmcDc9aPvD1gnTeQ+0nmaInokRj0nHh+uvIiVOtVvt2a2vLv7Ky0tL3cRTXIcpPAwMDpq6R4/JXE4vFQ5FI5CN+QTaRSFCYc8vLy1l0rge4ARe5kJ/d27kYkLXoy2Jo4C7K8CZOsEBvb+9rlUp1xNXPL7v3IDwxvPD6AAAAAElFTkSuQmCC')
}
.arrow_up {
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAaCAYAAACgoey0AAAAAXNSR0IArs4c6QAAAwpJREFUSA21Vt1PUmEYP4dvkQ8JFMwtBRocWAkDbiqXrUWXzU1rrTt0bdVqXbb1tbW16C9IBUSmm27cODdneoXjputa6069qwuW6IIBIdLvdaF4OAcOiGeDc87zPs/vd57P96WpFq7p6enbGo1mjKZpeTabjU1MTCRagGnOZHFxcXxtbe1XKpUq7+zslJeXl//Mz8+Hy+Uy3RxSE9qTk5M3otFooVQqgef4Wl9f343FYoEmoISrxuNxFX5f9vb2jhn/PxUKhfLS0tIPfFifUESRUMV8Pv/M6XReRm5rTGQyGeXxeGxYe1ezeBpBOBx2rKysbO7v79d4Wy3Y2Nj4GQqFbgnhaugxwiuGJx99Pp9FLBbXxYTXvTqd7v3MzIy6riIWGxJnMpl7AwMD14xGYyMsSq1WUyQdUqn0eSPlusQIsbGrq+vl4OCgvhFQZd1utyv1en0gEolcqsi47nWJlUrlG5fLZVcoFFy2nDKSDpIWlUoVTCQSEk4lCHmJMZ2GTCbTiMVikfIZ88l7enoos9l8dXt7+z6fDicxSJUokqDX6xXcl2wCROoc0vQCWL3sNfLOSdzR0fHY4XC4tVotl40gmVwup9xuN4OQv+UyqCFGH9rg7SOGYVRcBs3IEG4J0nVnamrqOtvuBDGGgQg9+wHFcVEi4a0LNkbdd6TrPKo8ODc311mteIIYjT/a398/jK+s1jnVM0kXoufCFvq0GuiIGEVgQIhfoygM1QrteEa9dAL7ITiYCt4RMabOK5AyKKzKWtvupLcRciu8D5J0EuDDPyT/Snd39yh6VtY2NhYQSR9G79Ds7OxdskRjEyAufvb7/cPoO5Z6e1+xtVKrq6vfcFzyi/A3ZrPZ3GdNSlwgo5ekE4X2RIQGf2C1WlufFE0GBeGWYQ8YERWLxQtnUVB830MKLZfL9RHir8lkssCn2G751tZWEWe03zTKm15YWPiEiXXTYDB0Ig/t7yd8PRws4EicwWHxO4jHD8/C5HiTTqd1BwcHFozKU89origB+y/kmzgYpgOBQP4fGmUiZmJ+WNgAAAAASUVORK5CYII=')
}

</style>
