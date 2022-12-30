<template>
	<BaseModal title="Results"
						 :modelValue="opened"
						 @close="cancel">

		<div class="uds_modal">

			<div class="flex-row">

				<div style="width: 383px;">
					<!--					<text-input
											on-change-callback="vm.onInputTextChange()"
											placeholder-text="Search"
											model="vm.inputText"
											small-options="{dialogParent: '.dialog-containers-wrap'}"
											class="m-r-8"></text-input>-->
					<FmInputText placeholder="Search"
											 class="m-r-8"
											 :modelValue="inputText"
											 @update:modelValue="filterItems" />
				</div>

			</div>

			<div class="database-table-head">

				<div style="width: 50%; padding: 5px;">
					Name
				</div>

				<div style="width: 30%; padding: 5px;">
					Code
				</div>


			</div>

			<div class="database-table-body">

				<div v-if="!processing" style="height: 359px; overflow-y: auto">

					<span v-if="localItems.length" class="options-group-title text-bold">Local Records
						({{ localItemsTotal }})</span>

					<div v-if="localItems.length">

						<div v-for="option in localItems"
								 @click="selectLocalItem(option)"
								 @dblclick="() => {selectLocalItem(option); save();}"
								 class="database-option-row"
								 :class="{'active': option.user_code === selLocalItem.user_code}"
						>

							<div class="option-name" :title="`${option.name}`" v-html="getHighlighted(option.name)">

							</div>
							<div class="option-isin" :title="`${option.user_code}`" v-html="getHighlighted(option.user_code)">

							</div>


						</div>

					</div>

					<span v-if="databaseItems.length"
								class="options-group-title"
								style="bottom: 0px;"
					>Global Records ({{ databaseItemsTotal }})</span>

					<div v-if="databaseItems.length">

						<div
							v-for="option in databaseItems"
							@click="selectDatabaseItem(option)"
							@dblclick="() => {selectDatabaseItem(option); save();}"
							class="database-option-row"
							:class="{'active': option.referenceId === selDatabaseItem.referenceId}"
						>


							<div class="option-name" :title="`${option.name}`" v-html="getHighlighted(option.name)">

							</div>

							<div v-if="content_type === 'currencies.currency'"
									 class="option-isin"
									 :title="`${option.code}`" v-html="getHighlighted(option.code)"></div>

							<div v-else
									 class="option-isin"
									 :title="`${option.user_code}`"
									 v-html="getHighlighted(option.user_code)"></div>


						</div>

						<FmBtn v-if="(globalPages + 1) < totalPages"
									 type="basic"
									 class="control-button load-more"
									 :class="{'disabled-btn': globalProcessing}"
									 @click="loadMoreGlobalItems($event)">Load more</FmBtn>

					</div>

					<div v-if="localItems.length && !databaseItems.length">
						<b class="options-group-title">No records found</b>
					</div>

				</div>

				<div v-if="processing" class="flex-row fc-center">
					<FmLoader />
				</div>

			</div>

		</div>

		<template #controls>
			<div class="uds_modal_footer">


				<div>
					<!--	TODO: add creation after making entityViewerAddDialog
									<FmBtn v-if="!showActions"
													 type="iconBtn"
													 icon="lock"
													 tooltip="Show more"
													 @click="showActions = true"></FmBtn>

										<div v-if="showActions"
												 class="flex-row">
											<FmBtn type="iconBtn"
														 icon="add"
														 tooltip="Create new"
														 @click="showActions = true"></FmBtn>
										</div>-->
				</div>


				<div>
					<FmBtn type="basic" class="m-r-8" @click="cancel()">CANCEL</FmBtn>

					<FmBtn type="basic" @click="save()">ok</FmBtn>
				</div>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	import * as commonHelper from "./helper";

	let props = defineProps({
		opened: Boolean,
		modelValue: [String, Number],
		content_type: String,
		itemObject: [Object, null]
	})

	let emit = defineEmits(['update:opened', 'update:itemObject'])

	let processing = ref(false);


	let databaseItemsTotal = ref(0);
	let databaseItems = ref([]);
	let selDatabaseItem = ref({});
	let globalProcessing = ref(false);
	let globalPages = ref(0);

	let totalPages = computed(() => {
		return databaseItemsTotal.value ? Math.round(databaseItemsTotal.value / 40) : 0;
	});

	let localItemsTotal = ref(0);
	let localItems = ref([]);
	let selLocalItem = ref({});

	// let inputText = ref(props.parentInputText);
	let inputText = ref('');

	let showActions = ref(false);

	watch(
		() => props.opened,
		() => {

			if (!props.opened) return;

			if (props.itemObject) {

				if (props.itemObject.referenceId) {
					selDatabaseItem.value = props.itemObject;

				} else {
					selLocalItem.value = props.itemObject;
				}

			} /* else if (props.parentInputText) {
					inputText.value = props.parentInputText;
				} */

			getList();

		}
	)

	/* function filterItems (filterVal) {

		inputText.value = filterVal;

		globalPages.value = 0;

		getList(inputText.value);

	} */
	const filterItems = useDebounce(function (filterVal) {

		inputText.value = filterVal;

		globalPages.value = 0;

		getList(inputText.value);

	}, 500);

	function getHighlighted (value) {
		return commonHelper.getHighlighted(inputText.value, value);
	}

	async function getList (filterTerms) {

		processing.value = true;

		const res = await commonHelper.getList(props.content_type, filterTerms);

		databaseItems.value = res.databaseData.items;
		databaseItemsTotal.value = res.databaseData.itemsTotal;

		localItems.value = res.localData.items;

		processing.value = false;

	}

	function selectLocalItem (item) {
		selLocalItem.value = item;
		selDatabaseItem.value = {};
	}

	function selectDatabaseItem (item) {
		selLocalItem.value = {};
		selDatabaseItem.value = item;
	}

	async function loadMoreGlobalItems () {

		globalPages.value = globalPages.value + 1;

		await commonHelper.findEntities(props.content_type, inputText.value, globalPages.value);

	}

	function cancel () {

		emit('update:opened', false);

		selDatabaseItem.value = {};
		selLocalItem.value = {};

	}

	function save () {

		let selItem, id;

		if ( Object.keys(selDatabaseItem.value).length ) {

			selItem = selDatabaseItem.value;
			id = selDatabaseItem.value.referenceId;

		}
		else if ( Object.keys(selLocalItem.value).length ) {

			selItem = selLocalItem.value;
			id = selLocalItem.value.user_code;

		}

		if (selItem) {

			emit('update:modelValue', id);
			emit('update:itemObject', JSON.parse(JSON.stringify(selItem)));

		}

		selDatabaseItem.value = {};
		selLocalItem.value = {};

		emit('update:opened', false);

	}

