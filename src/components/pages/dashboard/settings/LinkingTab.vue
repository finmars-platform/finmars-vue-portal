<template>

	<div>

		<div v-for="input in inputs" class="flex-row">

			<FmCard>
				<div>
					<h3>{{ input.name }}</h3>
					Linked to:

					<div
						v-for="outputData in input.subscribedTo"
						:key="outputData.component_id"
						class="flex-row"
					>
						<!--						<div
													v-for="outputData in input.subscribedTo"
													:key="outputData.componentName"
												>-->
						<FmSelect
							:modelValue="outputData.component_id"
							label="component"
							:items="getLinkCompOpts(input)"
							prop_id="uid"
							prop_name="user_code"
							class="m-r-8"
							@update:modelValue="selCompUid => changeSubscribedComp(outputData.component_id, selCompUid, input.uid)"
						/>

						<FmAttributesSelect
							v-if="outputData.hasOwnProperty('propertyName')"
							v-model="outputData.propertyName"
							label="Attribute"
							:contentType="dashStore.getComponent(outputData.component_id).settings.content_type"
							:valueType="input.value_type"
							:attributes="getAttributesForLinking(outputData.component_id)"
						/>

						<FmBtn
							type="iconBtn"
							icon="close"
							@click="removeOutput(input.uid, outputData.output_id)"
						/>

					</div>

					<FmBtn
						type="basic"
						@click="openInputLinking(input)"
					>LINK</FmBtn>

					<div>
						<FmBtn
							type="basic"
							@click="removeInput(input)"
						>DELETE INPUT</FmBtn>
					</div>


				</div>
			</FmCard>

		</div>

		<FmBtn @click="iAdditionOpened = true">Add input</FmBtn>

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
					:valueType="addLinkingData.input.value_type"
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

		<FmAttributesSelectModal
			v-model="iAdditionOpened"
			title="Select attribute for input"
			:contentType="component.settings.content_type"
			:attributes="evAttrsStore.getDataForAttributesSelector(component.settings.content_type)"
			:selected="attrsUsedByInputs"
			:disabledAttributes="attrsUsedByInputs"
			:multiselect="true"
			@selectedAttributesChanged="selAttrs => addInputs(selAttrs)"
		/>

	</div>

</template>

