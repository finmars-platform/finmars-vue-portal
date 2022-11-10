<template>
	<ModalNameUserCode title="New layout"
										 :name="viewerData.listLayout.name"
										 :modelValue="modelValue"

										 @update:modelValue="newVal => emit('update:modelValue', newVal)"
										 @save="saveLayout" />

	<ModalInfo title="Warning"
						 description="Layout with such user code already exists. Do you want to overwrite it?"
						 v-model="showWarning">

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>

				<FmBtn type="basic" @click="overwriteLayout">OVERWRITE</FmBtn>
			</div>
		</template>

	</ModalInfo>

</template>

<script setup>

	const layoutsStore = useLayoutsStore();
	const viewerData = inject('viewerData');

	let props = defineProps({
		modelValue: Boolean,
		// occupiedUserCodes: Array,
	});

	let emit = defineEmits(['update:modelValue', 'layoutSaved']);

	let showWarning = ref(false);

	// let layoutData = ref({});
	/*let newName = ref('');
	let newUserCode = ref('');*/

	let userCodesSet = computed(() => {
		return new Set(
			layoutsStore.listLayoutsLightData[viewerData.content_type].map(lLayout => lLayout.user_code) || []
		)
	});

	let overwriteData;

	function applyLayout(newLayout) {

		viewerData.listLayout = newLayout;
		// viewerData.setActiveLayoutConfiguration();
		viewerData.newLayout = false;

		emit('layoutSaved', JSON.parse(JSON.stringify(newLayout)));

	}

	async function overwriteLayout() {

		/*uiService.getListLayoutByUserCode(entityType, userCode).then(function (layoutToOverwriteData) {

			const layoutToOverwrite = layoutToOverwriteData.results[0];
			overwriteLayout(layoutToOverwrite, listLayout).then(function (updatedLayoutData) {

				applyLayout(isRootEntityViewer, evDataService, evEventService, updatedLayoutData);
				toastNotificationService.success("Success. Layout " + listLayout.name + " overwritten.");

				resolve({status: res.status});

			}).catch(error => reject({status: res.status, error: error}));

		});*/

		let res = await layoutsStore.getLayoutByUserCode(viewerData.listLayout.content_type, overwriteData.user_code);

		if (res.error) {
			return;
		}

		// const layoutToOverwriteId = res.id;

		const newLayoutData = viewerData.getLayoutCurrentConfiguration();

		res.data = newLayoutData.data;
		res.name = newLayoutData.name;

		const ovOptions = {
			params: {
				id: res.id,
			},
			body: res
		};

		showWarning.value = false;
		emit('update:modelValue', false);

		const updateRes = await useApi('listLayout.put', ovOptions);

		if (!updateRes.error) {

			applyLayout(updateRes);
			useNotify({type: 'success', title: `Success. Layout ${overwriteData.name} overwritten.`});

			showWarning.value = false;
			emit('update:modelValue', false);

		}

	}

	/** @param {{name: String, user_code: String}} namesData */
	async function saveLayout(namesData) {

		if (namesData.user_code.startsWith('system_autosave_')) {
			throw "This user code reserved for system layout. Please use another one";
		}

		if (userCodesSet.value.has(namesData.user_code)) {

			showWarning.value = true;
			overwriteData = namesData;
			return;

		}

		let newLayout = viewerData.getLayoutCurrentConfiguration();
		newLayout.name = namesData.name;
		newLayout.user_code = namesData.user_code;

		newLayout.is_default = viewerData.isRootEntityViewer; // default layout for split panel does not have is_default === true
		if (newLayout.id) delete newLayout.id; // if layout based on another existing layout

		emit('update:modelValue', false);

		/*uiService.createListLayout(entityType, listLayout).then(function (data) {

			applyLayout(isRootEntityViewer, evDataService, evEventService, data);
			toastNotificationService.success("Layout '" + listLayout.name + "' saved.");

			resolve({status: res.status, layoutData: data});

		}).catch(error => {
			reject({status: res.status, error: error});
		});*/
		let res = await useApi('listLayout.post', {body: newLayout});

		if (res.error) {

			// console.error(res.error);
			useNotify({type: 'error', title: res.error.message || res.error.detail});
			throw new Error(res.error);

		} else {

			useNotify({type: 'success', title: `Layout ${newLayout.name} saved.`});
			applyLayout(res);

		}

	}

	async function init() {

		const options = {
			filters: {
				content_type: "reports.performancereport",
				page_size: 1000,
			}
		};

		/*if (!props.occupiedUserCodes) {

			let res = await useApi('listLayoutListLight.get', options);

			if (res.error) {
				console.error(res.error);

			} else {

				const ucList = res.results.map(layout => layout.user_code);
				userCodesSet.value = new Set(ucList);

			}

		} else {
			userCodesSet.value = new Set(props.occupiedUserCodes);
		}*/

	}

	init();

</script>

<style lang="scss" scoped>

</style>
