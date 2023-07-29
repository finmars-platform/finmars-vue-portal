<template>

	<div>

		<div v-for="input in component.inputs" class="flex-row">

			<FmCard>
				<div>
					<h3>{{ input.name }}</h3>
					Linked to:

					<div
						v-for="outputData in input.subscribedTo"
						:key="outputData.componentUid"
						class="flex-row"
					>
						<!--						<div
													v-for="outputData in input.subscribedTo"
													:key="outputData.componentName"
												>-->
						<FmSelect
							:modelValue="outputData.componentUid"
							label="component"
							:items="getLinkCompOpts(input)"
							prop_id="uid"
							prop_name="user_code"
							class="m-r-8"
							@update:modelValue="selCompUid => changeSubscribedComp(outputData.componentUid, selCompUid, input.uid)"
						/>

						<FmAttributesSelect
							v-if="outputData.hasOwnProperty('propertyName')"
							v-model="outputData.propertyName"
							label="Attribute"
							:contentType="dashStore.getComponent(outputData.componentUid).settings.content_type"
							:valueType="input.value_type"
							:attributes="getAttributesForLinking(outputData.componentUid)"
						/>

					</div>

					<FmBtn
						type="basic"
						@click="openInputLinking(input)"
					>LINK</FmBtn>

					<FmBtn
						type="basic"
						icon="close"
						@click="unlinkInput(input)"
					/>

				</div>
			</FmCard>

		</div>

		<FmBtn>Add input</FmBtn>

		<BaseModal
			v-model="addLinkingData.opened"
			title="Link to component"
		>

			<div>
				<FmSelect
					label="component"
					:modelValue="addLinkingData.comp?.uid"
					:items="getLinkCompOpts(addLinkingData.input, true)"
					prop_id="uid"
					prop_name="user_code"
					attach="body"
					@update:modelValue="uid => addLinkingData.comp = dashStore.getComponent(uid)"
				/>

				<FmAttributesSelect
					v-if="addLinkingData.comp?.dynamicOutputs"
					v-model="addLinkingData.comp.propertyName"
					label="Attribute"
					:contentType="dashStore.getComponent(addLinkingData.comp.uid).settings.content_type"
					:attributes="getAttributesForLinking(addLinkingData.comp.uid)"
				/>
			</div>

			<template #controls>
				<div class="flex aic sb">
					<FmBtn type="text" @click="closeInputLiking">CANCEL</FmBtn>

					<FmBtn @click="subscribeToComp">SAVE</FmBtn>
				</div>
			</template>
		</BaseModal>

	</div>

</template>

