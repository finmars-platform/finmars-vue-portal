<template>
	<div class="modal">
		<div class="modal_top flex aic sb">
			<div class="flex aic">
				<div class="modal_head">Add column</div>

				<BaseInput type="text"
					class="small bi_no_borders bi_border_bottom m-l-20"
					placeholder="Search"
					:modelValue="searchParam"
					@update:modelValue="search"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
					<template #rightBtn>
						<FmIcon size="16" icon="close" @click="searchParam = ''" />
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

			<div
				:class="[
					isAdvanced ? 'advanced_mod' : '',
					isAdvanced && tab == 'advanced' ? 'advanced' : '',
					'content_grid',
					{collapsed: isCollapsedInfo}
				]"
			>
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
							v-for="(item, i) in favoritesAttrs"
							@click="activeRow = item.key"
							@dblclick="item.disabled || (selected[item.key] = !selected[item.key])"
						>
							<div class="flex aic">
									<FmCheckbox
										v-model="selected[item.key]"
										:disabled="item.disabled"
										@click.stop=""
									/>


								<div v-html="item.name"></div>
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
										:disabled="obj.disabled"
										@click.stop=""
									/>

									<div v-html="advancedColumns[activeTree].name == 'All sections' ? obj.name : obj.short_name"></div>
								</div>

								<FmIcon
									size="20"
									primary
									:class="['favorites', {active: !!favList.find(o => o.key == obj.key)}]"
									:icon="favList.find(o => o.key == obj.key) ? 'star' : 'star_outlined'"
									@click="toggleFav(obj)"
								/>
							</div>

							<!-- Folder -->
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
												:disabled="val.disabled"
												@click.stop=""
											/>

											<div v-html="val.short_name"></div>
										</div>

										<FmIcon
											size="20"
											primary
											:class="['favorites', {active: !!favList.find(o => o.key == val.key)}]"
											:icon="favList.find(o => o.key == val.key) ? 'star' : 'star_outlined'"
											@click="toggleFav(val)"
										/>
									</div>
								</template>

							</div>
							<!-- endregion Folder -->
						</template>
					</ul>
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
				</div>

				<div class="content_grid_right" :class="{collapsed: isCollapsedInfo}">
					<div class="flex aic sb" v-if="tab != 'advanced'">
						<div class="desc_title flex aic">
							<span v-if="!isEdit">
								{{ attrInfo.name.length > 17 ? attrInfo.name.slice(0, 17) + '...' : attrInfo.name }}
							</span>
							<BaseInput
								class="small bi_no_margins m-t-0"
								v-model="infoEditable.name"
								v-else
							/>
						</div>

						<div class="desc_icons" v-if="tab == 'favorites'">
							<FmIcon
								v-if="!isEdit"
								size="20"
								primary
								icon="edit"
								@click="infoEditable.name = attrInfo.name, isEdit = true"
							/>

							<div class="flex" v-else>
								<FmIcon
									primary
									size="20"
									icon="save"
									@click="saveAttrInfo()"
								/>
								<FmIcon primary size="20" icon="close" @click="isEdit = false" />
							</div>
						</div>
					</div>

					<div class="desc_subtitle" v-if="tab != 'advanced'">
						<span v-if="attrInfo.path">[{{ attrInfo.path }}]</span>
					</div>

					<div class="desc_about">
						<span v-if="!isEdit">
							{{ attrInfo.info }}
						</span>
						<FmInputArea v-else v-model="infoEditable.description" />
					</div>

					<div class="collapse" :class="{active: isCollapsedInfo}" @click="isCollapsedInfo = !isCollapsedInfo">
						<FmIcon size="20" :icon="isCollapsedInfo ? 'chevron_left' : 'chevron_right'" @click="isEdit = false" />
					</div>
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

			<FmBtn @click="save()">OK</FmBtn>
		</div>
	</div>
</template>

