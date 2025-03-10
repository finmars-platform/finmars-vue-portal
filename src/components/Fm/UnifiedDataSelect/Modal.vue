<template>
	<BaseModal title="Results" :modelValue="opened" @close="cancel">
		<div class="uds_modal">
			<div class="flex-row">
				<div style="width: 383px">
					<FmInputText
						placeholder="Search"
						class="m-r-8"
						:modelValue="inputText"
						@update:modelValue="filterItems"
					/>
				</div>
			</div>

			<div class="database-table-head">
				<div style="width: 50%; padding: 5px">Name</div>

				<div style="width: 30%; padding: 5px">Code</div>
			</div>

			<div class="database-table-body">
				<div v-if="!processing" style="height: 359px; overflow-y: auto">
					<span
						v-if="localItems.length"
						class="options-group-title text-bold"
						>Local Records ({{ localItemsTotal }})</span
					>

					<div v-if="localItems.length">
						<div
							v-for="option in localItems"
							@click="selItem = option"
							@dblclick="
								() => {
									selItem = option;
									save();
								}
							"
							class="database-option-row"
							:class="{
								active: option.user_code === selItem.user_code
							}"
						>
							<div
								class="option-name"
								:title="`${option.name}`"
								v-html="getHighlighted(option.name)"
							></div>

							<div
								class="option-isin"
								:title="`${option.user_code}`"
								v-html="getHighlighted(option.user_code)"
							></div>
						</div>

						<!--						<div>
													<FmBtn
														v-if="localPages < localPagesTotal"
														v-show="!loadingLocal"
														type="basic"
														class="control-button load-more"
														@click="loadMoreLocalItems($event)"
													>Load more</FmBtn>

													<FmLoader v-if="loadingLocal" />
												</div>-->
					</div>

					<span
						v-if="databaseItems.length"
						class="options-group-title"
						style="bottom: 0px"
						>Global Records ({{ databaseItemsTotal }})</span
					>

					<div v-if="databaseItems.length">
						<div
							v-for="option in databaseItems"
							@click="() => (selItem = option)"
							@dblclick="
								() => {
									selItem = option;
									save();
								}
							"
							class="database-option-row"
							:class="{
								active: option.user_code === selItem.user_code
							}"
						>
							<div
								class="option-name"
								:title="`${option.name}`"
								v-html="getHighlighted(option.name)"
							></div>

							<div
								class="option-isin"
								:title="`${option.user_code}`"
								v-html="getHighlighted(option.user_code)"
							></div>
						</div>

						<FmBtn
							v-if="dbPages < dbPagesTotal"
							v-show="!loadingFromDb"
							type="basic"
							class="control-button load-more"
							@click="loadMoreGlobalItems()"
							>Load more
						</FmBtn>

						<FmLoader v-if="loadingFromDb" />
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
													 type="icon"
													 icon="lock"
													 tooltip="Show more"
													 @click="showActions = true"></FmBtn>

										<div v-if="showActions"
												 class="flex-row">
											<FmBtn type="icon"
														 icon="add"
														 tooltip="Create new"
														 @click="showActions = true"></FmBtn>
										</div>-->
				</div>

				<div>
					<FmBtn type="basic" class="m-r-8" @click="cancel()"
						>CANCEL</FmBtn
					>

					<FmBtn type="basic" :disabled="saving" @click="save()">
						<span v-if="!saving">ok</span>

						<!-- <div v-if="saving" v-tooltip="'Starting import from unified database'">
							<FmLoader />
						</div>-->
						<div v-if="saving">
							<FmLoader />
						</div>
					</FmBtn>
				</div>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	/* eslint-disable */
	import * as commonMethods from './helper';

	let props = defineProps({
		opened: Boolean,
		selectedItem: Object,
		propId: {
			type: String,
			default: 'id'
		},
		content_type: String
	});

	let emit = defineEmits([
		'update:opened',
		'databaseItemSelected',
		'localItemSelected'
	]);

	let processing = ref(false);
	let loadingLocal = ref(false); // Will be used for loadMoreLocalItems method
	let loadingFromDb = ref(false);
	let saving = ref(false);

	let databaseItemsTotal = ref(0);
	let databaseItems = ref([]);
	// let selDatabaseItem = ref({});

	let dbPages = ref(1);

	let dbPagesTotal = computed(() => {
		return databaseItemsTotal.value
			? Math.round(databaseItemsTotal.value / 40)
			: 0;
	});

	let localItemsTotal = ref(0);
	let localItems = ref([]);
	// let selLocalItem = ref({});
	let localPages = ref(1); // TODO: implement after adding pagination for local item on backend

	let selItem = ref({});

	let localPagesTotal = computed(() => {
		// TODO: implement after adding pagination for local item on backend
		return localItemsTotal.value
			? Math.round(localItemsTotal.value / 40)
			: 0;
	});

	// let inputText = ref(props.parentInputText);
	let inputText = ref('');

	let showActions = ref(false);

	watch(
		() => props.opened,
		() => {
			if (!props.opened) return;

			if (props.selectedItem.id || props.selectedItem.user_code) {
				selItem.value = props.selectedItem;
			}

			getList();
		}
	);

	const filterItems = useDebounce(function (filterVal) {
		inputText.value = filterVal;

		dbPages.value = 1;

		getList(inputText.value);
	}, 500);

	function getHighlighted(value) {
		return commonMethods.getHighlighted(inputText.value, value);
	}

	async function getList(filterTerms) {
		processing.value = true;

		const res = await commonMethods.getList(
			props.content_type,
			filterTerms
		);

		databaseItems.value = res.databaseData.items;
		databaseItemsTotal.value = res.databaseData.itemsTotal;

		localItems.value = res.localData.items;
		localItemsTotal.value = res.localData.itemsTotal;

		processing.value = false;
	}

	/* // TODO: implement after adding pagination for local item on backend

	async function loadMoreLocalItems() {

		loadingLocal.value = true;
		const nextPage = localPages.value + 1;

		const res = await commonMethods.fetchLocalEntities(props.content_type, inputText.value, nextPage);

		if (!res._$error) {
			// do not increase page if error occurred
			localPages.value = nextPage;
			databaseItems.value = databaseItems.value.concat(res.items);
		}

		loadingLocal.value = false;

	} */

	function selectDatabaseItem(item) {
		selLocalItem.value = {};
		selDatabaseItem.value = item;
	}

	async function loadMoreGlobalItems() {
		loadingFromDb.value = true;
		const nextPage = dbPages.value + 1;

		const res = await commonMethods.fetchDatabaseEntities(
			props.content_type,
			inputText.value,
			nextPage
		);

		if (!res._$error) {
			// do not increase page if error occurred
			dbPages.value = nextPage;

			const items = commonMethods.filterDatabaseItems(
				res.items,
				localItems.value
			);

			databaseItems.value = databaseItems.value.concat(items);
		}

		loadingFromDb.value = false;
	}

	function cancel() {
		emit('update:opened', false);

		selItem.value = {};
	}

	async function save() {
		const sameItemSelected =
			props.modelValue &&
			props.modelValue[props.propId] === selItem.value[props.propId];

		if (!Object.keys(selItem).length || sameItemSelected) {
			cancel();
			return;
		}

		if (selItem.value.frontOptions.type === 'database') {
			saving.value = true;

			const res = await commonMethods.startImport(
				props.content_type,
				JSON.parse(JSON.stringify(selItem.value))
			);

			if (Object.keys(res).length === 1 && res._$error) {
				saving.value = false;

				return;
			} else if (res.errors) {
				// TODO: Investigate. This if never triggers.

				useNotify({ type: 'error', title: res.errors });

				saving.value = false;

				return;
			} else {
				res.id = selItem.value.id;
				emit('databaseItemSelected', res);
			}
			// emit( 'databaseItemSelected', JSON.parse(JSON.stringify( selDatabaseItem.value )) );
		} else {
			delete selItem.value.frontOptions;

			emit(
				'localItemSelected',
				JSON.parse(JSON.stringify(selItem.value))
			);
		}

		selItem.value = {};
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
		padding: 13px 10px 0 10px;
		font-size: 13px;
		color: #666;
		box-sizing: border-box;
		height: 56px;
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
		font-weight: 600;
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
			color: var(--primary-color);
			outline: solid 2px var(--primary-color);

			.option-name {
				color: var(--primary-color);
			}

			.option-isin {
				color: var(--primary-color);
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
