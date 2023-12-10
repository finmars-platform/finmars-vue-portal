<template>
	<BaseModal
		:title="title"
		v-bind="$attrs"
		@close="cancel"
		style="width: 775px; height: 80%;"
	>

		<div class="p-b-24">
			<div class="flex-row column_titles_row">
				<div>
					<h3>Column ID</h3>
				</div>

				<div>
					<h3>Column Alias</h3>
				</div>
			</div>

			<div
				v-for="attr in selAttrs"
				:key="attr.attribute_data.key"
				class="flex-row flex-i-center m-b-24"
			>

				<!--			<md-input-container data-ng-if="attr.isDefault" style="width: 250px;">
								<input type="text"
											 data-ng-model="attr.attribute_data.name"
											 aria-label="attribute name"
											 readonly>
							</md-input-container>-->
				<div class="m-l-10 m-r-10">
					<BaseInput
						:modelValue="attr.attribute_data.name"
						readonly
						class="inputs_width bi_no_margins"
						:class="{'cursor-pointer': !attr.isDefault}"
						@click="changeAttribute(attr)"
					/>
				</div>

				<!--			<md-input-container data-ng-if="!attr.isDefault" style="width: 250px;">
								<input type="text"
											 data-ng-model="attr.attribute_data.name"
											 class="attr-menu-attribute-key-input"
											 data-ng-click="vm.changeAttributeOfMenuPosition(attr, $event)"
											 aria-label="default attribute name">
							</md-input-container>-->

				<!--			<md-input-container style="width: 250px;">
								<input type="text"
											 data-ng-model="attr.layout_name"
											 aria-label="attribute custom table name">
							</md-input-container>-->
				<div class="m-l-10 m-r-10">
					<BaseInput
						v-model="attr.layout_name"
						class="attr_key_input inputs_width bi_no_margins"
					/>
				</div>


				<div v-if="!attr.isDefault" class="flex-row button-group1">

					<!--				<md-button class="md-raised" data-ng-click="vm.moveUp(attr.order)">
										<ng-md-icon icon="expand_less">
											<md-tooltip md-direction="bottom">Move up</md-tooltip>
										</ng-md-icon>
									</md-button>-->
					<FmBtn type="basic" @click="moveUp(attr.order)">
						<FmIcon icon="expand_less"/>
					</FmBtn>

					<!--				<md-button class="md-raised" data-ng-click="vm.moveDown(attr.order)">
										<ng-md-icon icon="expand_more">
											<md-tooltip md-direction="bottom">Move down</md-tooltip>
										</ng-md-icon>
									</md-button>-->
					<FmBtn type="basic" @click="moveDown(attr.order)">
						<FmIcon icon="expand_more"/>
					</FmBtn>

					<!--				<md-button class="md-raised"
														 data-ng-click="vm.deleteAttr($index, attr.attribute_data)">
										<ng-md-icon icon="close">
											<md-tooltip md-direction="bottom">Delete Column</md-tooltip>
										</ng-md-icon>
									</md-button>-->
					<FmBtn type="basic" @click="deleteAttr(attr.order)">
						<FmIcon icon="close"/>
					</FmBtn>
				</div>
			</div>

			<FmBtn
				@click="() => {
				attrsSelData.opened = true;
				attrsSelData.editOptionIndex = null;
			}"
			>Add Columns</FmBtn>
		</div>

		<template #controls="{ cancel }">
			<div class="flex aic sb">
				<FmBtn type="text" @click="cancel">CANCEL</FmBtn>

				<FmBtn @click="save(cancel)">SAVE</FmBtn>
			</div>
		</template>

	</BaseModal>

	<FmAttributesSelectModal
		v-model="attrsSelData.opened"
		title="Select columns"
		:content_type="content_type"
		:attributes="attributes"
		:selected="selAttrsKeysList"
		:disabledAttributes="selAttrsKeysList"
		:valueType="value_type"
		:multiselect="!attrsSelData.editOptionKey"
		@selectedAttributesChanged="selected => processSelectedAttrs(selected)"
	/>

