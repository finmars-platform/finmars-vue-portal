<template>
	<div class="attrs_sel_container">
		<!--		<div class="modal_top flex aic sb">
					<div class="flex aic">
						<div class="modal_head">{{ title }}</div>

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

					<FmBtn type="icon" icon="close" @click="emit('cancel')" />
				</div>-->

		<div class="attrs_sel_content scrollable">
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
					<div>
						Selected
						<div class="select_count">
							{{ selectedColumns.length }}
						</div>
					</div>
				</div>
			</div>

			<div
				:class="[
					isAdvanced ? 'advanced_mod' : '',
					isAdvanced && tab == 'advanced' ? 'advanced' : '',
					'content_grid',
					{ collapsed: isCollapsedInfo }
				]"
			>
				<div class="content_grid_left" v-show="isAdvanced && tab == 'advanced'">
					<ul class="fm_list">
						<li
							class="fm_list_item attr_item"
							:class="{ active: activeTree == i }"
							v-for="(item, i) in viewTree"
							:key="i"
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
							:key="i"
							@click="activeRow = item.key"
							@dblclick="
								item.disabled || (selected[item.key] = !selected[item.key])
							"
						>
							<div class="flex aic">
								<FmCheckbox
									:modelValue="selected[item.key]"
									:disabled="item.disabled"
									@update:modelValue="(newVal) => toggleAttr(item, newVal)"
									@click.stop=""
								/>

								<div v-html="item.customName || item.name"></div>
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
						<template v-if="viewTree[activeTree]">
							<template
								v-for="(obj, ind) in viewTree[activeTree].children"
								:key="ind"
							>
								<!-- Leaf -->
								<div
									v-if="!obj.hasOwnProperty('opened')"
									class="fm_list_item attr_item flex aic sb"
									:class="{ active: activeRow == obj.key }"
									@click="activeRow = obj.key"
									@dblclick="toggleAttr(obj, !selected[obj.key])"
								>
									<div class="flex aic">
										<FmCheckbox
											:modelValue="selected[obj.key]"
											:disabled="obj.disabled"
											@update:modelValue="(newVal) => toggleAttr(obj, newVal)"
											@click.stop=""
										/>

										<!--									<div v-html="advancedColumns[activeTree].name == 'All sections' ? obj.name : obj.short_name"></div>-->
										<div v-html="obj.name"></div>
									</div>

									<FmIcon
										size="20"
										primary
										:class="[
											'favorites',
											{ active: !!favList.find((o) => o.key == obj.key) }
										]"
										:icon="
											favList.find((o) => o.key == obj.key)
												? 'star'
												: 'star_outlined'
										"
										@click="toggleFav(obj)"
									/>
								</div>

								<!-- Branch -->
								<div v-else>
									<li
										class="fm_list_item attr_item"
										@click="obj.opened = !obj.opened"
									>
										<FmIcon
											class="expand"
											:icon="obj.opened ? 'expand_more' : 'chevron_right'"
										/>
										<div v-html="obj.name"></div>
									</li>

									<template v-if="obj.opened">
										<!--									<div
																				v-for="(val, prop) in obj"
																				class="fm_list_item attr_item flex aic sb"
																				:class="{active: activeRow == val.key}"
																				@click="activeRow = val.key"
																				@dblclick="toggleAttr( val, !selected[val.key] )"
																			>-->
										<div
											v-for="child in obj.children"
											:key="child.key"
											class="fm_list_item attr_item flex aic sb"
											:class="{ active: activeRow == child.key }"
											@click="activeRow = child.key"
											@dblclick="toggleAttr(child, !selected[child.key])"
										>
											<div class="flex aic expand_wrap">
												<FmCheckbox
													:modelValue="selected[child.key]"
													:disabled="child.disabled"
													@update:modelValue="
														(newVal) => toggleAttr(child, newVal)
													"
													@click.stop=""
												/>

												<div v-html="child.name"></div>
											</div>

											<FmIcon
												size="20"
												primary
												:class="[
													'favorites',
													{ active: !!favList.find((o) => o.key == child.key) }
												]"
												:icon="
													favList.find((o) => o.key == child.key)
														? 'star'
														: 'star_outlined'
												"
												@click="toggleFav(child)"
											/>
										</div>
									</template>
								</div>
								<!-- endregion Folder -->
							</template>
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
								v-for="(item, i) in selectedOldComp"
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
								v-for="(item, i) in selectedNewComp"
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

						<div
							class="desc_icons m-r-16"
							v-if="tab == 'favorites' && isAdvanced"
						>
							<FmIcon
								v-if="!isEdit && activeRow"
								size="20"
								primary
								icon="edit"
								@click="editAttrInfo()"
							/>

							<div class="flex" v-if="isEdit">
								<FmIcon primary size="20" icon="save" @click="saveAttrInfo()" />
								<FmIcon
									primary
									size="20"
									icon="close"
									@click="isEdit = false"
								/>
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

						<FmInputArea
							v-else
							v-model="infoEditable.description"
							class="height-100 m-b-0"
						/>
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
		</div>

		<!--		<div class="modal_bottom flex sb">
					<div class="flex aic">
						<FmBtn
							type="text"
							@click="emit('cancel')"
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
				</div>-->
	</div>
