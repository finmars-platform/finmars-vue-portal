<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div
			v-if="loading"
			class="flex w-full justify-center items-center min-h-36"
		>
			<FmProgressCircular :size="32" indeterminate />
		</div>
		<template v-else>
			<div class="flex gap-2 w-full p-5">
				<div class="w-1/5">
					<FmTextField
						v-model="layout.name"
						:rules="[rules.required]"
						label="Context Menu Layout Name"
						outlined
					/>
				</div>
				<div class="code-wrapper">
					<div class="flex flex-row gap-1">
						<div class="w-1/3">
							<FmSelect
								v-model="layout.configuration_code"
								:options="configCodeOptions"
								label="Configuration"
								variant="outlined"
							/>
							<span v-if="!layout.configuration_code" class="error-text">
								Field is required
							</span>
						</div>
						<div class="w-full">
							<FmTextField
								v-model="layout.user_code"
								:rules="[rules.required]"
								label="User Code"
								outlined
							/>
						</div>
					</div>
					<i class="code-result">
						Result: {{ layout.configuration_code }}:{{ layout.user_code }}
					</i>
				</div>
				<div class="w-1/5">
					<FmSelect
						v-model="layout.type"
						:options="typeOptions"
						variant="outlined"
					/>
				</div>
			</div>
			<div class="root-content">
				<span class="mb-2">Root</span>
				<RecursiveOption
					v-for="item in layout.data.menu.root.items"
					:key="item.order"
					:item="item"
					:list="layout.data.menu.root.items"
					@update-list="updateList"
				/>
				<FmButton
					type="tertiary"
					@click="openModal"
					prepend-icon="mdi-plus"
					rounded
					class="mt-2"
				>
					Add Option
				</FmButton>
			</div>
			<FmButton
				type="primary"
				@click="saveLayout"
				:disabled="!layout.name || !layout.configuration_code"
				rounded
				class="mx-5 mb-5 mt-4"
			>
				Save
			</FmButton>
			<template v-if="showModal">
				<OptionModal
					v-model="showModal"
					@create="addNewOption"
					@close="closeModal"
				/>
			</template>
		</template>
	</div>
</template>

<script setup>
	import RecursiveOption from '@/pages/configuration/context-menu-layouts/recursive-option/index.vue';
	import OptionModal from '@/pages/configuration/context-menu-layouts/new-option-modal/index.vue';
	import {
		FmBreadcrumbs,
		FmButton,
		FmSelect,
		FmTextField,
		FmProgressCircular
	} from '@finmars/ui';
	import { getRealmSpaceCodes } from '~/pages/system/helper';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Context Menu Layouts', path: 'context-menu-layouts' },
		{ title: 'Edit', path: 'edit' }
	]);
	const typeOptions = ref([
		{ title: 'Report Right Click', value: 'report_context_menu' },
		{ title: 'Report Menu Add Entities', value: 'report_menu_add_entities' }
	]);
	const layout = ref({
		name: '',
		user_code: '',
		configuration_code: '',
		type: 'report_context_menu',
		data: {
			menu: {
				root: {
					items: []
				}
			}
		}
	});

	const configCodeOptions = ref([]);
	const loading = ref(false);
	const showModal = ref(false);

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/configuration` + newPath);
	};

	const addNewOption = (elem) => {
		layout.value.data.menu.root.items.push({
			name: elem.name,
			action: elem.action,
			order: layout.value.data.menu.root.items.length.toString()
		});
		updateList(layout.value.data.menu.root.items);
		closeModal();
	};

	const openModal = () => {
		showModal.value = true;
	};

	const closeModal = () => {
		showModal.value = false;
	};

	const updateList = (newList) => {
		if (newList) {
			newList.forEach((item, index) => {
				item.order = index.toString();
				if (item.children) {
					updateList(item.children);
				}
			});
			layout.value.data.menu.root.items = newList;
		}
	};

	async function getConfigList() {
		try {
			const res = await useApi('configurationList.get');
			if (res.results) {
				configCodeOptions.value = res.results.map((result) => {
					return {
						title: result.configuration_code,
						value: result.configuration_code
					};
				});
			} else {
				configCodeOptions.value = [{ title: 'No codes !', value: '' }];
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function saveLayout() {
		try {
			loading.value = true;
			layout.value.user_code = `${layout.value.configuration_code}:${layout.value.user_code}`;
			const res = await useApi('contextMenuLayoutList.put', {
				params: { id: layout.value.id },
				body: layout.value
			});
			if (res?.id) {
				useNotify({ type: 'success', title: 'Updated' });
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	async function init() {
		try {
			loading.value = true;
			await getConfigList();
			const res = await useApi('contextMenuLayout.get', {
				params: { id: route.params.id }
			});
			if (res?.id) {
				layout.value = res;
				layout.value.user_code = res.user_code.split(':')[1];
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	init();
</script>

<style scoped lang="scss">
	.code-wrapper {
		display: flex;
		flex-direction: column;
		width: 40%;
		min-width: 560px;
		border-radius: var(--spacing-4);
		border: 1px solid var(--border-color);
		padding: var(--spacing-12);
		.error-text {
			font-size: var(--spacing-12);
			color: var(--error-color);
			margin: var(--spacing-12);
		}
		.code-result {
			width: 100%;
			font-size: var(--spacing-12);
			line-height: var(--spacing-16);
			margin: var(--spacing-4) 0;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
	.root-content {
		display: flex;
		flex-direction: column;
		margin: var(--spacing-16);
		padding: var(--spacing-12);
		background-color: var(--activeState-backgroundColor);
	}
</style>
