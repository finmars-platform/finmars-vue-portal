<template>
	<div class="attribute-type">
		<div class="attribute-type__body">
			<div v-if="isLoading" class="attribute-type__loader">
				<FmProgressLinear indeterminate />
			</div>

			<UserCodeInput
				class="attribute-type__row"
				:user-code="attr.user_code"
				:disabled="isLoading"
				@update:user-code="updateAttr('user_code', $event)"
				@update:configuration-code="updateAttr('configuration_code', $event)"
				@update:valid="formInfo['user_code'].isValid = $event"
			/>

			<div class="attribute-type__row">
				<FmTextField
					outlined
					:model-value="attr.name"
					label="Attribute name*"
					:disabled="isLoading"
					:error="formInfo.name.isDirty && !formInfo.name.isValid"
					:error-messages="
						formInfo.name.isDirty && !formInfo.name.isValid
							? ['This field may not blank']
							: []
					"
					@update:model-value="updateAttr('name', $event)"
				/>
			</div>

			<div class="attribute-type__row attribute-type__row--margin">
				<FmTextField
					outlined
					:model-value="attr.tooltip"
					label="Tooltip"
					hide-details
					:disabled="isLoading"
					@update:model-value="updateAttr('tooltip', $event)"
				/>
			</div>

			<div class="attribute-type__row attribute-type__row--margin">
				<FmCheckbox
					:model-value="attr.can_recalculate"
					label="Can recalculate"
					:disabled="isLoading"
					@update:model-value="updateAttr('can_recalculate', $event)"
				/>
			</div>

			<div class="attribute-type__row">
				<FmSelect
					variant="outlined"
					label="Attribute type*"
					:options="VALUE_TYPES"
					:model-value="attr.value_type"
					:disabled="isLoading || !!attr.id"
					:error="formInfo.value_type.isDirty && !formInfo.value_type.isValid"
					@update:model-value="updateAttr('value_type', $event)"
				/>
			</div>
		</div>

		<div class="attribute-type__actions">
			<FmButton type="secondary" rounded @click.prevent.stop="emits('cancel')">
				Cancel
			</FmButton>

			<div class="attribute-type__actions-block">
				<FmButton
					v-if="attr.id"
					type="tertiary"
					rounded
					:disabled="isLoading || !isFormValid"
					@click.stop.prevent="makeCopy"
				>
					Make a copy
				</FmButton>

				<FmButton
					rounded
					:disabled="isLoading || !isFormValid || (attr.id && !isFormDirty)"
					@click.stop.prevent="save"
				>
					{{ attr.id ? 'Save' : 'Create' }}
				</FmButton>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import set from 'lodash/set';
	import size from 'lodash/size';
	import {
		FmButton,
		FmCheckbox,
		FmProgressLinear,
		FmSelect,
		FmTextField
	} from '@finmars/ui';
	import useNotify from '~/composables/useNotify';
	import { findContentTypeByEntity } from '~/services/meta/metaContentTypeService';
	import { getByKey, create, update } from '~/services/attributeTypeService';
	import { VALUE_TYPES } from './constants';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';

	const props = defineProps({
		id: {
			type: [Number, undefined]
		},
		attribute: {
			type: [Object, undefined]
		},
		entityType: {
			type: String
		}
	});

	const emits = defineEmits(['cancel', 'select', 'confirm']);

	const isLoading = ref(false);
	const formInfo = ref({
		name: {
			isDirty: false,
			isValid: true
		},
		tooltip: {
			isDirty: false,
			skipValidation: true
		},
		user_code: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			isValid: true
		},
		can_recalculate: {
			isDirty: false,
			skipValidation: true
		},
		value_type: {
			isDirty: false,
			isValid: true
		}
	});

	const attr = ref({
		name: '',
		user_code: '',
		configuration_code: '',
		can_recalculate: false,
		value_type: null
	});

	const isFormDirty = computed(() =>
		Object.values(formInfo.value).some((f) => f.isDirty)
	);
	const isFormValid = computed(
		() =>
			!Object.values(formInfo.value).some(
				(f) => !f.isValid && !f.skipValidation
			)
	);

	async function getAttribute() {
		if (props.attribute) {
			attr.value = cloneDeep(props.attribute);
			console.log('getAttribute: ', attr.value);
			return;
		}

		if (!props.id) {
			attr.value.content_type = findContentTypeByEntity(props.entityType);
			console.log('getAttribute: ', attr.value);
			return;
		}

		try {
			isLoading.value = true;
			attr.value = await getByKey(props.entityType, props.id);
			console.log('getAttribute: ', attr.value);
		} catch (err) {
			console.error('The error of the attribute loading. ', err);
		} finally {
			isLoading.value = false;
		}
	}

	function validate() {
		Object.keys(formInfo.value).forEach((key) => {
			if (!formInfo.value[key].skipValidation) {
				formInfo.value[key].isValid = !!attr.value[key];
			}
		});
	}

	function updateAttr(field, value) {
		if (formInfo.value[field] && !formInfo.value[field].isDirty) {
			formInfo.value[field].isDirty = true;
		}
		set(attr.value, field, value);
		validate();
	}

	async function save() {
		try {
			isLoading.value = true;
			if (attr.value.id) {
				await update(props.entityType, attr.value);
			} else {
				await create(props.entityType, attr.value);
			}
			useNotify({ type: 'success', title: 'The attribute type saved.' });
			emits('select', { action: 'refresh:data' });
			emits('confirm');
		} catch (err) {
			useNotify({ type: 'error', title: err });
		} finally {
			isLoading.value = false;
		}
	}

	async function makeCopy() {
		const copiedAttr = cloneDeep(attr.value);
		delete copiedAttr.id;
		copiedAttr.user_code = `${copiedAttr.user_code}_copy`;
		if (size(copiedAttr.classifiers)) {
			delete copiedAttr.classifiers_flat;
			copiedAttr.classifiers.forEach((classifier) => {
				delete classifier.id;
			});
		}

		emits('select', { action: 'make:copy', payload: copiedAttr });
		emits('confirm');
	}

	onBeforeMount(async () => {
		await getAttribute();
	});
</script>

<style lang="scss" scoped>
	.attribute-type {
		position: relative;
		width: 100%;
		height: auto;
		border-radius: 24px;

		&__loader {
			position: absolute;
			left: 0;
			width: 100%;
			top: -1px;
		}

		&__body {
			position: relative;
			width: 100%;
			padding: 24px;
		}

		&__row {
			margin-bottom: 8px;

			&--margin {
				margin-bottom: 20px;
			}

			:deep(.fm-checkbox) {
				.v-checkbox-btn {
					column-gap: 8px;

					.v-label {
						font-size: 16px;
						color: var(--on-surface);
						opacity: 1;
					}
				}
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			padding: 24px;
			justify-content: space-between;
			align-items: center;

			&-block {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 8px;
			}

			button {
				text-transform: none;
			}
		}
	}
</style>