</template>

<script setup>

	let props = defineProps({
		title: String,
		content_type: String,
		attributes: {
			type: Array,
			default() { return [] },
		},
		selectedAttributes: {
			type: Array,
			default() { return [] },
		},
		value_type: Number,
	})

	let emit = defineEmits(['save']);

	let attrsSelData = reactive({
		opened: false,
		editOptionKey: null,
	})
	let selAttrs = ref( JSON.parse(JSON.stringify( props.selectedAttributes )) );

	let selAttrsKeysList = computed( () => selAttrs.value.map( attr => attr.attribute_data.key ) );

	watch(
		() => props.selectedAttributes,
		() => {
			selAttrs.value = JSON.parse(JSON.stringify( props.selectedAttributes ));
		}
	)

	/*let availableAttrs = computed(() => {

		return attrs.filter(attr => {
			return !selAttrs.value.find( sAttr => sAttr.attribute_data.key === attr.key );
		});

	});*/

	const setAttrsOrder = (attrs) => {
		return attrs.map( (attr, index) => {
			attr.order = index;
			return attr;
		});
	}

	function addAttrs(attrs) {

		attrs.forEach(attr => {

			const attributeData = {
				attribute_data: attr,
				layout_name: '',
				order: selAttrs.value.length,
			};

			selAttrs.value.push(attributeData);

		})

	}

	function changeAttribute(attr) {

		if (attr.isDefault) {
			return;
		}

		attrsSelData.editOptionKey = attr.attribute_data.key;
		attrsSelData.opened = true;

	}

	function processSelectedAttrs(attrs) {

		if (attrsSelData.editOptionKey) {

			const index = selAttrs.value.findIndex( attr => attr.attribute_data.key === attrsSelData.editOptionKey );

			selAttrs.value[index] = {
				attribute_data: structuredClone(attrs),
				layout_name: '',
				order: index,
			};

		} else {
			addAttrs(attrs);
		}

		attrsSelData.opened = false;
		attrsSelData.editOptionKey = null;

	}

	function moveUp (attrIndex) {
		var prevItemIndex = attrIndex - 1;

		if (prevItemIndex >= 0) {
			var attrToMove = JSON.parse(JSON.stringify(selAttrs.value[attrIndex]));
			attrToMove.order = attrToMove.order - 1;

			selAttrs.value[attrIndex] = selAttrs.value[prevItemIndex];
			selAttrs.value[attrIndex].order += 1;
			selAttrs.value[prevItemIndex] = attrToMove;
		}

	}

	function moveDown (attrIndex) {
		var nextItemIndex = attrIndex + 1;

		if (selAttrs.value[nextItemIndex]) {
			var itemToMove = JSON.parse(JSON.stringify(selAttrs.value[attrIndex]));
			itemToMove.order = itemToMove.order + 1;

			selAttrs.value[attrIndex] = selAttrs.value[nextItemIndex];
			selAttrs.value[attrIndex].order -= 1;
			selAttrs.value[nextItemIndex] = itemToMove;
		}

	}

	 function deleteAttr (attrIndex) {
		selAttrs.value.splice(attrIndex, 1);
		selAttrs.value = setAttrsOrder(selAttrs.value);
	}

	function cancel() {

		attrsSelData.opened = false;
		attrsSelData.editOptionIndex = null;

		selAttrs.value = JSON.parse(JSON.stringify( props.selectedAttributes ));

	}

	function save(cancelCallback) {

		emit('save', JSON.parse(JSON.stringify( selAttrs.value )) );

		cancelCallback();

	}

</script>

<style lang="scss" scoped>
	.inputs_width {
		width: 250px;
	}

	.column_titles_row {

		div {
			width: 250px;
			margin: 0 10px 0 13px;
		}
	}

	.attr_key_input {
		cursor: pointer;

		&:hover {
			border-bottom-color: rgb(63, 81, 181);
		}
	}
</style>