<script setup>


	const props = defineProps({
		inputs: {
			type: Array,
			default: [],
		},
		outputs: {
			type: Array,
			default: [],
		},
	});

	const emit = defineEmits(['update:inputs', 'update:outputs'])

	let { component } = inject('component');

	const dashStore = useStoreDashboard();
	const layoutsStore = useLayoutsStore();
	const evAttrsStore = useEvAttributesStore();

	//# region LINKING
	let creatingNewComp = !component.value.uid;
	/*let date1SelectModel = computed({
		set(newVal) {

			const inputIndex = props.inputs.findIndex( inputData => inputData.key === date1Key );

			props.inputs[inputIndex]._children = newVal;

		},
		get() {

			props.inputs.find( inputData => inputData.key === date1Key )._children;

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

	function removeInput(input) {

		const inputIndex = props.inputs.findIndex(inputData => inputData.uid === input.uid );
		props.inputs.splice(inputIndex, 1);

		emit('update:inputs', props.inputs);

	}

	function removeOutput(inputUid, outputUid) {

		const inputData = props.inputs.find(input => input.uid === inputUid);
		const outputIndex = inputData.subscribedTo.findIndex(output => output.output_id === outputUid);

		inputData.subscribedTo.splice(outputIndex, 1);

		emit('update:inputs', props.inputs);

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

	//# region Addition of inputs
	let iAdditionOpened = ref(false);

	let attrsUsedByInputs = computed(() => {

		// const attrs = evAttrsStore.getDataForAttributesSelector(component.value.settings.content_type);

		/*attrs.filter(attr => {
			return !props.inputs.find(input => input.key === attr.key);
		})*/

		const notRo = props.inputs.filter( input => !input.key.startsWith('reportOptions__') );

		return notRo.map(input => input.key);

	});

	function addInputs(attrs) {

		const newInputs = attrs.map(attr => {

			return {
				uid: useGenerateUniqueId('input' + attr.key),
				component_id: component.value.settings.uid,
				user_code: null,
				key: attr.key,
				name: attr.name,
				value_type: 10,
				view: {
				type: 'select',
					items: [],
				},
				subscribedTo: [],
				default_value: null,
				__val: null,
			};

		});

		emit( 'update:inputs', props.inputs.concat(newInputs) );

	}
	//# endregion

	function subscribeToComp() {

		if (!addLinkingData.input.uid) {
			throw new Error(`Input ${addLinkingData.input.name} has no uid`);
		}
		// console.log("testing1090.subscribeToComp addLinkingData", JSON.parse(JSON.stringify( addLinkingData )) );
		const compToSub = dashStore.getComponent(addLinkingData.comp.uid);
		// console.log("testing1090.subscribeToComp compToSub", compToSub);
		const input = props.inputs.find( inputData => inputData.uid === addLinkingData.input.uid );
		// console.log("testing1090.subscribeToComp input", input);

		const outputToSub = dashStore.props.outputs.find(output => {
			return output.component_id === compToSub.uid;
		});

		let outputData = {
			output_id: outputToSub.uid,
			component_id: compToSub.uid,
			componentUserCode: compToSub.user_code,
			// output_id: dashStore.props.outputs[0].uid,
		}


		if (compToSub.dynamicOutputs) {

			outputData.propertyName = addLinkingData.comp.propertyName;
			/*input.subscribedTo = [{
				componentName: compToSub.name,
				propertyName: addLinkingData.comp.propertyName,
				output_id: null,
			}]*/

		} else {


			/*input.subscribedTo = [{
				componentName: compToSub.name,
				output_id: null,
			}]*/

		}

		input.subscribedTo.push(outputData);

		emit('update:inputs', props.inputs);

		closeInputLiking();

	}

	function changeSubscribedComp(compUid, newCompUid, inputUid) {

		const compToSub = dashStore.getComponent(newCompUid);

		const input = props.inputs.find( inputData => inputData.uid === inputUid );
		const outputIndex = input.subscribedTo.findIndex( output => output.component_id === compUid );

		let newOutputData = {
			component_id: compToSub.uid,
			componentUserCode: compToSub.user_code,
			output_id: dashStore.props.outputs[0].uid,
		}

		if (compToSub.dynamicOutputs) {
			newOutputData.propertyName = addLinkingData.comp.propertyName;
		}

		input.subscribedTo[outputIndex] = newOutputData;
		emit('update:inputs', props.inputs);

	}

	function getLinkCompOpts (input, filterSelectedComps) {

		if (!input) return;

		let result = dashStore.components
			.filter(comp => {

				if (comp.uid === component.value.uid) {
					return false;
				}

				if (comp.dynamicOutputs) {
					return true;
				}

				/*const differentValueType = !comp.outputs.find( output => {
					return output.value_type === input.value.value_type;
				});*/
				const incompatibleValueTypes = !dashStore.props.outputs.find( output => {

					if (output.component_id !== comp.uid) {
						return false;
					}

					if (input.value_type === 10 && output.value_type === 100) {
						return true;
					}

					return output.component_id === comp.uid &&
						( output.value_type === input.value_type ||
							input.value_type === 10 && output.value_type === 100 );

				});

				if (incompatibleValueTypes) {
					return false;
				}

				if (input.value_content_type) {

					const differentContentType = !dashStore.props.outputs.find( output => {
						return output.value_content_type === input.value_content_type;
					});

					if (differentContentType) {
						return false;
					}

				}

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

	function init() {

		if (creatingNewComp) {

			const defaultInputs = getDashInputsByContentType(component.value.settings.content_type);

			props.inputs = defaultInputs.concat(props.inputs);

			props.inputs = props.inputs.map((input, index) => {
				input.uid = useGenerateUniqueId('input' + index);
				return input;
			});

			emit('update:inputs', props.inputs);

		}

	}

	init();

</script>

<style lang="scss" scoped>

</style>
