<template>
	<FmMenu
		v-model:opened="menuIsOpened"
		:disabled="loadingLayout"
		v-bind="$attrs"
	>
		<template #btn="{ isOpen }">
			<FmBtn
				type="text"
				class="lm_open_btn flex-row flex-c-space-between flex-i-center"
				:disabled="loadingLayout"
			>
				<FmIcon icon="view_quilt" class="m-r-8" />

				<span>{{ activeLayout.name }}</span>

				<FmIcon
					:icon="isOpen ? 'arrow_drop_up' : 'arrow_drop_down'"
					style="cursor: inherit"
				/>
			</FmBtn>
		</template>

		<template #default="{ close }">
			<div class="layouts_manager_menu">
				<div class="divider_bottom">
					<FmBtn
						type="text"
						class="menu_item"
						@click="emit('createNewLayout'), close()"
					>
						<span class="material-icons">add_circle</span>
						New layout
					</FmBtn>
				</div>

				<div class="layouts_container divider_bottom">
					<div v-if="!loadingLayoutsList">
						<div
							v-for="layout in layouts"
							:key="layout.id"
							class="menu_item"
						>
							<span
								v-if="
									!layout.origin_for_global_layout &&
									!layout.sourced_from_global_layout
								"
								class="material-icons default_icons"
								:class="{
									default_layout: isLayoutDefault(layout)
								}"
								@click.prevent.stop="setAsDefault(layout)"
								>home</span
							>

							<span
								v-if="layout.origin_for_global_layout"
								class="material-icons default_icons"
								style="color: #747474"
								>share</span
							>

							<span
								v-if="
									!layout.origin_for_global_layout &&
									layout.sourced_from_global_layout
								"
								class="material-icons default_icons"
								style="color: #747474"
								>update</span
							>

							<NuxtLink
								:to="
									$router.resolve({
										name: $route.name,
										query: { layout: layout.user_code }
									})
								"
								class="a_item"
							>
								<div
									@click.prevent.stop="
										onLayoutLinkClick(layout.id, close)
									"
								>
									{{ layout.name }}
								</div>
							</NuxtLink>
						</div>

						<div v-if="autosaveLayout" class="menu_item">
							<span
								class="material-icons default_icons"
								:class="{
									default_layout:
										isLayoutDefault(autosaveLayout)
								}"
								@click.prevent.stop="
									setAsDefault(autosaveLayout)
								"
								>home</span
							>

							<NuxtLink
								:to="
									$router.resolve({
										name: $route.name,
										query: {
											layout: autosaveLayout.user_code
										}
									})
								"
								class="a_item"
							>
								<div
									@click.prevent.stop="
										onLayoutLinkClick(
											autosaveLayout.id,
											close
										)
									"
								>
									{{ autosaveLayout.name }}
								</div>
							</NuxtLink>
						</div>
					</div>

					<div v-if="loadingLayoutsList" class="flex-row fc-center">
						<FmLoader />
					</div>
				</div>

				<div class="divider_bottom">
					<slot name="middleActions">
						<FmBtn
							type="text"
							class="menu_item"
							:disabled="!'viewerData.newLayout'"
							@click="emit('save')"
						>
							<span class="material-icons">save</span>
							Save
						</FmBtn>

						<!--					<div class="menu_item" @-click="emit('saveAs')">
												<span class="material-icons" style="visibility: hidden;">save</span>
												<span>Save as</span>
											</div>-->
						<FmBtn
							type="text"
							class="menu_item"
							@-click="emit('saveAs'), close()"
						>
							<span class="material-icons"></span>
							Save as
						</FmBtn>

						<!--						Will be develop in context of FN-908