<script setup>

	let { component, updateComponent } = inject('component');

	const dashStore = useStoreDashboard();
	const layoutsStore = useLayoutsStore();
	const evAttrsStore = useEvAttributesStore();

	//# region LINKING

	let date1Key;
	let date2Key;

	/*let date1SelectModel = computed({
		set(newVal) {

			const inputIndex = component.value.inputs.findIndex( inputData => inputData.key === date1Key );

			component.value.inputs[inputIndex]._children = newVal;

		},
		get() {

			component.value.inputs.find( inputData => inputData.key === date1Key )._children;

		}
	});*/

	function openInputLinking (input) {
		addLinkingData.input = input;
		addLinkingData.opened = true;
	}

	function getAttributesForLinking(compUid) {
		const ct = dashStore.getComponent(compUid).settings.content_type;
		return evAttrsStore.getDataForAttributesSelector(ct);
	}

	function unlinkInput(input) {

		const inputIndex = component.value.inputs.findIndex(inputData => inputData.uid === input.uid );
		component.value.inputs.splice(inputIndex, 1);

		updateComponent( component.value );

	}

	let addLinkingData = reactive({
		opened: false,
		input: null,
		comp: null,
	});

	function closeInputLiking() {
		addLinkingData.opened = false;
		addLinkingData.comp = null;
		addLinkingData.input = null;
	}

	function subscribeToComp() {

		if (!addLinkingData.input.uid) {
			throw new Error(`Input ${addLinkingData.input.name} has no uid`);
		}
		console.log("testing1090.subscribeToComp addLinkingData", JSON.parse(JSON.stringify( addLinkingData )) );
		const compToSub = dashStore.getComponent(addLinkingData.comp.uid);
		console.log("testing1090.subscribeToComp compToSub", compToSub);
		const input = component.value.inputs.find( inputData => inputData.uid === addLinkingData.input.uid );
		console.log("testing1090.subscribeToComp input", input);

		let outputData = {
			componentUid: compToSub.uid,
			componentUserCode: compToSub.user_code,
			outputUid: dashStore.props.outputs[0].uid,
		}


		if (compToSub.dynamicOutputs) {

			outputData.propertyName = addLinkingData.comp.propertyName;
			/*input.subscribedTo = [{
				componentName: compToSub.name,
				propertyName: addLinkingData.comp.propertyName,
				outputUid: null,
			}]*/

		} else {


			/*input.subscribedTo = [{
				componentName: compToSub.name,
				outputUid: null,
			}]*/

		}
		input.subscribedTo.push(outputData);

		updateComponent( component.value );
		console.log( "testing1090.subscribeToComp result ", component.value, input );
		closeInputLiking();

	}

	function changeSubscribedComp(compUid, newCompUid, inputUid) {

		const compToSub = dashStore.getComponent(newCompUid);

		const input = component.value.inputs.find( inputData => inputData.uid === inputUid );
		const outputIndex = input.subscribedTo.findIndex( output => output.componentUid === compUid );

		let newOutputData = {
			componentUid: compToSub.uid,
			componentUserCode: compToSub.user_code,
			outputUid: dashStore.props.outputs[0].uid,
		}

		if (compToSub.dynamicOutputs) {
			newOutputData.propertyName = addLinkingData.comp.propertyName;
		}

		input.subscribedTo[outputIndex] = newOutputData;
		updateComponent( component.value );

	}

	function getLinkCompOpts (input, filterSelectedComps) {

		if (!input) return;

		let result = dashStore.components
			.filter(comp => {
				console.log("testing1090.getLinkCompOpts comp", comp);
				if (comp.dynamicOutputs) {
					return true;
				}

				/*const differentValueType = !comp.outputs.find( output => {
					return output.value_type === input.value.value_type;
				});*/
				const differentValueType = !dashStore.props.outputs.find( output => {

					return output.component_id === comp.uid &&
						output.value_type === input.value_type;

				});

				if (differentValueType) {
					return false;
				}

				if (input.value_type === 100) {

					const differentContentType = !dashStore.props.outputs.find( output => {
						return output.value_content_type === input.value_content_type;
					});
					console.log("testing1090.getLinkCompOpts differentContentType", differentContentType);
					if (differentContentType) {
						return false;
					}

				}
				console.log("testing1090.getLinkCompOpts pass");
				return true;

			});

		if (filterSelectedComps) {

			result = result.filter(comp => {
				return comp.dynamicOutputs || !input.subscribedTo.hasOwnProperty(comp.uid);
			});

		}

		return result;

	}

	//# endregion tab: LINKING

	const date1KeysData = {
		'reports.balancereport': 'report_date',
		'reports.plreport': 'pl_first_date',
		'reports.transactionreport': 'begin_date',
	};

	const date2KeysData = {
		'reports.balancereport': null,
		'reports.plreport': 'report_date',
		'reports.transactionreport': 'end_date',
	};

	date1Key = date1KeysData[component.value.settings.content_type];
	date2Key = date2KeysData[component.value.settings.content_type];

	if (date2Key) {

		component.value.inputs.unshift({
			uid: null,
			component_id: null,
			user_code: null,
			key: 'report_options_date2',
			name: 'Date to',
			value_type: 40,
			// type: '',
			view: {
				type: 'select',
				items: [],
			},
			subscribedTo: [],
			default_value: null,
			__val: null,
		});

	}

	component.value.inputs.unshift({
		uid: null,
		component_id: null,
		user_code: null,
		key: 'report_options_date1',
		name: date2Key ? 'Date from' : 'Date',
		value_type: 40,
		// type: '',
		view: {
			type: 'select',
			items: [],
		},
		subscribedTo: [],
		default_value: null,
		__val: null,
	});

	component.value.inputs = component.value.inputs.map((input, index) => {
		input.uid = useGenerateUniqueId('input' + index);
		return input;
	});

	updateComponent( component.value );

</script>

<style lang="scss" scoped>

</style>
