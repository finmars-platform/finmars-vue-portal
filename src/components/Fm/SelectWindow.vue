<template>
	<div class="flex sp aic">
		<div class="available">
			<div class="header">Available</div>

			<div class="block">
				<div class="search">
					<BaseInput class="m-b-0"
						label="Search"
						v-model="availableSearch"
					/>
				</div>
				<div class="list">
					<div class="list_item"
						v-for="item in availableList"
						:key="item.name"
						:class="{selected: item.selected}"
						@click="item.selected = !item.selected"
					>
						{{ item[item_title] }}
					</div>
				</div>
			</div>
		</div>

		<div class="actions">
			<FmIcon btn icon="chevron_right" @click="addItem()" />
			<FmIcon btn icon="keyboard_double_arrow_right" @click="addItem('all')" />

			<FmIcon btn icon="chevron_left" @click="removeItem()" />
			<FmIcon btn icon="keyboard_double_arrow_left" @click="removeItem('all')" />
		</div>

		<div class="selected">
			<div class="header">Selected</div>

			<div class="block">
				<div class="search">
					<BaseInput class="m-b-0"
						label="Search"
						v-model="selectedSearch"
					/>
				</div>
				<div class="list">
					<div class="list_item"
						v-for="item in selectedList"
						:key="item.name"
						:class="{selected: item.selected}"
						@click="item.selected = !item.selected"
					>
						{{ item[item_title] }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		items: Array,
		modelValue: [String, Array],
		item_title: {
			type: String,
			default: 'user_code'
		}
	})
	let emit = defineEmits(['update:modelValue'])

	let isOpen = ref(false)
	let availableSearch = ref('')
	let selectedSearch = ref('')

	let modelValueArray = props.modelValue

	if ( typeof modelValueArray == 'string' ) modelValueArray = modelValueArray.split(',')

	let selectedFilter = reactive( new Set( modelValueArray ) )

	let selectedList  = computed(() => {
		if ( !props.items.length ) return []

		return props.items.filter(
			item => {
				let elem = item[props.item_title]

				return selectedFilter.has(elem) &&
					elem.toLocaleLowerCase().includes( selectedSearch.value.toLocaleLowerCase() )
			}
		)
	})

	let availableList = computed(() => {
		if ( !props.items.length ) return []

		return props.items.filter(
			item => {
				let elem = item[props.item_title]

				return !selectedFilter.has(elem) &&
					elem.toLocaleLowerCase().includes(availableSearch.value.toLocaleLowerCase())
			}
		)
	})

	function addItem( all ) {
		let items = availableList.value
			.filter(item => item.selected || !!all)
			.map( item => {
				item.selected = false
				return item[props.item_title]
			})
		items.forEach( item => selectedFilter.add(item) )
		console.log('selectedFilter:', selectedList)

		emit('update:modelValue', [...selectedList.value].map((item) => item.id ) )
	}
	function removeItem( all ) {
		let items = selectedList.value
			.filter(item => item.selected || !!all)
			.map( item => {
				item.selected = false
				return item[props.item_title]
			})

		items.forEach( item => selectedFilter.delete(item) )
		emit('update:modelValue', [...selectedList.value].map((item) => item.id ) )
	}

</script>

<style lang="scss" scoped>
	.ms_wrap {
		cursor: pointer;
	}
	.fm_chip {
		background: $main-darken-2;
		padding: 3px 8px;
		border-radius: 16px;
		min-width: 30px;
		text-align: center;

		& + & {
			margin-left: 5px;
		}
	}
	.header {
		font-size: 20px;
		margin-bottom: 8px;
	}
	.block {
		min-width: 400px;
	}
	.list {
		border-bottom: 1px solid $border-darken;
		border-left: 1px solid $border-darken;
		border-right: 1px solid $border-darken;
		padding: 10px 0;
		overflow: auto;
		height: 270px;
	}
	.list_item {
		padding: 7px 14px;
		cursor: pointer;

		&.selected {
			background: #eee;
		}

		& + & {
			border-top: 1px solid #fff;
		}
	}
	.search {
	}
	.actions {
		padding: 0 10px;
	}
</style>