<FmBtn type="text"
									 class="menu_item"
									 @click="emit('openLayoutsList'), close()">
							<span class="material-icons"></span>
							Open
						</FmBtn>-->
					</slot>
				</div>

				<!--		TODO Insert using slot inside dashboardLayoutsManager
				<div ng-if="viewContext === 'dashboard'">

							<div class="menu_item" data-ng-click="saveLayoutList()">
								<span class="material-icons">save</span>
								<span>Save</span>
							</div>

							<div class="menu_item" data-ng-click="openLayoutList($event)">
								<span class="material-icons" style="visibility: hidden;">open_in_new</span>
								<span>Open</span>
							</div>

							<div class="menu_item" data-ng-click="makeCopy($event)">
								<span class="material-icons">duplicate</span>
								<span>Make copy</span>
							</div>

							<div class="menu_item" data-ng-click="editDashboardLayout()">
								<span class="material-icons" style="visibility: hidden">edit</span>
								<span>Edit Dashboard Layout</span>
							</div>

						</div>-->

				<div class="divider_bottom">
					<FmBtn
						type="text"
						class="menu_item"
						@click="emit('export'), close()"
					>
						<span class="material-icons">exit_to_app</span>
						Export
					</FmBtn>

					<!--		TODO make package manager component
					<div class="menu_item" package-manager-button data-ng-click="parentPopup.cancel()"
									 content-type="'ui.listlayout'" target-content-type="targetContentType">
								<span class="material-icons">system_update_alt</span>
								<span>Select from list</span>
							</div>-->
					<!--					<FmBtn type="text"
								 class="menu_item">
						<span class="material-icons">system_update_alt</span>
						Select from list
					</FmBtn>-->

					<!--					<div class="menu_item"
							 @click="emit('openInvites')" :class="{'disabled-btn': !invites.length}">
						<span class="material-icons">email</span>
						<span>Invites ({{invites.length}})</span>
					</div>-->
					<!--

<FmBtn type="text"
								 class="menu_item"
								 :disabled="!invitesList.length"
								 @click="invitesIsOpened = true, close()">
						<span class="material-icons">email</span>
						Invites ({{ invitesList.length }})
					</FmBtn>-->

					<FmBtn
						type="text"
						class="menu_item"
						:disabled="activeLayout.newLayout"
						@click="(renameIsOpened = true), close()"
					>
						<span class="material-icons">create</span>
						Rename
					</FmBtn>

					<!-- <div data-ng-if="layout.sourced_from_global_layout && !layout.origin_for_global_layout"
									 class="menu_item"
									 data-ng-click="pullUpdate($event)">
								<span class="material-icons">share</span>
								<span>Update</span>
							</div>

							<div class="menu_item" data-ng-click="shareLayout($event)"
									 data-ng-if="layout.id !== autosaveLayout.id && ((!layout.sourced_from_global_layout && !layout.origin_for_global_layout) || (layout.sourced_from_global_layout && layout.origin_for_global_layout))">
								<span class="material-icons">share</span>
								<span>Share</span>
							</div>

							-->

					<!--					Maybe will be used again

<FmBtn v-if="availableForUpdating"
								 type="text"
								 class="menu_item"
								 @click="">
						<span class="material-icons">share</span>
						Update
					</FmBtn>-->

					<!--					Maybe will be used again

<FmBtn v-if="availableForSharing"
								 type="text"
								 class="menu_item"
								 @click="sharingIsOpened = true, close()">
						<span class="material-icons">share</span>
						Share
					</FmBtn>-->

					<FmBtn
						type="text"
						class="menu_item"
						:disabled="'viewerData.newLayout || viewerData.listLayout.is_default'"
						@click="emit('setAsDefault')"
					>
						<span class="material-icons">home</span>
						Make default
					</FmBtn>
				</div>

				<!--		<md-button class="menu_item"
											 data-ng-click="deleteLayout($event)"
											 data-ng-disabled="isNewLayout || layout.id === autosaveLayout.id">
							<span class="material-icons">delete</span>
							<span>Delete</span>
						</md-button>-->
				<FmBtn type="text" class="menu_item" @click="deleteLayout">
					<span class="material-icons">delete</span>
					Delete
				</FmBtn>
			</div>
		</template>
	</FmMenu>

	<ModalNameUserCode
		title="Rename layout"
		:name="activeLayout.name"
		:user_code="activeLayout.user_code"
		:content_type="content_type"
		:occupiedUserCodes="occupiedUserCodes"
		v-model="renameIsOpened"
		@save="renameLayout"
	/>

	<!-- <ModalLayoutShare :layout="viewerData.listLayout"
										:layoutType="viewerData.isReport ? 'ui.reportlayout' : 'ui.listlayout'"
										v-model="sharingIsOpened" /> -->
</template>

