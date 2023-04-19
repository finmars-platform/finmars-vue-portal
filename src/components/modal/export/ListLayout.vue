<template>
	<BaseModal title="Export layout"
						 :modelValue="modelValue"

						 @update:modelValue="newVal => emit('update:modelValue', newVal)">
		<div>
			<FmInputText label="File Name"
									 v-model="fileName" />
		</div>

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel()">CLOSE</FmBtn>


				<FmBtn type="primary"
							 @click="exportConfig">EXPORT</FmBtn>
				<a ref="downloadLink" class="display-none"></a>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import dayjs from "dayjs";

	const layoutsStore = useLayoutsStore();

	let props = defineProps({
		modelValue: Boolean,
		isReport: Boolean,
		layout: Object,
	})

	let emit = defineEmits(['update:modelValue'])

	let downloadLink = ref(null);
	let layout = null;
	let downloadUrl = '';

	if (props.layout) layout = JSON.parse(JSON.stringify(props.layout));

	let fileName = ref('');

	watch(
		() => props.modelValue,
		dialogOpened => {

			if (dialogOpened) {

				layout = JSON.parse(JSON.stringify(props.layout));
				fileName.value = layout.name;

				setDownloadUrl();

			}

		}
	)

	function exportConfig() {

		downloadLink.value.href = downloadUrl;

		if (fileName.value) {
			downloadLink.value.download = fileName.value + '.fcfg';
		} else {
			downloadLink.value.download = 'layout.fcfg';
		}

		downloadLink.value.click();

		emit('update:modelValue', false);

	}

	async function fetchLayoutForSplitPanel() {

		const userCode = layout.data.additions.layoutData.user_code;
		const contentType = layout.data.additions.layoutData.content_type;

		const res = await layoutsStore.getLayoutByUserCode(contentType, userCode);

		if (!res || res.error) {

			console.error(`Failed to get layout with user code "${userCode}" for split panel`);

			useNotify({
				type: 'error',
				title: `Failed to get layout with user code "${userCode}" for split panel`
			})

			if (res.error) console.error(res.error);

			return null;

		}

		return res;

	}

	async function setDownloadUrl () {

		let reportLayouts = [];
		let listLayouts = [];

		if (props.isReport) {

			reportLayouts.push(layout);

			if (layout.data.additions.layoutData) { // layout has split panel

				const res = await fetchLayoutForSplitPanel();
				if (res) reportLayouts.push(res);

			}

		} else {
			listLayouts.push(layout);
		}

		console.log('reportLayouts', reportLayouts);

		var configuration = {
			"head": {
				"date": new Date().toISOString().slice(0, 10) // yyyy-mm-dd
			},
			"body": [
				{
					"section_name": "configuration",
					"items": [
						{
							"entity": "ui.reportlayout",
							"content": reportLayouts,
							"count": reportLayouts.length
						}
					]
				}
			]
		};

		if (listLayouts.length) {

			configuration['body'][0]['items'].push(
				{
					"entity": "ui.listlayout",
					"content": listLayouts,
					"count": listLayouts.length
				}
			)
		}


		var text = JSON.stringify(configuration);

		var file = new Blob([text], {type: 'text/plain'});

		/*downloadLink.value.href = URL.createObjectURL(file);

		downloadLink.value.addEventListener('click', function () {

			if (fileName.value) {
				downloadLink.value.download = fileName.value + '.fcfg';
			} else {
				downloadLink.value.download = 'layout.fcfg';
			}

			emit('update:modalValue', false);
		})*/

		downloadUrl = URL.createObjectURL(file);

	}

</script>

<style lang="scss" scoped>

</style>