<script setup>
import attributes from '~/assets/data/attributes.js'
	definePageMeta({
		layout: 'auth'
	});

	const iframeId = useRoute().query.iframeId

	let tab = ref('favorites')
	let searchParam = ref('')

	let activeRow = ref('')
	let activeTree = ref(0)

	let isAdvanced = ref(false)
	let isEdit = ref(false)
	let isCollapsedInfo = ref(false)
	let isOpenSelect = reactive({
		current: true,
		new: true
	})

	let attrsList = [];

	const onMessageStack = {
		'INITIALIZATION_SETTINGS_TRANSMISSION': init
	}

	onMounted(() => {
		window.addEventListener("message", onMessage)

		send({
			action: 'IFRAME_READY'
		})
	})

	let formatedAttrs = ref([])
	let selectedOld = []
	let favList = ref([/*{
		key: 'pricing_currency.reference_for_pricing',
		name: 'test',
		customName: 'test',
		customDescription: 'test',
	}*/])

	function init( data ) {

		attrsList = data.attributes;

		let attributes = attrsList
			.map(item => {
				item.name = item.name.replaceAll('. ', ' / ')

				return item
			})
			.sort((a, b) => {
				let compareFolder = b.name.match(/\//g).length - a.name.match(/\//g).length

				if ( compareFolder != 0 ) return compareFolder

				return a.name.localeCompare(b.name)
			})

		favList.value = data.favoriteAttributes
		selectedOld = attributes.filter(item => data.selectedAttributes.includes(item.key))

		formatedAttrs.value = attributes

		if ( formatedAttrs.value.length ) {
			activeRow.value = formatedAttrs.value[0].key;
		}

	}

	function onMessage(e) {
		// {
		// 	action: 'name',
		// 	iframeId: 'modal',
		// 	payload: {}
		// }
		if ( !e.data.action ) return false
		if ( onMessageStack[e.data.action] ) onMessageStack[e.data.action](e.data.payload)
		else console.log('e.data.action:', e.data)
	}
	function send( data, source = window.parent ) {

		data.iframeId = iframeId;

		let dataObj = Object.assign(data, {
			iframeId: iframeId,
		})

		source.postMessage( dataObj, "*" )

	}

	/** Disable attributes from property 'selectedAttributes' **/
	function markDisabledAttrs(attrData) {
		attrData.disabled = !!selectedOld.find(selAttr => selAttr.key === attrData.key);
	}

	let selected = reactive({})

	const favoritesAttrs = computed(() => {
		let attrs = favList.value

		// if ( !attrs ) return []

		attrs.forEach(markDisabledAttrs);

		if ( searchParam.value ) attrs = searchAndReplace( attrs )

		return attrs
	})


	const advancedColumns = computed(() => {
		let tree = {}
		let attrs = formatedAttrs.value
		let searchedAttrs

		// Search
		if ( searchParam.value ) {
			searchedAttrs = searchAndReplace( attrs )
			attrs = searchedAttrs
		}

		attrs.forEach(markDisabledAttrs);

		for ( let attr of attrs ) {
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

		attrs = toAttrsTree(tree)

		// Search
		if ( searchParam.value ) {
			attrs.unshift({
				name: 'All sections',
				children: searchedAttrs
			})
		}

		return attrs
	})
	function toAttrsTree( obj ) {
		let list = []

		for (let key in obj) {
			let newObj = reactive({
				name: key,
				children: []
			})

			if ( obj[key].isOpen === false) {
				newObj.isOpen = ref(false)
				newObj.children = toAttrsTree(obj[key])

			} else {

				newObj = obj[key]
			}

			if ( key != 'isOpen')
				list.push(newObj)
		}

		return list
	}
	const advancedColumnActive = computed(() => {
		let result = []

		if ( advancedColumns.value[activeTree.value] )
			result = advancedColumns.value[activeTree.value].children

		return result
	})


	const selectedColumns = computed(() => {
		let props = []

		for ( let prop in selected) {
			if ( !selected[prop] ) continue

			props.push(formatedAttrs.value.find((item) => item.key == prop ))
		}

		if ( searchParam.value ) props = searchAndReplace( props )

		return props
	})


	let infoEditable = reactive({
		name: '',
		key: '',
		description: ''
	})
	const attrInfo = computed(() => {
		let attr = formatedAttrs.value.find(item => item.key == activeRow.value)
		if ( !attr ) return {name: ''}

		let name = 'No name'

		if ( tab.value == 'favorites' ) {

			let fav = favList.value.find(o => o.key == attr.key)
			if (fav) name =  fav.customName || attr.name;

		}

		if ( tab.value == 'selected' ) {
			name = attr.customName || attr.name
		}

		return {
			name,
			path: attr.name,
			key: attr.key,
			info: attr.description || 'No info',
		}
	})
	function saveAttrInfo() {
		let fav = favList.value.find(o => o.key == infoEditable.key)

		fav.customName = infoEditable.name
		fav.customDescription = infoEditable.description

		isEdit.value = false

		send({
			action: 'SAVE_FAVORITE_ATTRIBUTES',
			payload: favList.value
		})
	}
	function toggleFav( attr ) {
		let fav = favList.value.find(o => o.key == attr.key)

		if ( fav ) {
			let index = favList.value.findIndex(o => o.key == attr.key)

			favList.value.slice(index, 1)

		} else {

			favList.value.push({
				key: attr.key,
				name: formatedAttrs.value.find(o => o.key == attr.key).name,
				customName: '',
				customDescription: '',
			})
		}

		send({
			action: 'SAVE_FAVORITE_ATTRIBUTES',
			payload: JSON.parse(JSON.stringify( favList.value )), // JSON.parse prevents error when postMessage tries to copy an array
		})
	}

	function searchAndReplace( attrs ) {
		let terms = searchParam.value.split(/\s*(?:\s|\/)\s*/)
		let result = attrs

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

			return { ...item, name }
		})

		return result
	}

	let searchTimer;
	function search( value ) {
		clearTimeout(searchTimer)

		searchTimer = setTimeout(() => {
			searchParam.value = value.trim()
		}, 300)
	}

	function cancel() {
		send({
			action: 'CANCEL_DIALOG'
		})
	}
	function save() {
		send({
			action: 'SAVE_DIALOG',
			payload: {
				selectedAttributes: Object.keys(selected)
			}
		})
	}
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

		&.collapsed {
			grid-template-columns: 1fr 32px;
		}
		&.advanced_mod {
			height: calc(100% - 48px);
		}

		&.advanced {
			grid-template-columns: 160px 1fr 200px;
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
			position: relative;
			border-left: 1px solid $border;
			height: 100%;
			// overflow: auto;

			&.collapsed {
				.desc_title, .desc_subtitle, .desc_about, .desc_icons {
					display: none;
				}
			}

			&:hover .collapse {
				opacity: 1;
				visibility: visible;
			}
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
		padding: 0 13px;
		height: 40px;
		word-wrap: break-word;
	}
	.desc_subtitle {
		padding: 10px 13px;
		background: $main;
		border-top: 1px solid $border;
		border-bottom: 1px solid $border;
		color: $text-lighten;
		word-wrap: break-word;
	}
	.desc_about {
		padding: 10px 13px;
		color: $text-lighten;
	}
	.collapse {
		position: absolute;
		top: 10px;
		left: -12px;
		border: 1px solid $border;
		background: #fff;
		border-radius: 50%;
		opacity: 0;
		visibility: hidden;
		transition: 0.3s;

		&.active {
			visibility: visible;
			opacity: 1;
		}
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
