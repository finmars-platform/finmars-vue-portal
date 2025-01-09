<template>
	<div class="attributes-block">
		<div class="attributes-block__header" @click="isCollapsed = !isCollapsed">
			{{ block.title }}

			<FmIcon
				:icon="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
				color="var(--on-surface)"
			/>
		</div>

		<Transition name="fade" mode="out-in">
			<div v-if="!isCollapsed" class="attributes-block__body">
				<div class="attributes-block__actions">
					<FmButton rounded @click="openAttributeTypeDialog(null)">
						Add New
					</FmButton>

					<FmButton rounded type="tertiary" @click="showHidden = !showHidden">
						{{ showHidden ? 'Hide ' : 'Show Hidden ' }} Attributes
					</FmButton>
				</div>

				<div v-if="!size(attributes)" class="attributes-block__empty">
					You could add new user attributes here
				</div>

				<div v-else>
					<UserAttribute
						v-for="attr in filteredAttributes"
						:key="attr.id"
						:attr="attr"
						@action="handleActions"
					/>
				</div>
			</div>
		</Transition>

		<div v-if="isLoading" class="attributes-block__loader">
			<FmProgressCircular indeterminate size="48" />
		</div>

		<AttributeTypeDialog
			v-if="isDialogOpen"
			:id="selectedAttrId"
			:entity-type="block.key"
			@close="closeAttributeTypeDialog"
		/>
	</div>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import size from 'lodash/size';
	import { FmButton, FmIcon, FmProgressCircular } from '@finmars/ui';
	import { getEntitiesWithoutDynamicAttrsList } from '~/services/meta/metaNotificationClassService';
	import useApi from '~/composables/useApi';
	import UserAttribute from '~/components/pages/configuration/user-attributes/UserAttribute.vue';
	import AttributeTypeDialog from '~/components/modal/AttributeTypeDialog/AttributeTypeDialog.vue';

	const props = defineProps({
		block: {
			type: Object,
			required: true
		}
	});

	const isLoading = ref(false);
	const isCollapsed = ref(false);
	const showHidden = ref(false);
	const attributes = ref([]);

	const isDialogOpen = ref(false);
	const selectedAttrId = ref(null);

	const filteredAttributes = computed(() =>
		showHidden.value
			? attributes.value
			: attributes.value.filter((a) => !a.is_hidden)
	);

	function openAttributeTypeDialog(id) {
		console.log('openAttributeTypeDialog: ', id);
		id && (selectedAttrId.value = id);
		isDialogOpen.value = true;
	}

	async function closeAttributeTypeDialog(shouldRefreshData) {
		console.log('closeAttributeTypeDialog: ', shouldRefreshData);
		isDialogOpen.value = false;
		selectedAttrId.value = null;
		shouldRefreshData && (await getAttributes());
	}

	function handleActions({ action, value }) {
		console.log('handleActions: ', action, value);
		switch (action) {
			case 'edit':
				openAttributeTypeDialog(value);
				break;
		}
	}

	async function getAttributes() {
		if (getEntitiesWithoutDynamicAttrsList().includes(props.block.key)) {
			return;
		}

		try {
			isLoading.value = true;
			const res = await useApi(`${props.block.apiRoute}.get`, {
				filters: {
					page: 1,
					page_size: 10000
				}
			});
			res && res.results && (attributes.value = res.results);
		} catch (err) {
			console.error(
				`The error of the "${props.block.key}" attributes loading. `,
				err
			);
		} finally {
			isLoading.value = false;
		}
	}

	onBeforeMount(async () => {
		await getAttributes();
	});
</script>

<style lang="scss" scoped>
	.attributes-block {
		position: relative;
		width: 100%;
		color: var(--on-surface);
		margin-bottom: 30px;

		&__header {
			position: relative;
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 8px;
			border-bottom: 1px solid var(--outline-variant);
			font: var(--title-medium-font);
			cursor: pointer;

			&:hover {
				color: var(--primary);
				border-bottom: 1px solid var(--primary);

				i {
					color: var(--primary) !important;
				}
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			padding: 16px 0;
			justify-content: space-between;
			align-items: center;

			button {
				text-transform: none;
			}
		}

		&__empty {
			position: relative;
			width: 100%;
			padding: 8px 0;
			font: var(--body-large-font);
			text-align: center;
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