<script setup>
	/* eslint-disable */
	let props = defineProps({
		activeLayout: Object,
		layouts: Array,
		autosaveLayout: Object,
		loadingLayout: Boolean,
		loadingLayoutsList: Boolean,
		content_type: String,

		isLayoutDefault: Function
	});

	// const viewerData = inject('viewerData');

	let emit = defineEmits([
		'createNewLayout',
		'changeLayout',
		'setAsDefault',
		'save',
		'saveAs',
		'export',
		'openLayoutsList',
		'openInvites',
		'rename',
		'delete'
	]);

	let invitesList = ref([]);

	let menuIsOpened = ref(false);
	let renameIsOpened = ref(false);
	let showDeletionWarning = ref(false);
	let sharingIsOpened = ref(false);

	/* Maybe will be used again

	let invitesIsOpened = ref(false);

	let availableForUpdating = computed(() => viewerData.listLayout.sourced_from_global_layout && !viewerData.listLayout.origin_for_global_layout);
	let availableForSharing = computed(() => {

		const notAnAutosave = !props.autosaveLayout || viewerData.listLayout.id !== props.autosaveLayout.id

		return notAnAutosave &&
			((!viewerData.listLayout.sourced_from_global_layout && !viewerData.listLayout.origin_for_global_layout) || (viewerData.listLayout.sourced_from_global_layout && viewerData.listLayout.origin_for_global_layout));

	});
	*/

	let occupiedUserCodes = computed(() => {
		return props.layouts
			.filter((lLayout) => {
				return lLayout.user_code !== 'viewerData.listLayout.user_code';
			})
			.map((lLayout) => lLayout.user_code);
	});

	let isLayoutDefault = (layout) => layout.is_default;

	if (props.isLayoutDefault) {
		isLayoutDefault = (layout) => props.isLayoutDefault(layout);
	}

	function setAsDefault(layoutLight) {
		if (!isLayoutDefault(layoutLight)) {
			emit('setAsDefault', JSON.parse(JSON.stringify(layoutLight)));
		}
	}

	function onLayoutLinkClick(layoutId, closeMenuFn) {
		/*scope.parentPopup.cancel();
		$event.preventDefault();

		scope.dashboardDataService.setLayoutToOpen(layout);
		scope.dashboardEventService.dispatchEvent(dashboardEvents.DASHBOARD_LAYOUT_CHANGE)*/
		// TODO write function for vue

		closeMenuFn();
		emit('changeLayout', layoutId);
	}

	function renameLayout(newNamesData) {
		emit('rename', newNamesData);
		renameIsOpened.value = false;
	}

	async function deleteLayout() {
		let confirm = await useConfirm({
			title: 'Confirm action',
			text: ` Are you sure to delete Custom Column "${props.activeLayout.name}"  ?`
		});

		if (confirm) {
			emit('delete');
		}
	}

	async function fetchInvites() {
		const res = await useApi('configSharingMyInvitesList.get', {
			filters: { status: '0' },
			notifyError: false
		});

		if (!res._$error) invitesList.value = res.results;
	}

	fetchInvites();
</script>

<style lang="scss" scoped>
	$main: #fafafa;
	$border: #e0e0e0;
	$layout-manager-item-height: 48px;
	$opts-borders: 1px solid $border;

	:deep(.lm_open_btn.fm_btn) {
		padding: 0;
		text-transform: none;
		font-weight: 400;
	}

	.layouts_manager_menu {
		width: 370px;
		max-height: 100%;
		font-size: 14px;
	}

	.layouts_manager_menu :deep(.material-icons) {
		color: var(--primary-color) !important;
	}

	.divider_bottom {
		border-bottom: $opts-borders;
	}

	.menu_item {
		display: flex;
		align-items: center;

		height: 48px;

		color: var(--card-secondary-text-color);

		&.default_layout {
			opacity: 0.5;
		}

		.material-icons {
			width: 72px;
			height: 100%;

			text-align: center;
			line-height: $layout-manager-item-height;

			flex: 0 0 auto;

			&:focus {
				outline: none;
			}

			&.default_icons {
				color: #fff;

				&.default_layout {
					color: var(--card-secondary-text-color);
				}

				&:hover {
					color: var(--card-secondary-text-color);
				}
			}
		}

		&:not([disabled]) {
			cursor: pointer;
		}

		&:focus {
			outline: none;
		}

		&:hover {
			background-color: $main;
		}

		.a_item {
			display: block;
			height: 100%;
			flex-grow: 1;
			line-height: $layout-manager-item-height;
			text-decoration: none;
			color: var(--card-secondary-text-color);

			width: 100%;
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: pre;

			&:focus {
				outline: none;
			}
		}
	}

	:deep(button.menu_item.fm_btn) {
		width: 100%;
		margin: 0;
		padding: 0;
		text-transform: none;
		border-radius: initial;
		font-weight: 400;
		color: var(--card-secondary-text-color);

		&:not([disabled]):hover {
			background-color: $main;
		}
	}

	.layouts_container {
		max-height: 300px;
		overflow-y: scroll;
	}
</style>
