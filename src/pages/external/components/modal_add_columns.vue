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
				<!--
					v-model="searchParam"
					:modelValue="searchParam"
					@update:modelValue="search" -->
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
					class="fm_tabs_item"
					:class="{active: tab == 'selected'}"
					@click="tab = 'selected'"
				>
					Selected
				</div>
			</div>

			<div :class="[isAdvanced && tab == 'advanced' ? 'advanced' : '', 'content_grid']">
				<div class="content_grid_left" v-if="isAdvanced && tab == 'advanced'">
					<ul class="fm_list">
						<li class="fm_list_item attr_item" :class="{active: activeTree == prop}" v-for="(val, prop) in advancedColumns" @click="activeTree = prop">{{ prop }}</li>
					</ul>
				</div>

				<div class="content_grid_main">
					<div class="fm_list" v-if="!isAdvanced || tab == 'favorites'">
						<div
							class="fm_list_item attr_item flex aic sb"
							:class="{active: activeRow == item.key}"
							v-for="(item, i) in filteredColumns"
							@click="activeRow = item.key"
							@dblclick="item.checked = !item.checked"
						>
							<div class="flex aic">
								<FmCheckbox
									v-model="item.checked"
									@click.stop="() => {}"
								/>

								<div v-html="item.name"></div>
							</div>

							<FmIcon v-if="tab == 'advanced'" class="favorites" size="20" primary icon="star_outlined" />
						</div>
					</div>
					<template v-else>
						<ul class="fm_list">
							<template
								v-for="(obj, prop) in advancedColumns[activeTree]"
							>
								<div
									v-if="obj.key"
									class="fm_list_item attr_item flex aic sb"
									:class="{active: activeRow == obj.key}"
									@click="activeRow = obj.key"
									@dblclick="obj.checked = !obj.checked"
								>
									<div class="flex aic">
										<FmCheckbox
											v-model="obj.checked"
											@click.stop="() => {}"
										/>

										<div v-html="prop"></div>
									</div>

									<FmIcon v-if="tab == 'advanced'" class="favorites" size="20" primary icon="star_outlined" />
								</div>

								<div v-else>
									<li class="fm_list_item attr_item" @click="obj.isOpen = !obj.isOpen">
										<FmIcon size="24" icon="expand_more" />
										<div v-html="prop"></div>
									</li>

									<template v-if="obj.isOpen">
										<div
											v-for="(val, prop) in obj"
											class="fm_list_item attr_item flex aic sb"
											:class="{active: activeRow == val.key}"
											@click="activeRow = val.key"
											@dblclick="val.checked = !val.checked"
											v-if="prop != 'isOpen'"
										>
											<div class="flex aic p-l-24">
												<FmCheckbox
													v-model="val.checked"
													@click.stop="() => {}"
												/>

												<div v-html="prop"></div>
											</div>

											<FmIcon v-if="tab == 'advanced'" class="favorites" size="20" primary icon="star_outlined" />
										</div>
									</template>

								</div>
							</template>
						</ul>
					</template>
				</div>

				<div class="content_grid_right">
					<div class="desc_title">{{ favorites.name }}</div>
					<div class="desc_subtitle">{{ favorites.path }}</div>
					<div class="desc_about">{{ favorites.info }}</div>
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
	let activeTree = ref('')

	const formatedAttrs = attributes.map(item => {
		item.name = item.name.replaceAll('. ', ' / ')

		return item
	}).sort((a, b) => {
		let compareFolder = b.name.match(/\//g).length - a.name.match(/\//g).length

		if ( compareFolder != 0 ) return compareFolder

		return a.name.localeCompare(b.name)
	})

	activeRow.value = formatedAttrs[0].key

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

			return { name, key: item.key, checked: ref(false) }
		})

		return result
	})
	const advancedColumns = computed(() => {
		let tree = {};

		for (let attr of filteredColumns.value) {
			const parts = attr.name.split(" / ")
			parts[0] = parts[0].replace(/( |<([^>]+)>)/ig, "")

			let node = tree;

			for  (let i = 0; i < parts.length; i++ ) {
				let part = parts[i]

				if (!node[part]) {
					if ( parts.length - 1 == i ) {
						node[part] = attr

					} else {

						node[part] = reactive({})

						if ( i > 0 ) node[part].isOpen = false
					}
				}
				node = node[part]
			}
		}
		console.log('tree:', tree)

		return tree
	})
	const favorites = computed(() => {
		let attr = formatedAttrs.find(item => item.key == activeRow.value)
		if ( !attr ) return {}

		return {
			name: activeRow.value,
			path: attr.name,
			info: 'No info',
		}
	})

	let searchTimer;

	function search( value ) {
		clearTimeout(searchTimer)

		searchTimer = setTimeout(() => {
			searchParam.value = value
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
	}
</style>
