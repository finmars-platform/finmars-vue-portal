<template>
	<BaseModal
		:title="data.title"
		no_padding
		@close="cancel()"
		style="height: 90vh; width: 800px"
	>
		<template #modalTop>
			<BaseInput
				type="text"
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
		</template>

		<div class="fm_tabs sb" v-if="isAdvanced">
			<div class="flex">
				<div
					class="fm_tabs_item"
					:class="{ active: tab == 'favorites' }"
					@click="tab = 'favorites'"
				>
					Favorites
				</div>

				<div
					class="fm_tabs_item"
					:class="{ active: tab == 'advanced' }"
					@click="tab = 'advanced'"
				>
					Advanced
				</div>
			</div>

			<div
				class="fm_tabs_item flex aic"
				:class="{ active: tab == 'selected' }"
				@click="tab = 'selected'"
			>
				Selected
				<div class="select_count">
					{{ selectedColumns.length }}
				</div>
			</div>
		</div>

		<div
			:class="[
				isAdvanced ? 'advanced_mod' : '',
				isAdvanced && tab == 'advanced' ? 'advanced' : '',
				'content_grid',
				{ collapsed: isCollapsedInfo },
			]"
		>
			<div class="content_grid_left" v-show="isAdvanced && tab == 'advanced'">
				<ul class="fm_list">
					<li
						class="fm_list_item attr_item"
						:class="{ active: activeTree == i }"
						v-for="(item, i) in advancedColumns"
						@click="activeTree = i"
					>
						<div v-html="item.name"></div>
					</li>
				</ul>
			</div>

			<div class="content_grid_main">
				<div class="fm_list" v-show="!isAdvanced || tab == 'favorites'">
					<div
						class="fm_list_item attr_item flex aic sb"
						:class="{ active: activeRow == item.key }"
						v-for="(item, i) in favoritesAttrs"
						@click="activeRow = item.key"
						@dblclick="
							item.disabled || (selected[item.key] = !selected[item.key])
						"
					>
						<div class="flex aic">
							<FmCheckbox
								v-model="selected[item.key]"
								:disabled="item.disabled"
								@click.stop=""
							/>

							<div v-html="item.name"></div>
						</div>

						<div class="flex aic">
							<FmIcon
								v-if="isAdvanced"
								size="20"
								primary
								:class="['favorites']"
								:icon="
									favList.find((o) => o.key == item.key)
										? 'star'
										: 'star_outlined'
								"
								@click="toggleFav(item)"
							/>

							<FmIcon
								v-if="item.error"
								size="20"
								primary
								icon="info"
								v-tooltip="{ content: item.error, theme: 'error-tooltip' }"
							/>
						</div>
					</div>
				</div>

				<ul class="fm_list" v-show="tab == 'advanced'">
					<template v-for="obj in advancedColumnActive">
						<div
							v-if="obj.key"
							class="fm_list_item attr_item flex aic sb"
							:class="{ active: activeRow == obj.key }"
							@click="activeRow = obj.key"
							@dblclick="selected[obj.key] = !selected[obj.key]"
						>
							<div class="flex aic">
								<FmCheckbox
									v-model="selected[obj.key]"
									:disabled="obj.disabled"
									@click.stop=""
								/>

								<div
									v-html="
										advancedColumns[activeTree].name == 'All sections'
											? obj.name
											: obj.short_name
									"
								></div>
							</div>

							<FmIcon
								size="20"
								primary
								:class="[
									'favorites',
									{ active: !!favList.find((o) => o.key == obj.key) },
								]"
								:icon="
									favList.find((o) => o.key == obj.key)
										? 'star'
										: 'star_outlined'
								"
								@click="toggleFav(obj)"
							/>
						</div>

						<!-- Folder -->
						<div v-else>
							<li
								class="fm_list_item attr_item"
								@click="obj.isOpen = !obj.isOpen"
							>
								<FmIcon class="expand" icon="expand_more" />
								<div v-html="obj.name"></div>
							</li>

							<template v-if="obj.isOpen">
								<div
									v-for="(val, prop) in obj.children"
									class="fm_list_item attr_item flex aic sb"
									:class="{ active: activeRow == val.key }"
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
										:class="[
											'favorites',
											{ active: !!favList.find((o) => o.key == val.key) },
										]"
										:icon="
											favList.find((o) => o.key == val.key)
												? 'star'
												: 'star_outlined'
										"
										@click="toggleFav(val)"
									/>
								</div>
							</template>
						</div>
						<!-- endregion Folder -->
					</template>
				</ul>
				<div class="fm_list" v-show="tab == 'selected'">
					<li
						class="fm_list_item attr_item"
						@click="isOpenSelect.current = !isOpenSelect.current"
					>
						<FmIcon
							class="expand"
							:icon="isOpenSelect.current ? 'expand_less' : 'expand_more'"
						/>
						<div>Current</div>
					</li>
					<div v-show="isOpenSelect.current">
						<div
							class="fm_list_item attr_item flex aic sb"
							:class="{ active: activeRow == item.key }"
							v-for="(item, i) in selectedOld"
							:key="item.key"
							@click="activeRow = item.key"
						>
							<div class="flex aic expand_wrap">
								<FmCheckbox :modelValue="true" disabled />

								<div class="select_old" v-html="`[${item.name}]`"></div>
							</div>
						</div>
					</div>

					<li
						class="fm_list_item attr_item"
						@click="isOpenSelect.new = !isOpenSelect.new"
					>
						<FmIcon
							class="expand"
							:icon="isOpenSelect.new ? 'expand_less' : 'expand_more'"
						/>
						<div>New</div>
					</li>
					<div v-show="isOpenSelect.new">
						<div
							class="fm_list_item attr_item flex aic sb"
							:class="{ active: activeRow == item.key }"
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

			<div class="content_grid_right" :class="{ collapsed: isCollapsedInfo }">
				<div class="flex aic sb" v-if="tab != 'advanced'">
					<div class="desc_title flex aic">
						<span v-if="!isEdit">
							{{
								attrInfo.name.length > 17
									? attrInfo.name.slice(0, 17) + '...'
									: attrInfo.name
							}}
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
							@click="editAttrInfo()"
						/>

						<div class="flex" v-else>
							<FmIcon primary size="20" icon="save" @click="saveAttrInfo()" />
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
					<FmInputArea v-else v-model="infoEditable.description" class="m-b-24" />
				</div>

				<div
					class="collapse"
					:class="{ active: isCollapsedInfo }"
					@click="isCollapsedInfo = !isCollapsedInfo"
				>
					<FmIcon
						size="20"
						:icon="isCollapsedInfo ? 'chevron_left' : 'chevron_right'"
						@click="isEdit = false"
					/>
				</div>
			</div>
		</div>

		<template #controls>
			<div class="flex aic sb">
				<div class="flex aic">
					<FmBtn type="text" @click="cancel()"> Cancel </FmBtn>

					<FmIcon
						class="m-l-24"
						primary
						:icon="isAdvanced ? 'lock_open' : 'lock'"
						@click="isAdvanced = !isAdvanced"
					/>
				</div>

				<FmBtn @click="save()">OK</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	// Angular
	import baseUrlService from '@/angular/shell/scripts/app/services/baseUrlService'
	import metaHelper from '@/angular/helpers/meta.helper'
	// VUE
	import attributes from '~/assets/data/attributes.js'
	import { useRegExpEscape } from '~/composables/useUtils'
	import usersServiceInst from '~~/src/angular/shell/scripts/app/services/usersService'

	const usersService = new usersServiceInst()
	// export default function (
	// 	$scope,
	// 	$mdDialog,
	// 	toastNotificationService,
	// 	usersService,
	// 	globalDataService,
	// 	data
	// ) {
	const props = defineProps(['payload'])
	const { data, resolve, reject } = props.payload

	// ANGULAR
	const foldersSeparatorRE = /\.\s(?=\S)/g // equals to ". " which have symbol after it

	let member = globalDataService.getMember()

	const contentType = data.contentType
	if (!data.contentType) throw new Error('Content type not specified.')

	const attributesList = data.attributes
	const layoutNames = data.layoutNames || {}

	const initSettings = {
		selectedAttributes: data.selectedAttributes || [],
		favoriteAttributes: member.data.favorites.attributes[contentType] || [],
	}

	if (data.title) initSettings.title = data.title
	initSettings.attributes = attributesList.map((attr) => {
		const attrData = {
			key: attr.key,
			name: processAttrName(attr),
			value_type: attr.value_type,
			// TODO get description for attributes from api
			description: '',
		}

		if (layoutNames[attr.key]) {
			attrData.layout_name = layoutNames[attr.key]
		}

		return attrData
	})

	// ANGULAR

	// START MODAL ADD COLUMNS
	let tab = ref('favorites')
	let searchParam = ref('')

	let activeRow = ref('')
	let activeTree = ref(0)

	let isAdvanced = ref(false)
	let isEdit = ref(false)
	let isCollapsedInfo = ref(false)
	let isOpenSelect = reactive({
		current: true,
		new: true,
	})

	let attrsList = []

	onMounted(() => {
		init(initSettings)
	})

	let formattedAttrs = ref([])
	let selectedOld = []
	let favList = ref([
		/*{
		key: 'pricing_currency.reference_for_pricing',
		name: 'test',
		customName: 'test',
		customDescription: 'test',
	}*/
	])

	const favoritesAttrs = computed(() => {
		let attrs = JSON.parse(JSON.stringify(favList.value))

		attrs = attrs.map(markDisabledAttrs)

		// mark favorites that refers to nonexistent attributes
		attrs = attrs.map((fAttr) => {
			const index = attrsList.findIndex((attr) => attr.key === fAttr.key)

			if (index < 0) {
				fAttr.error = 'Attribute does not exist in the Configuration'
				fAttr.disabled = true
			}

			return fAttr
		})
		// if ( !attrs ) return []
		if (searchParam.value) {
			attrs = searchAndReplace(attrs)
		} else {
			attrs = formatNames(attrs)
		}

		return attrs
	})

	const getAttrPriority = (attr) => {
		let priority = 3

		if (attr.key.includes('attributes.')) {
			priority = 1

			if (attr.key.includes('pricing_policy_')) {
				priority = 2
			}
		}

		return priority
	}

	function compareAttrFolders(a, b) {
		let priority =
			b.name.match(foldersSeparatorRE).length -
			a.name.match(foldersSeparatorRE).length

		if (priority === 0) {
			// attributes have the same folders quantity
			// place "User Attributes", "Pricing" after other folders
			priority = getAttrPriority(b) - getAttrPriority(a)
		}

		return priority
	}

	function sortAttrs(a, b) {
		const priority = compareAttrFolders(a, b)

		if (priority !== 0) return priority

		return a.name.localeCompare(b.name)
	}

	function init(data) {
		attrsList = data.attributes

		let attributes = attrsList
			/*.map(item => {
			item.name = item.name.replaceAll('. ', ' / ')

			return item
		})*/
			.sort(sortAttrs)

		favList.value = data.favoriteAttributes

		selectedOld = attributes.filter((item) =>
			data.selectedAttributes.includes(item.key)
		)

		selectedOld.forEach((sAttr) => {
			selected[sAttr.key] = true
		})

		formattedAttrs.value = attributes

		if (formattedAttrs.value.length) {
			activeRow.value = formattedAttrs.value[0].key
		}
	}

	/** Disable attributes from property 'selectedAttributes' **/
	function markDisabledAttrs(attrData) {
		attrData.disabled = !!selectedOld.find(
			(selAttr) => selAttr.key === attrData.key
		)
		return attrData
	}

	let selected = reactive({})

	const advancedColumns = computed(() => {
		let tree = {}
		console.log('tree:', tree)
		let attrs = JSON.parse(JSON.stringify(formattedAttrs.value))
		let searchedAttrs

		// Search
		if (searchParam.value) {
			searchedAttrs = searchAndReplace(attrs)
			attrs = searchedAttrs
		}

		attrs = attrs.map(markDisabledAttrs)

		for (let attr of attrs) {
			// const parts = attr.name.split(" / ")
			const parts = attr.name.split('. ')
			parts[0] = parts[0].trim()

			let node = tree

			for (let i = 0; i < parts.length; i++) {
				let part = parts[i]

				if (!node[part]) {
					if (parts.length - 1 == i) {
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
		if (searchParam.value) {
			attrs.unshift({
				name: 'All sections',
				children: searchedAttrs,
			})
		}

		return attrs
	})

	function toAttrsTree(obj) {
		let list = []

		for (let key in obj) {
			let newObj = reactive({
				name: key,
				children: [],
			})

			if (obj[key].isOpen === false) {
				newObj.isOpen = ref(false)
				newObj.children = toAttrsTree(obj[key])
			} else {
				newObj = obj[key]
			}

			if (key != 'isOpen') list.push(newObj)
		}

		return list
	}

	const advancedColumnActive = computed(() => {
		let result = []

		if (advancedColumns.value[activeTree.value])
			result = advancedColumns.value[activeTree.value].children

		return result
	})

	const selectedColumns = computed(() => {
		let props = []

		for (let prop in selected) {
			const oldSel = selectedOld.find((attr) => attr.key === prop)

			if (!selected[prop] || oldSel) continue

			let selAttr = formattedAttrs.value.find((item) => item.key == prop)
			selAttr = JSON.parse(JSON.stringify(selAttr))

			props.push(selAttr)
		}

		if (searchParam.value) {
			props = searchAndReplace(props)
		} else {
			props = formatNames(props)
		}

		return props
	})

	let infoEditable = reactive({
		name: '',
		key: '',
		description: '',
	})

	const attrInfo = computed(() => {
		let attr = formattedAttrs.value.find((item) => item.key == activeRow.value)
		if (!attr) return { name: '' }

		let name = 'No name'
		let description = attr.description || 'No info'

		if (tab.value == 'favorites') {
			let fav = favList.value.find((o) => o.key == attr.key)

			if (fav) {
				name = fav.customName || formatName(attr.name)
				description = fav.customDescription || description
			}
		}

		if (tab.value == 'selected') {
			name = attr.customName || formatName(attr.name)
		}

		return {
			name,
			path: formatName(attr.name),
			key: attr.key,
			info: description,
		}
	})

	function editAttrInfo() {
		const selFavAttr = favList.value.find(
			(fAttr) => fAttr.key === attrInfo.value.key
		)

		if (!attrInfo.value.key || !selFavAttr) {
			return
		}

		infoEditable.key = selFavAttr.key
		infoEditable.name = selFavAttr.customName
		infoEditable.description = selFavAttr.customDescription

		isEdit.value = true
	}

	function saveAttrInfo() {
		let fav = favList.value.find((o) => o.key == infoEditable.key)

		fav.customName = infoEditable.name
		fav.customDescription = infoEditable.description

		// TODO: after modal_add_columns starts to return array of objects, change 'layout_name' inside formattedAttrs and / or attrsList

		isEdit.value = false

		saveFavAttrs(JSON.parse(JSON.stringify(favList.value)))
	}
	function toggleFav(attr) {
		let fav = favList.value.find((o) => o.key == attr.key)

		if (fav) {
			let index = favList.value.findIndex((o) => o.key == attr.key)

			favList.value.splice(index, 1)
		} else {
			favList.value.push({
				key: attr.key,
				// TODO use attributes's original name
				name: formattedAttrs.value.find((o) => o.key == attr.key).name,
				customName: '',
				customDescription: '',
			})
		}
		saveFavAttrs(JSON.parse(JSON.stringify(favList.value)))
	}

	// '. ' are not replaced inside attributes themselves because ' / ' can be used inside names of dynamic attributes
	/**
	 * @param {string} name
	 * @returns {string} - name after replacing '. ' with ' / '
	 */
	const formatName = (name) => name.replaceAll(foldersSeparatorRE, ' / ')
	function formatNames(attrs) {
		return attrs.map((attr) => {
			attr.name = formatName(attr.name)
			return attr
		})
	}

	function searchAndReplace(attrs) {
		let terms = searchParam.value.trim().split(/\s*(?:\s|\/)\s*/) // characters between spaces or '/'
		let result = attrs

		terms.forEach((term, i) => {
			term = term.toLowerCase()

			result = result.filter((item) => item.name.toLowerCase().includes(term))
		})

		result = result.map((item) => {
			let name = formatName(item.name)

			terms = terms.map((term) => useRegExpEscape(term))
			const searchTerm = terms.join('|')

			name = name.replaceAll(
				new RegExp(`(${searchTerm})`, 'gi'),
				// new RegExp(pattern, 'gi'),
				(match) => `<span class="c_primary">${match}</span>`
			)

			return { ...item, name }
		})

		return result
	}

	let searchTimer
	function search(value) {
		clearTimeout(searchTimer)

		searchTimer = setTimeout(() => {
			searchParam.value = value
		}, 1000)
	}

	function cancel() {
		reject()
		delete $mdDialog.modals['AttributesSelectorDialogController']
	}
	function save() {
		const selKeys = Object.keys(selected).filter((key) => {
			return !selectedOld.find((attr) => attr.key === key)
		})
		saveDialog({ selectedAttributes: selKeys })
	}
	// END MODAL ADD COLUMNS

	function processAttrName(attr) {
		let formattedName = attr.name

		if (attr.attribute_type) {
			const namePieces = formattedName.split(foldersSeparatorRE)
			const last = namePieces.pop()
			const namePiece = attr.key.includes('pricing_policy_')
				? 'Pricing'
				: 'User Attributes'

			namePieces.push(namePiece)
			namePieces.push(last)

			formattedName = namePieces.join('. ')
		} else if (!attr.name.match(foldersSeparatorRE)) {
			formattedName = 'General. ' + attr.name
		}

		return formattedName
	}

	function saveFavAttrs(favAttrsData) {
		if (!Array.isArray(favAttrsData)) {
			const errorData = new Error(
				`Expected array. Got an '${typeof favAttrsData}'.`
			)
			errorData.___recievedParameter = favAttrsData
			throw errorData
		}

		favAttrsData = favAttrsData.map((fAttr) => {
			const attr = attributesList.find((attr) => attr.key === fAttr.key)

			if (attr) fAttr.name = attr.name

			return fAttr
		})

		member = globalDataService.getMember()
		member.data.favorites.attributes[contentType] = favAttrsData
		initSettings.favoriteAttributes =
			member.data.favorites.attributes[contentType]

		usersService.updateMember(member.id, member).then(() => {
			toastNotificationService.success('Favorite attributes updated.')
		})
	}

	function saveDialog(payload) {
		const alreadySelAttrKey = payload.selectedAttributes.find((attrKey) => {
			return initSettings.selectedAttributes.find(
				(selAttr) => selAttr.key === attrKey
			)
		})

		if (alreadySelAttrKey) {
			throw new Error(`Attribute '${alreadySelAttrKey}' already selected.`)
		}

		let resItems = []

		payload.selectedAttributes.forEach((attrKey) => {
			let attrData = attributesList.find((attr) => attr.key === attrKey)

			if (!attrData) {
				return
			}

			/* let selAttr = {
                key: attrData.key,
                name: attrData.name,
                value_type: attrData.value_type,
            } */
			attrData = JSON.parse(JSON.stringify(attrData))

			const favAttr = initSettings.favoriteAttributes.find(
				(attr) => attr.key === attrKey
			)

			if (favAttr && favAttr.customName)
				attrData.layout_name = favAttr.customName

			resItems.push(attrData)
		})

		resolve({
			status: 'agree',
			data: { items: resItems },
		})

		if (window.$mdDialog)
			delete $mdDialog.modals['AttributesSelectorDialogController']
	}

	function processMessagesFromIframe(event) {
		// ANGULAR

		switch (event.data.action) {
			case 'CANCEL_DIALOG':
				window.removeEventListener('message', processMessagesFromIframe)
				$mdDialog.hide({ status: 'disagree' })
				break
		}
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
				stroke: var(--primary-color) !important;
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
				.desc_title,
				.desc_subtitle,
				.desc_about,
				.desc_icons {
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
	.content_grid {
		min-height: inherit;
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
		color: var(--card-secondary-text-color);
		word-wrap: break-word;
	}
	.desc_about {
		padding: 10px 13px;
		color: var(--card-secondary-text-color);
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
		color: var(--card-secondary-text-color);
	}
</style>
