<template>
	<div>
		<BaseInput class="ms_wrap"
			:label="title"
			@click="isOpen = true"
			modelValue=" "
		>
			<template #button><FmIcon icon="menu" /></template>

			<div class="flex aic" style="height: inherit;">
				<div class="fm_chip"
					v-for="item in selectedList"
					:key="selectedList[item_id]"
				>
					{{ item[item_title] }}
				</div>
			</div>
		</BaseInput>

		<BaseModal :title="title" v-model="isOpen"
							 @cancel="isOpen = false">
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
								v-for="item in filteredSelList"
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

			<template #controls>
				<div class="flex sb">
					<FmBtn type="text" @click="isOpen = false">cancel</FmBtn>
					<FmBtn @click="save()">save</FmBtn>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup>
	let props = defineProps({
		items: {
			type: Array,
			default: []
		},
		/** Unique keys or objects of selected items as string separated by comma or inside an array  */
		modelValue: [String, Array],
		title: String,
		item_title: {
			type: String,
			default: 'name'
		},
		item_id: {
			type: String,
			default: 'user_code'
		}
	})
	let emit = defineEmits(['update:modelValue'])

	let isOpen = ref(false)
	let availableSearch = ref('')
	let selectedSearch = ref('')
	/**
	 * Set of unique ids of selected items
	 * @type {Ref<Set>}
	 * */
	let selectedFilter;
	/*let modelValueArray = props.modelValue

	if ( typeof modelValueArray == 'string' ) modelValueArray = modelValueArray.split(',')

	let selectedFilter = reactive( new Set( modelValueArray || [] ) )

	let selectedFilterNames  = computed(() => {
		return [...selectedFilter].map(
			id => {

				const selItem = props.items.find(item => item[props.item_id] === id);

				if (selItem) {
					return selItem[props.item_title];
				}

				return '';

			}
		)
	})*/

	function getSelectedFilter () {

		let modelValueArray = props.modelValue;

		if ( typeof modelValueArray === 'string' ) { // if selected items in form of string, convert them into array
			modelValueArray = modelValueArray.split(',');
		}

		if (Array.isArray(modelValueArray) && typeof modelValueArray[0] === 'object') {
			modelValueArray = modelValueArray.map(selItem => selItem[props.item_id]);
		}

		return new Set( modelValueArray || [] );

	}

	selectedFilter = ref(getSelectedFilter());

	let selectedList = computed(() => {

		return [...selectedFilter.value].map(selId => {

			let selItem = props.items.find(item => item[props.item_id] === selId);

			if (!selItem) {

				return {
					[props.item_id]: selId,
					[props.item_title]: 'Not found',
					error_data: {
						description: ''
					}
				}

			}

			return selItem;

		})

	});

	let filteredSelList = computed(() => {
		return selectedList.value.filter(selItem => {
			return selItem[props.item_title].toLocaleLowerCase().includes( selectedSearch.value.toLocaleLowerCase() )
		})
	});

	let availableList = computed(() => {
		// if ( !props.items.length ) return []

		 return props.items.filter(
				item => {

					let itemId = item[props.item_id];

					let itemPassesFilter = item[props.item_title].toLocaleLowerCase().includes(availableSearch.value.toLocaleLowerCase());

					return !selectedFilter.value.has(itemId) && itemPassesFilter;

				}
		)

	})

	function addItem( all ) {
		let items = availableList.value
			.filter(item => item.selected || !!all)
			.map( item => {
				item.selected = false
				return item[props.item_id]
			})
		items.forEach( item => selectedFilter.value.add(item) )
	}
	function removeItem( all ) {
		let items = selectedList.value
			.filter(item => item.selected || !!all)
			.map( item => {
				item.selected = false
				return item[props.item_id]
			})

		items.forEach( item => selectedFilter.value.delete(item) )
	}

	function save() {
		let result = [...selectedFilter.value]
		if ( typeof props.modelValue == 'String' ) result = result.join(',')

		emit('update:modelValue', result )

		isOpen.value = false
	}

	watch(
		() => props.modelValue,
		() => {
			selectedFilter.value = getSelectedFilter();
		}
	)

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