</script>

<style lang="scss" scoped>

	:deep(.modal_wrap) {
		width: 936px;
		height: 614px;
	}

	.database-table-head {
		display: flex;
		width: 713px;
		padding: 0 10px;
		font-size: 13px;
		color: #666;
		box-sizing: border-box;
		height: 56px;
		padding-top: 13px;
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;
	}

	.database-table-body {
		width: 713px;
		height: 359px;
		overflow-y: auto;
	}

	.options-group-title {
		font-size: 14px;
		letter-spacing: normal;
		color: #333;
		display: block;
		/* margin: 8px; */
		padding-left: 10px;
		height: 46px;
		box-sizing: border-box;
		padding-top: 15px;
		position: sticky;
		background: #fff;
		cursor: pointer;
	}

	.database-option-row {
		display: flex;
		height: 47px;
		box-sizing: border-box;
		padding: 0 10px;
		border-top: 1px solid #ddd;
		margin: 2px;
		cursor: pointer;

		&.active {
			color: $primary;
			outline: solid 2px $primary;

			.option-name {
				color: $primary;
			}

			.option-isin {
				color: $primary;
			}

		}

		&:hover {
			background: inherit;
			background-color: rgba(0, 0, 0, 0.027450980392156862);
			-moz-box-shadow: none;
			-webkit-box-shadow: none;
			box-shadow: none;
		}

		.option-name {
			width: 50%;
			font-weight: 400;
			font-style: normal;
			font-size: 14px;
			letter-spacing: normal;
			color: #333333;
			padding: 5px;
		}

		.option-isin {
			width: 30%;
			font-weight: 400;
			font-style: normal;
			font-size: 14px;
			letter-spacing: normal;
			color: #333333;
			padding: 5px;
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
		}

	}

	.uds_modal_footer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

</style>
