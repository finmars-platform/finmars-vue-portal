<template>
	<div>
		<v-text-field
			:label="title"
			:placeholder="title"
			variant="outlined"
			density="compact"
			prepend-inner-icon="mdi-menu"
			@click="isOpen = true"
			modelValue=" "
		>
			<v-chip class="mb-1 mr-1"
				v-for="(item, index) in selectedFilter"
				:key="index"
				density="comfortable"
				@click="isOpen = true"
			>
				{{ item }}
			</v-chip>
		</v-text-field>

		<v-dialog v-model="isOpen">
			<v-card>
				<v-card-content class="d-flex space-between align-center">
					<div class="available">
						<div class="header">Available</div>

						<div class="block">
							<div class="search">
								<v-text-field class="rounded-0"
									label="Search"
									placeholder="Search"
									variant="outlined"
									density="compact"
									prepend-inner-icon="mdi-magnify"
									hide-details="auto"
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
									{{ item.name }}
								</div>
							</div>
						</div>
					</div>

					<div class="actions">
						<v-btn class="d-block" color="#737373" variant="text" icon="mdi-chevron-right" density="comfortable" @click="addItem()" />
						<v-btn class="d-block" color="#737373" variant="text" icon="mdi-chevron-double-right" density="comfortable" @click="addItem('all')" />

						<v-btn class="d-block" color="#737373" variant="text" icon="mdi-chevron-left" density="comfortable" @click="removeItem()" />
						<v-btn class="d-block" color="#737373" variant="text" icon="mdi-chevron-double-left" density="comfortable" @click="removeItem('all')" />
					</div>

					<div class="selected">
						<div class="header">Selected</div>

						<div class="block">
							<div class="search">
								<v-text-field class="rounded-0"
									label="Search"
									placeholder="Search"
									variant="outlined"
									density="compact"
									prepend-inner-icon="mdi-magnify"
									hide-details="auto"
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
									{{ item.name }}
								</div>
							</div>
						</div>
					</div>
				</v-card-content>
				<v-card-actions class="space-between px-4">
					<v-btn @click="isOpen = false">cancel</v-btn>
					<v-btn color="primary" variant="contained" @click="save()">save</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
	let props = defineProps([
		'items', 'modelValue', 'title'
	])
	let emit = defineEmits(['update:modelValue'])

	let isOpen = ref(false)
	let availableSearch = ref('')
	let selectedSearch = ref('')

	let selectedFilter  = reactive( new Set( props.modelValue.split(',') ) )

	let selectedList  = computed(() => props.items
		.filter( item => selectedFilter.has(item.user_code) &&
		item.user_code.toLocaleLowerCase().includes(selectedSearch.value.toLocaleLowerCase()) ))

	let availableList = computed(() => props.items
		.filter( item => !selectedFilter.has(item.user_code) &&
		item.user_code.toLocaleLowerCase().includes(availableSearch.value.toLocaleLowerCase()) ))

	function save() {
		emit('update:modelValue', [...selectedFilter].join(',') )

		isOpen.value = false
	}
	function addItem( all ) {
		let items = availableList.value
			.filter(item => item.selected || !!all)
			.map( item => {
				item.selected = false
				return item.user_code
			})
		items.forEach( item => selectedFilter.add(item) )
	}
	function removeItem( all ) {
		let items = selectedList.value
			.filter(item => item.selected || !!all)
			.map( item => {
				item.selected = false
				return item.user_code
			})

		items.forEach( item => selectedFilter.delete(item) )
	}

</script>

<style lang="scss">
	.header {
		font-size: 20px;
		margin-bottom: 8px;
	}
	.block {
		min-width: 400px;
	}
	.list {
		border-bottom: 1px solid $border;
		border-left: 1px solid $border;
		border-right: 1px solid $border;
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
