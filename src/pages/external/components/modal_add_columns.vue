<template>
	<div class="modal">
		<div class="modal_top flex aic sb">
			<div class="flex aic">
				<div class="modal_head">Add column</div>

				<BaseInput type="text"
					class="bi_no_borders bi_border_bottom m-l-20"
					placeholder="Search"
					:modelValue="searchParam"
					@update:modelValue="search"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
				</BaseInput>
			</div>

			<FmBtn type="iconBtn" icon="close" @click="cancel" />
		</div>

		<div class="modal_content scrollable">
			<div
				class="fm_tabs sb"
				v-if="isAdvanced"
			>
				<div class="flex">
					<div
						class="fm_tabs_item"
						:class="{active: tab == 'favorites'}"
						@click="tab = 'favorites'"
					>
						Favorites
					</div>

					<div
						class="fm_tabs_item"
						:class="{active: tab == 'advanced'}"
						@click="tab = 'advanced'"
					>
						Advanced
					</div>
				</div>

				<div
					class="fm_tabs_item flex aic"
					:class="{active: tab == 'selected'}"
					@click="tab = 'selected'"
				>
					Selected
					<div class="select_count">
						{{  selectedColumns.length }}
					</div>
				</div>
			</div>

			<div :class="[isAdvanced && tab == 'advanced' ? 'advanced' : '', 'content_grid']">
				<div class="content_grid_left" v-show="isAdvanced && tab == 'advanced'">
					<ul class="fm_list">
						<li
							class="fm_list_item attr_item"
							:class="{active: activeTree == i}"
							v-for="(item, i) in advancedColumns"
							@click="activeTree = i"
						>
							{{ item.name }}
						</li>
					</ul>
				</div>

				<div class="content_grid_main">
					<div class="fm_list" v-show="!isAdvanced || tab == 'favorites'">
						<div
							class="fm_list_item attr_item flex aic sb"
							:class="{active: activeRow == item.key}"
							v-for="(item, i) in favoritesTab"
							@click="activeRow = item.key"
							@dblclick="selected[item.key] = !selected[item.key]"
						>
							<div class="flex aic">
								<FmCheckbox
									v-model="selected[item.key]"
									@click.stop=""
								/>

								<div v-html="favList[item.key]"></div>
							</div>
						</div>
					</div>

					<div class="fm_list" v-show="tab == 'selected'">
						<li class="fm_list_item attr_item"
							@click="isOpenSelect.current = !isOpenSelect.current"
						>
							<FmIcon class="expand" :icon="isOpenSelect.current ? 'expand_less' : 'expand_more'" />
							<div>Current</div>
						</li>
						<div v-show="isOpenSelect.current">
							<div
								class="fm_list_item attr_item flex aic sb "
								:class="{active: activeRow == item.key}"
								v-for="(item, i) in selectedOld"
								:key="item.key"
								@click="activeRow = item.key"
							>
								<div class="flex aic expand_wrap">
									<FmCheckbox
										disabled
									/>

									<div class="select_old" v-html="`[${item.name}]`"></div>
								</div>
							</div>
						</div>

						<li class="fm_list_item attr_item"
							@click="isOpenSelect.new = !isOpenSelect.new"
						>
							<FmIcon class="expand" :icon="isOpenSelect.new ? 'expand_less' : 'expand_more'" />
							<div>New</div>
						</li>
						<div v-show="isOpenSelect.new">
							<div
								class="fm_list_item attr_item flex aic sb"
								:class="{active: activeRow == item.key}"
								v-for="(item, i) in selectedColumns"
								:key="item.key"
								@click="activeRow = item.key"
								@dblclick="selected[item.key] = !selected[item.key]"
							>
								<div class="flex aic expand_wrap">
									<FmCheckbox
										v-model="selected[item.key]"
										@click.stop="() => {}"
									/>

									<div v-html="item.name"></div>
								</div>
							</div>
						</div>
					</div>

					<ul class="fm_list" v-show="tab == 'advanced'">
						<template
							v-for="obj in advancedColumnActive"
						>
							<div
								v-if="obj.key"
								class="fm_list_item attr_item flex aic sb"
								:class="{active: activeRow == obj.key}"
								@click="activeRow = obj.key"
								@dblclick="selected[obj.key] = !selected[obj.key]"
							>
								<div class="flex aic">
									<FmCheckbox
										v-model="selected[obj.key]"
										@click.stop=""
									/>

									<div v-html="obj.short_name"></div>
								</div>

								<FmIcon
									size="20"
									primary
									:class="['favorites', {active: !!favList[obj.key]}]"
									:icon="favList[obj.key] ? 'star' : 'star_outlined'"
									@click="favList[obj.key] = obj.name"
								/>
							</div>

							<div v-else>
								<li class="fm_list_item attr_item" @click="obj.isOpen = !obj.isOpen">
									<FmIcon class="expand" icon="expand_more" />
									<div v-html="obj.name"></div>
								</li>

								<template v-if="obj.isOpen">
									<div
										v-for="(val, prop) in obj.children"
										class="fm_list_item attr_item flex aic sb"
										:class="{active: activeRow == val.key}"
										@click="activeRow = val.key"
										@dblclick="selected[val.key] = !selected[val.key]"
									>
										<div class="flex aic expand_wrap">
											<FmCheckbox
												v-model="selected[val.key]"
												@click.stop=""
											/>

											<div v-html="val.short_name"></div>
										</div>

										<FmIcon
											size="20"
											primary
											:class="['favorites', {active: !!favList[val.key]}]"
											:icon="favList[val.key] ? 'star' : 'star_outlined'"
											@click="favList[val.key] = val.name"
										/>
									</div>
								</template>

							</div>
						</template>
					</ul>
				</div>

				<div class="content_grid_right">
					<div class="flex aic" v-if="tab != 'advanced'">
						<div class="desc_title" v-if="!isEdit">{{ attrInfo.name }}</div>
						<BaseInput v-else v-model="favList[attrInfo.key]" />

						<FmIcon v-if="!isEdit" size="20" primary icon="edit" @click="isEdit = true" />
						<FmIcon v-else primary icon="save" @click="isEdit = false" />
					</div>
					<div class="desc_subtitle" v-if="tab != 'advanced'">[{{ attrInfo.path }}]</div>
					<div class="desc_about">{{ attrInfo.info }}</div>
				</div>
			</div>
		</div>

		<div class="modal_bottom flex sb">
			<div class="flex aic">
				<FmBtn
					type="text"
					@click="cancel()"
				>
					Cancel
				</FmBtn>

				<FmIcon
					class="m-l-24"
					primary
					:icon="isAdvanced ? 'lock_open' : 'lock'"
					@click="isAdvanced = !isAdvanced"
				/>
			</div>

			<FmBtn @click="cancel()">OK</FmBtn>
		</div>
	</div>
