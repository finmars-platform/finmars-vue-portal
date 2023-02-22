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
					<div class="fm_tabs_item active">Favorites</div>
					<div class="fm_tabs_item">Advanced</div>
				</div>

				<div class="fm_tabs_item">Selected</div>
			</div>

			<div :class="[isAdvanced ? 'advanced' : '', 'content_grid']">
				<div class="content_grid_left" v-if="isAdvanced">
					<ul class="fm_list">
						<li class="fm_list_item">Balance</li>
						<li class="fm_list_item">Performance</li>
						<li class="fm_list_item">Allocation</li>
					</ul>
				</div>

				<div class="content_grid_main">
					<div class="fm_list">
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

							<FmIcon icon="search" />
						</div>
					</div>

				</div>

				<div class="content_grid_right">
					<div class="desc_title">test</div>
					<div class="desc_subtitle">testus</div>
					<div class="desc_about">sfdg fdsg fsd gfd</div>
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
	let activeRow = ref('')

	const formatedAttrs = attributes.map(item => {
		item.name = item.name.replaceAll('. ', ' / ')


		return item
	})

	const filteredColumns = computed(() => {
		if ( !searchParam.value ) return formatedAttrs
			.map((item) => ({ name: item.name, key: item.key }) )

		let terms = searchParam.value.split(/\s*(?:\s|\/)\s*/)
		let result = formatedAttrs

		terms.forEach((term, i) => {
			result = result
				.filter((item) => item.key.includes(term))
		})

		result = result.map(item => {
			let name = item.name

			name = name.replace(
				new RegExp(`(${terms.join('|')})`, 'gi'),
				(match) => `<span class="c_primary">${match}</span>`
			)

			return { name, key: item.key }
		})

		return result
	})
	console.log('filteredColumns:', filteredColumns)

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
		}
		&_main {
			height: 100%;
			overflow: auto;
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
		&.active {
			background: $primary-lighten-2;
		}
	}
</style>