</template>

<script setup>
	let props = defineProps({
		modelValue: {
			type: Array,
			default() {
				return [];
			}
		}, // selected attributes
		title: {
			type: String,
			default: 'Select attribute,'
		},
		attributes: {
			type: Array,
			default() {
				return [];
			}
		},
		favoriteAttributes: Array,
		disabledAttributes: {
			// Array contains Strings (keys). E.g. attributes that are already used when adding new columns
			type: Array,
			default() {
				return [];
			}
		},
		multiselect: Boolean,
		searchParameters: String,
		isAdvanced: Boolean // if false, only tab "favorites" available
	});

	let emit = defineEmits([
		'update:modelValue',
		'update:isAdvanced',
		'save',
		'cancel',
		'favoritesChanged'
	]);

	const foldersSeparatorRE = /\.\s(?=\S)/g; // equals to ". " which have symbol after it

	let tab = ref('favorites');

	if (!props.favoriteAttributes || !props.favoriteAttributes.length) {
		emit('update:isAdvanced', true);
		tab.value = 'advanced';
	}

	let searchParam = ref('');

	let activeRow = ref('');
	let activeTree = ref(0);

	// let isAdvanced = ref(false)
	let isEdit = ref(false);
	let isCollapsedInfo = ref(false);
	let isOpenSelect = reactive({
		current: true,
		new: true
	});

	let attrsList = [];
	const windowOrigin = window.origin;
	// const windowOrigin = 'http://0.0.0.0:8080'; // for development

	let formattedAttrs = ref([]);
	let attrsTree;
	let viewTree = ref([]);
	// let selectedOld = []
	// let disabledAttrs = ref([]);
	let favList = ref([
		/*{
        key: 'pricing_currency.reference_for_pricing',
        name: 'test',
        customName: 'test',
        customDescription: 'test',
      }*/
	]);

	const favoritesAttrs = computed(() => {
		let attrs = JSON.parse(JSON.stringify(favList.value));

		attrs = attrs.map(markDisabledAttrs);

		// mark favorites that refers to nonexistent attributes
		attrs = attrs.map((fAttr) => {
			const index = attrsList.findIndex((attr) => attr.key === fAttr.key);

			if (index < 0) {
				fAttr.error = 'Attribute does not exist in the Configuration';
				fAttr.disabled = true;
			}

			return fAttr;
		});
		// if ( !attrs ) return []
		if (searchParam.value) {
			attrs = searchAndReplace(attrs);
		} else {
			attrs = formatNames(attrs);
		}

		return attrs;
	});

	const getAttrPriority = (attr) => {
		let priority = 3;

		if (attr.key.includes('attributes.')) {
			priority = 1;

			if (attr.key.includes('pricing_policy_')) {
				priority = 2;
			}
		}

		return priority;
	};

	function compareAttrFolders(a, b) {
		let priority =
			b.name.match(foldersSeparatorRE).length -
			a.name.match(foldersSeparatorRE).length;

		if (priority === 0) {
			// attributes have the same folders quantity
			// place "User Attributes", "Pricing" after other folders
			priority = getAttrPriority(b) - getAttrPriority(a);
		}

		return priority;
	}

	function sortAttrs(a, b) {
		const priority = compareAttrFolders(a, b);

		if (priority !== 0) return priority;

		return a.name.localeCompare(b.name);
	}

	/** Disable attributes from property 'disabledAttributes' **/
	function markDisabledAttrs(attrData) {
		// attrData.disabled = !!disabledAttrs.value.find(selAttr => selAttr.key === attrData.key);
		attrData.disabled = props.disabledAttributes.includes(attrData.key);
		return attrData;
	}

	let selected = reactive({});
	let selectedOldKeysRef = ref([]);

	/**
	 * Attributes to show inside tab "SELECTED" inside group "Old"
	 *
	 * @type {ComputedRef<Array<Object>>}
	 */
	let selectedOldComp = computed(() => {
		return formattedAttrs.value.filter((attr) =>
			selectedOldKeysRef.value.includes(attr.key)
		);
	});

	let selectedNewComp = computed(() => {
		let newSelectedKeys = Object.keys(selected).filter((key) => {
			const notSelectedOld = !selectedOldKeysRef.value.includes(key);

			return selected[key] && notSelectedOld;
		});

		return formattedAttrs.value.filter((attr) =>
			newSelectedKeys.includes(attr.key)
		);
	});
	/*let selectedNewRef = ref([]);

	function updateSelectedNew(attr, status) {

		if (status) {
			selectedNewRef.value.push(attr);

		} else {

			const sAttrIndex = selectedNewRef.value.findIndex(
				sAttr => sAttr.key === attr.key
			);

			if (sAttrIndex > -1) {
				selectedNewRef.value.splice(sAttrIndex, 1);
			}

		}

		return selectedNewRef.value;

	}*/

	/*function registerOldSelAttrs(formattedAttrs) {

		let selOldAttrsList = [];

		Object.keys(selected).forEach(key => {

			const selAttr = formattedAttrs.find(attr => attr.key === key);

			if (selAttr) {

				selOldAttrsList.push(selAttr);

			} else {
				console.warn(`Selected attribute not found: ${key}`)
			}

		})

		return selOldAttrsList;

	}*/

	let toggleAttr;

	function setToggleAttrFn() {
		if (props.multiselect) {
			return function (attr, status) {
				if (attr.disabled) return;

				selected[attr.key] = status;

				const selKeys = Object.keys(selected).filter((key) => {
					return selected[key] && !selectedOldKeysRef.value.includes(key);
				});
				// const selAttrs = props.attributes.filter( attr => selKeys.includes(attr.key) );

				emit('update:modelValue', selKeys);
			};
		}

		return function (attr, status) {
			if (attr.disabled) return;

			selected[attr.key] = status; // in case attribute was not selected before

			if (selected[attr.key]) {
				Object.keys(selected).forEach((key) => {
					// deselect other attributes except disabled

					selected[key] =
						!selectedOldKeysRef.value.includes(key) && key === attr.key;
				});
			}

			emit('update:modelValue', selected[attr.key] ? attr.key : null); // 'null' if attribute was deselected
		};
	}

	toggleAttr = setToggleAttrFn();

	watch(
		() => props.multiselect,
		() => {
			toggleAttr = setToggleAttrFn();
		}
	);

	function formatAttrName(attr) {
		let formattedName = attr.name;

		if (attr.attribute_type) {
			const namePieces = formattedName.split(foldersSeparatorRE);
			const last = namePieces.pop();
			const namePiece = attr.key.includes('pricing_policy_')
				? 'Pricing'
				: 'User Attributes';

			namePieces.push(namePiece);
			namePieces.push(last);

			formattedName = namePieces.join('. ');
		} else if (!attr.name.match(foldersSeparatorRE)) {
			/* if attribute does not fit any group
			 * place it into a group General */
			formattedName = 'General. ' + attr.name;
		}

		attr.name = formattedName;

		return attr;
	}

	function processAttributes() {
		attrsList = JSON.parse(JSON.stringify(props.attributes));

		attrsList = attrsList.map(formatAttrName);

		let attributes = attrsList.sort(sortAttrs);

		// disabledAttrs.value = attributes.filter( item => props.disabledAttributes.includes(item.key) );

		formattedAttrs.value = attributes;
	}

	watch(
		() => props.attributes,
		() => {
			processAttributes();
		}
	);

	function buildTreeTemplate(attrs) {
		let tree = {};

		for (let attr of attrs) {
			// const parts = attr.name.split(" / ")
			const parts = attr.name.split('. ');
			parts[0] = parts[0].trim();

			let node = tree;

			for (let i = 0; i < parts.length; i++) {
				let part = parts[i];

				if (!node[part]) {
					if (parts.length - 1 == i) {
						// leaf
						// attr.short_name = part
						node[part] = attr;
					} else {
						// branch

						node[part] = {};

						node[part]._branch = true;
					}
				}
				node = node[part];
			}
		}
		console.log('--- TREE: ', tree);
		return tree;
	}

	function assembleTree(treeTemplate, parent) {
		let list = [];

		for (let key in treeTemplate) {
			let pathToNode = [key];
			// let level = 0;

			if (parent) {
				pathToNode = parent.pathToNode.concat(pathToNode);
				// level = parent.level + 1;
			}

			let nodeData = {
				name: key,
				pathToNode: pathToNode
				// level: level,
			};

			if (treeTemplate[key]._branch) {
				nodeData.opened = false;
				nodeData.children = assembleTree(treeTemplate[key], nodeData);
			} else {
				// leaf

				nodeData.key = treeTemplate[key].key;
				nodeData.disabled = props.disabledAttributes.includes(nodeData.key);
				nodeData.originalName = treeTemplate[key].name;
				nodeData.value_type = treeTemplate[key].value_type;
			}

			if (key !== '_branch') list.push(nodeData);
		}

		return list;
	}

	watch(formattedAttrs, () => {
		let attrs = JSON.parse(JSON.stringify(formattedAttrs.value));
		let tree = buildTreeTemplate(attrs);

		attrsTree = assembleTree(tree);
		console.log('attrsTree:', attrsTree);

		viewTree.value = searchParam.value ? filterTree(attrsTree) : attrsTree;
	});

	watch(searchParam, () => {
		viewTree.value = searchParam.value ? filterTree(attrsTree) : attrsTree;
	});

	const selectedColumns = computed(() => {
		let props = [];

		for (let prop in selected) {
			/*const oldSel = disabledAttrs.value.find( attr => attr.key === prop );

			if ( !selected[prop] || oldSel ) continue*/
			if (!selected[prop]) continue;

			let selAttr = formattedAttrs.value.find((item) => item.key == prop);
			if (selAttr) {
				selAttr = JSON.parse(JSON.stringify(selAttr));

				props.push(selAttr);
			} else {
				console.warn(`Selected attribute not found: ${prop}`);
			}
		}

		if (searchParam.value) {
			props = searchAndReplace(props);
		} else {
			props = formatNames(props);
		}

		return props;
	});

	const newSelColumns = computed(() => {});

	let infoEditable = reactive({
		name: '',
		key: '',
		description: ''
	});

	const attrInfo = computed(() => {
		let attr = formattedAttrs.value.find((item) => item.key == activeRow.value);
		if (!attr) return { name: '' };

		let name = 'No name';
		let description = attr.description || 'No info';

		if (tab.value == 'favorites') {
			let fav = favList.value.find((o) => o.key == attr.key);

			if (fav) {
				name = fav.customName || formatName(attr.name);
				description = fav.customDescription || description;
			}
		}

		if (tab.value == 'selected') {
			name = attr.customName || formatName(attr.name);
		}

		return {
			name,
			path: formatName(attr.name),
			key: attr.key,
			info: description
		};
	});

	function editAttrInfo() {
		const selFavAttr = favList.value.find(
			(fAttr) => fAttr.key === attrInfo.value.key
		);

		if (!attrInfo.value.key || !selFavAttr) {
			return;
		}

		infoEditable.key = selFavAttr.key;
		infoEditable.name = selFavAttr.customName;
		infoEditable.description = selFavAttr.customDescription;

		isEdit.value = true;
	}

	function saveAttrInfo() {
		let fav = favList.value.find((o) => o.key == infoEditable.key);

		fav.customName = infoEditable.name;
		fav.customDescription = infoEditable.description;

		// TODO: after modal_add_columns starts to return array of objects, change 'layout_name' inside formattedAttrs and / or attrsList

		isEdit.value = false;

		emit('favoritesChanged', JSON.parse(JSON.stringify(favList.value)));
	}

	function toggleFav(attr) {
		let fav = favList.value.find((o) => o.key == attr.key);

		if (fav) {
			let index = favList.value.findIndex((o) => o.key == attr.key);

			favList.value.splice(index, 1);
		} else {
			favList.value.push({
				key: attr.key,
				// TODO use attributes's original name
				name: formattedAttrs.value.find((o) => o.key == attr.key).name,
				value_type: attr.value_type,
				customName: '',
				customDescription: ''
			});
		}

		emit('favoritesChanged', JSON.parse(JSON.stringify(favList.value)));
	}

	// '. ' are not replaced inside attributes themselves because ' / ' can be used inside names of dynamic attributes
	/**
	 * @param {string} name
	 * @returns {string} - name after replacing '. ' with ' / '
	 */
	const formatName = (name) => name.replaceAll(foldersSeparatorRE, ' / ');

	function formatNames(attrs) {
		return attrs.map((attr) => {
			attr.name = formatName(attr.name);
			return attr;
		});
	}

	const searchTermsList = computed(() => {
		if (!searchParam.value) {
			return [];
		}

		const terms = searchParam.value.trim().split(/\s*(?:\s|\/)\s*/); // characters between spaces or '/'

		return terms.map((term) => term.toLowerCase());
	});

	function filterAttrs(attrs) {
		/*const terms = searchParam.value.trim().split(/\s*(?:\s|\/)\s*!/); // characters between spaces or '/'

		let result = attrs;

		terms.forEach((term, i) => {
		  term = term.toLowerCase();

		  result = result
			.filter( (item) => item.name.toLowerCase().includes(term) );
		})*/

		let result = attrs;

		searchTermsList.value.forEach((term) => {
			result = result.filter((item) => {
				let passes = item.name.toLowerCase().includes(term);

				if (!passes && item.customName) {
					// when filtering favorite attributes
					passes = item.customName.toLowerCase().includes(term);
				}

				return passes;
			});
		});

		return result;
	}

	/**
	 * If originalName of leaf passed, it will be formatted.
	 *
	 * @param {string} name - name of branch or leaf
	 * @returns {string} - html string with names that match filter highlighted
	 */
	function highlightName(name) {
		name = formatName(name);

		const terms = searchTermsList.value.map((term) => useRegExpEscape(term));
		const searchTerm = terms.join('|');

		return name.replaceAll(
			new RegExp(`(${searchTerm})`, 'gi'),
			// new RegExp(pattern, 'gi'),
			(match) => `<span class="c_primary">${match}</span>`
		);
	}

	/** Format names of attributes that pass filter and highlight its parts  */
	function highlightFound(attrs) {
		// let terms = searchParam.value.trim().split(/\s*(?:\s|\/)\s*/); // characters between spaces or '/'

		attrs = attrs.map((item) => {
			/*let name = formatName( item.name );

			terms = terms.map( term => useRegExpEscape(term) );
			const searchTerm = terms.join('|');

			name = name.replaceAll(
			  new RegExp(`(${searchTerm})`, 'gi'),
			  // new RegExp(pattern, 'gi'),
			  (match) => `<span class="c_primary">${match}</span>`
			)*/
			const name = highlightName(item.name);

			return { ...item, name };
		});

		return attrs;
	}

	/*function searchAndReplace( attrs ) {
	  let terms = searchParam.value.trim().split(/\s*(?:\s|\/)\s*!/) // characters between spaces or '/'
	  let result = attrs

	  terms.forEach((term, i) => {
		term = term.toLowerCase()

		result = result
		  .filter( (item) => item.name.toLowerCase().includes(term) )
	  })

	  result = result.map(item => {

		let name = formatName( item.name );

		terms = terms.map( term => useRegExpEscape(term) );
		const searchTerm = terms.join('|');

		name = name.replaceAll(
		  new RegExp(`(${searchTerm})`, 'gi'),
		  // new RegExp(pattern, 'gi'),
		  (match) => `<span class="c_primary">${match}</span>`
		)

		return { ...item, name }

	  })

	  return result
	}*/
	function searchAndReplace(attrs) {
		let result = filterAttrs(attrs);

		result = highlightFound(result);

		return result;
	}

	function nodePassesFilter(node) {
		const name = node.name.toLowerCase();
		// all terms should be found inside name or originalName

		if (node.originalName) {
			// leaf

			const originalName = formatName(node.originalName).toLowerCase();
			// all terms should be found inside originalName and at least one term inside name
			return (
				!searchTermsList.value.find((term) => !originalName.includes(term)) &&
				!!searchTermsList.value.find((term) => name.includes(term))
			);
		}
		// all terms should be found inside name
		return !searchTermsList.value.find((term) => !name.includes(term));
	}

	function filterNodesR(tree, filteredTree = []) {
		tree.forEach((node) => {
			/*let name = node.originalName ? formatName(node.originalName) : node.name;
			name = name.toLowerCase();*/
			if (nodePassesFilter(node)) {
				let filteredNode;

				/*
				 * Spreading object literals used below
				 * so that highlightName() will not change properties 'name'
				 * inside the object attrsTree
				 * */
				/*if (node.children) {

				  filteredNode = {
					...node,
					name: highlightName(node.name)
				  };

				} else {

				  filteredNode = {
					...node,
					name: highlightName(node.originalName),
				  };

				}*/

				/*
				 * Spreading object literals used below
				 * so that highlightName() will not change properties 'name'
				 * inside the object attrsTree
				 * */
				filteredNode = {
					...node,
					name: highlightName(node.originalName || node.name)
				};

				filteredTree.push(filteredNode);
			}

			// should be called after filteredTree.push(filteredNode) to place nodes after their parents
			if (node.children) {
				filteredTree = filterNodesR(node.children, filteredTree);
			}
		});

		return filteredTree;
	}

	/** Format names of branches for section - All sections */
	function formatSecsBrsNames(tree) {
		return tree.map((node) => {
			if (node.originalName) {
				/*
				 * Spreading object literals used below
				 * so that highlightName() will not change properties 'name'
				 * inside the object attrsTree
				 * */
				return {
					...node,
					name: highlightName(node.pathToNode.join(' / '))
				};
			}

			/*
			 * Spreading object literals used below
			 * so that highlightName() will not change properties 'name'
			 * inside the object attrsTree
			 * */
			return {
				...node,
				name: highlightName(node.pathToNode.join(' / ')),
				children: formatSecsBrsNames(node.children)
			};
		});
	}

	function getAllSectionsChildren(tree) {
		let result = tree.reduce(
			(accumulator, currentSection) =>
				accumulator.concat(currentSection.children),
			[]
		);

		result = formatSecsBrsNames(result);

		return result;
	}

	function filterTree(tree) {
		const filteredTree = tree
			.map((node) => {
				const filteredChildren = filterNodesR(node.children);

				if (filteredChildren.length) {
					return {
						...node,
						name: highlightName(node.name),
						...{ children: filteredChildren }
					};
				} else if (nodePassesFilter(node)) {
					// name of section passes filter

					return {
						...node,
						name: highlightName(node.name)
					};
				}

				return null;
			})
			.filter((node) => node);

		const allSections = {
			name: 'All sections',
			children: getAllSectionsChildren(filteredTree)
		};

		filteredTree.unshift(allSections);

		return filteredTree;
	}

	let searchTimer;

	function search(value) {
		clearTimeout(searchTimer);

		searchTimer = setTimeout(() => {
			searchParam.value = value;

			if (searchParam.value) {
				viewTree.value = filterTree(attrsTree);
			} else {
				viewTree.value = attrsTree;
			}
		}, 1000);
	}

	watch(() => props.searchParameters, search);

	/* function save() {

	  const selKeys = Object.keys(selected).filter( key => {
		return !selectedOld.find(attr => attr.key === key);
	  });

	  const selAttrs = props.attributes.filter( attr => selKeys.includes(attr.key) );

	  emit('save', selAttrs);

	} */
	function fillSelectedData(selectedData) {
		props.modelValue.forEach((attrKey) => {
			if (props.attributes.findIndex((attr) => attr.key === attrKey) > -1) {
				// attribute exist
				selectedData[attrKey] = true;
			} else {
				console.warn(`Selected attribute not found: ${attrKey}`);
			}
		});

		return selectedData;
	}

	watch(
		() => props.modelValue,
		() => {
			selected = fillSelectedData(selected);
		}
	);

	function init() {
		processAttributes();

		selected = fillSelectedData(selected);

		selectedOldKeysRef.value = Object.keys(selected);

		favList.value = JSON.parse(JSON.stringify(props.favoriteAttributes || []));
	}

	init();
</script>

<style lang="scss" scoped>
	.modal_top {
		height: 50px;
		padding: 0 20px;
		border-bottom: 1px solid $border;
	}

	.attrs_sel_content {
		height: 100%;
		// overflow: auto;
		// height: calc(100vh - 106px);
		min-width: 400px; // so that FmInputEntityNames could fit in
	}

	.modal_bottom {
		position: absolute;
		bottom: 0;
		width: 100%;
		border-top: 1px solid $border;
		padding: 10px 20px;
	}

	.attrs_sel_container {
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
		display: inline-block;
		background: var(--primary-color);
		width: 18px;
		height: 18px;
		line-height: 18px;
		text-align: center;
		color: var(--base-backgroundColor);
		margin-left: 11px;
		font-size: 12px;
		font-weight: 600;
		border-radius: 2px;
	}

	.content_grid {
		display: grid;
		grid-template-columns: 1fr 200px;
		height: 100%;
		background: var(--base-backgroundColor);

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

	.content_grid_right {
		display: flex;
		flex-direction: column;
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
		flex-grow: 1;
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
