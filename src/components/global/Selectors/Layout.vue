<template>
	<div class="flex-row">
<!--		<FmSelect
			v-if="content_type"
			:items="portfolios"
			label="Layout"
			prop_name="name"
			prop_id="name"
			:modelValue="layoutName"
			@update:modelValue="getData($event), (layoutName = $event)"
		/>

		<FmBtn v-if="layoutName" @click="isOpenCode = true">Edit layout</FmBtn>-->
		<div class="flex-0-1-100">
			<FmSelect
				label="Layout"
				:modelValue="selLayoutUc"
				:items="layoutsList"
				prop_id="user_code"
				:disabled="loadingLayout"
				@update:modelValue="fetchLayout"
			>
				<template #left_icon>
					<FmBtn
						v-if="!loadingLayout"
						type="icon"
						icon="menu"
						@click.stop="isOpenCode = true"
					/>

					<div v-if="loadingLayout" v-fm-tooltip.error="'Loading layout'">
						<FmLoader />
					</div>
				</template>
			</FmSelect>
		</div>

		<div style="flex: 0 0 180px;">
			<FmSelect
				title="Report type"
				:modelValue="content_type"
				:items="contentTypeOpts"
				:disabled="loadingLayout"
				@update:modelValue="newVal => emit('update:content_type', newVal)"
			/>
		</div>

		<BaseModal
			v-model="isOpenCode"
			no_padding
			title="Edit layout"
			:controls="{
				cancel: { name: 'Cancel', cb: cancelLayoutEdition },
				action: { name: 'Save', cb: saveLayout },
			}"
			style="z-index: 500"
		>
			<v-ace-editor
				v-model:value="layoutString"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="width: 90vw; height: 80vh"
			/>
		</BaseModal>
	</div>
</template>

<script setup>
	import { VAceEditor } from 'vue3-ace-editor'
	import 'ace-builds/src-noconflict/mode-json'
	import 'ace-builds/src-noconflict/theme-monokai'

	const layoutsStore = useLayoutsStore();

	// const props = defineProps(['settings', 'layout'])
	const props = defineProps({
		modelValue: String, // stringified object of layout
		content_type: {
			type: String,
			default: 'reports.balancereport',
		},
	})

	const emit = defineEmits(['update:modelValue', 'update:content_type', 'userCodeChanged'])

	const loadingLayout = ref(false);
	const contentTypeOpts = [
		{ id: 'reports.balancereport', name: 'Balance report' },
		{ id: 'reports.plreport', name: 'P&L report' },
		{ id: 'reports.transactionreport', name: 'Transaction report' },
	];

	watch(
		() => props.content_type,
		async () => {
			layoutsList.value = await layoutsStore.getListLayoutsLight(props.content_type);
		}
	)

	let layoutsList = ref([])
	// let content_type = ref(props.contentType);
	// let layoutName = ref('')
	let layoutString = ref('{}')

	if (props.modelValue) {
		// layoutName.value = JSON.parse(props.layout).name
		layoutString.value = props.modelValue;
	}

	watch(
		() => props.modelValue,
		() => {
			layoutString.value = props.modelValue || '{}';
		}
	)

	let isOpenCode = ref(false)

	/*if (props.settings.find((o) => o.key == 'content_type')) {
		let stg = props.settings.find((o) => o.key == 'content_type')

		content_type.value = stg.default_value

		init()
	}

	watch(
		props.settings,
		() => {
			let stg = props.settings.find((o) => o.key == 'content_type')

			content_type.value = stg.default_value

			init()
		},
		{ deep: true }
	)*/

	let selLayoutUc = computed(() => {
;
		if ( props.modelValue ) {
			return JSON.parse(props.modelValue).user_code;
		}

		return null;

	});

	function editorInit(editor) {
		editor.setHighlightActiveLine(false)
		editor.setShowPrintMargin(false)
		editor.setFontSize(14)
		editor.setBehavioursEnabled(true)

		editor.focus()
		editor.navigateFileStart()
	}

	async function fetchLayout(userCode) {
		/*let res = await useApi('listLayoutList.get', {
			filters: {
				user_code: userCode,
			},
		})*/
		loadingLayout.value = true;
		let res = await layoutsStore.getLayoutByUserCode(props.content_type, userCode);

		if (!res.error) {

			layoutString.value = JSON.stringify(res, null, 4);

			emit('userCodeChanged', res.user_code);
			emit('update:modelValue', layoutString.value);

		}

		loadingLayout.value = false;

	}

	function cancelLayoutEdition() {
		isOpenCode.value = false;
		layoutString.value = props.modelValue;
	}

	function saveLayout() {
		emit('update:modelValue', layoutString.value)
	}

	async function init() {
		/*let res = await useApi('listLayoutListLight.get', {
			filters: {
				content_type: content_type.value,
			},
		})

		portfolios.value = res.results*/
		layoutsList.value = await layoutsStore.getListLayoutsLight(props.content_type);
	}

	init();
</script>

<style lang="scss" scoped></style>