</template>

<script setup>

	import attributes from '~/assets/data/attributes.js'

	definePageMeta({
		layout: 'auth'
	});

	let searchParam = ref('')
	let isAdvanced = ref(false)
	let tab = ref('favorites')
	let activeRow = ref('')
	let activeTree = ref(0)
	let isEdit = ref(false)
	let isOpenSelect = reactive({
		current: true,
		new: true
	})

	const formatedAttrs = attributes.map(item => {
		item.name = item.name.replaceAll('. ', ' / ')

		return item
	}).sort((a, b) => {
		let compareFolder = b.name.match(/\//g).length - a.name.match(/\//g).length

		if ( compareFolder != 0 ) return compareFolder

		return a.name.localeCompare(b.name)
	})

	const selectedOldProp = ['account.attributes.asset_type', 'account.attributes.account_type', 'account.attributes.asset_class']

	let selectedOld = formatedAttrs.filter(item => selectedOldProp.includes(item.key))

	activeRow.value = formatedAttrs[0].key

	// let selectedColumns = ref([])
	let selected = reactive({})
	const selectedColumns = computed(() => {
		console.log('selected:', selected)
		return filteredColumns.value.filter((item) => selected[item.key])
	})
	function filterSelected() {
		selectedColumns.value = filteredColumns.value.filter((item) => selected.value[item.key])
	}

	const filteredColumns = computed(() => {
		if ( !searchParam.value ) return formatedAttrs
			.map((item) => ({ name: item.name, key: item.key }) )

		let terms = searchParam.value.split(/\s*(?:\s|\/)\s*/)
		let result = formatedAttrs

		terms.forEach((term, i) => {
			term = term.toLowerCase()

			result = result
				.filter( (item) => item.name.toLowerCase().includes(term) )
		})

		result = result.map(item => {
			let name = item.name

			name = name.replace(
				new RegExp(`(${terms.join('|')})`, 'gi'),
				(match) => `<span class="c_primary">${match}</span>`
			)

			return reactive({ name, key: item.key, checked: false })
		})

		return result
	})
	const advancedColumnActive = computed(() => {
		let result = []

		if ( advancedColumns.value[activeTree.value] )
			result = advancedColumns.value[activeTree.value].children

		return result
	})
	const advancedColumns = computed(() => {
		let tree = {}

		for (let attr of filteredColumns.value) {
			const parts = attr.name.split(" / ")
			parts[0] = parts[0].replace(/( |<([^>]+)>)/ig, "")

			let node = tree;

			for  (let i = 0; i < parts.length; i++ ) {
				let part = parts[i]

				if (!node[part]) {
					if ( parts.length - 1 == i ) {
						attr.short_name = part
						node[part] = attr

					} else {

						node[part] = {}

						node[part].isOpen = false
					}
				}
				node = node[part]
			}
		}

		tree = iterateNestedObject(tree)

		return tree
	})
	function iterateNestedObject( obj ) {
		let list = []

		for (let key in obj) {
			let newObj = reactive({
				name: key,
				children: []
			})

			if ( obj[key].isOpen === false) {
				newObj.isOpen = ref(false)
				newObj.children = iterateNestedObject(obj[key])

			} else {

				newObj = obj[key]
			}

			if ( key != 'isOpen')
				list.push(newObj)
		}

		return list
	}
	let favList = reactive({
		'pricing_currency.reference_for_pricing': 'test'
	})
	let attrMetas = reactive({
		key: 'pricing_currency.reference_for_pricing',
		name: 'test',
		description: 'Info'
	})
	const favoritesTab = computed(() => {
		let attrs = formatedAttrs.filter(item => favList[item.key] != undefined )
		if ( !attrs ) return {}

		return attrs
	})
	const attrInfo = computed(() => {
		let attr = formatedAttrs.find(item => item.key == activeRow.value)
		if ( !attr ) return {}

		return {
			name: favList[attr.key] || attr.name,
			path: attr.name,
			key: attr.key,
			info: 'No info',
		}
	})

	let searchTimer;

	function search( value ) {
		clearTimeout(searchTimer)

		searchTimer = setTimeout(() => {
			searchParam.value = value.trim()
		}, 300)
	}

	function cancel() {}
</script>

<style lang="scss" scoped>
	.modal_top {
		height: 50px;
		padding: 0 20px;
		border-bottom: 1px solid $border;
	}
	.modal_content {
		overflow: auto;
		height: calc(100vh - 106px);
		min-width: 400px; // so that FmInputEntityNames could fit in
	}
	.modal_bottom {
		position: absolute;
		bottom: 0;
		width: 100%;
		border-top: 1px solid $border;
		padding: 10px 20px;
	}
	.modal {
		position: relative;
		background: #fff;
		width: 100%;
		height: 100vh;
		max-height: 100%;
		border-radius: 4px;
		z-index: 2;

		.close {
			cursor: pointer;

			path {
				transition: 0.3s;
			}

			&:hover path {
				stroke: $primary !important;
			}
		}

		&_head {
			font-weight: 500;
			font-size: 20px;
		}
	}
	.select_count {
		background: $primary;
		width: 18px;
		height: 18px;
		line-height: 18px;
		text-align: center;
		color: #fff;
		margin-left: 11px;
		font-size: 12px;
		font-weight: 400;
		border-radius: 2px;
	}
	.content_grid {
		display: grid;
		grid-template-columns: 1fr 200px;
		height: 100%;

		&.advanced {
			grid-template-columns: 160px 1fr 200px;
			height: calc(100% - 48px);
		}

		&_left {
			border-right: 1px solid $border;
			height: 100%;
			overflow: auto;
			padding: 9px 0;
		}
		&_main {
			height: 100%;
			overflow: auto;
			padding: 10px 0;
		}
		&_right {
			border-left: 1px solid $border;
			height: 100%;
			overflow: auto;
		}
	}

	.attr_item {
		padding: 0 20px;
		height: 26px;
		user-select: none;
		border: none;
		&.active {
			background: $primary-lighten-2;
			.favorites {
				opacity: 1;
			}
		}
		&:hover .favorites {
			opacity: 1;
		}
	}

	.desc_title {
		padding: 10px 13px;
		border-bottom: 1px solid $border;
		word-wrap: break-word;
	}
	.desc_subtitle {
		padding: 10px 13px;
		background: $main;
		border-bottom: 1px solid $border;
		color: $text-lighten;
		word-wrap: break-word;
	}
	.desc_about {
		padding: 10px 13px;
		color: $text-lighten;
	}
	.favorites {
		opacity: 0;
		transition: 0.3s;

		&.active {
			opacity: 1;
		}
	}
	.expand_wrap {
		padding-left: 31px;
	}
	.expand {
		margin-left: -2px;
		margin-right: 9px;
	}
	.select_old {
		color: $text-lighten;
	}
</style>
