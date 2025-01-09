<template>
	<teleport to="body">
		<section class="attribute-type__overlay">
			<div class="attribute-type">
				<div class="attribute-type__header">
					<span>Attribute manager</span>

					<FmIconButton
						icon="mdi-close"
						variant="text"
						@click.stop.prevent="emits('close')"
					/>

					<div v-if="isLoading" class="attribute-type__loader">
						<FmProgressLinear indeterminate />
					</div>
				</div>

				<div class="attribute-type__body">
					<UserCodeInput
						class="attribute-type__row"
						:user-code="attr.user_code"
						:disabled="isLoading"
						@update:user-code="updateAttr('user_code', $event)"
						@update:configuration-code="
							updateAttr('configuration_code', $event)
						"
						@update:valid="formInfo['user_code'].isValid = $event"
					/>

					<div class="attribute-type__row">
						<FmTextField
							outlined
							:model-value="attr.name"
							label="Attribute name"
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

					<div class="attribute-type__row">
						<FmTextField
							outlined
							:model-value="attr.tooltip"
							label="Tooltip"
							:disabled="isLoading"
							@update:model-value="updateAttr('tooltip', $event)"
						/>
					</div>
				</div>

				<div class="attribute-type__actions">
					<FmButton
						type="secondary"
						rounded
						@click.prevent.stop="emits('close', false)"
					>
						Cancel
					</FmButton>

					<div class="attribute-type__actions-block">
						<FmButton
							type="tertiary"
							rounded
							:disabled="isLoading || !isFormValid"
						>
							Make a copy
						</FmButton>

						<FmButton
							rounded
							:disabled="isLoading || !isFormValid || !isFormDirty"
						>
							Save
						</FmButton>
					</div>
				</div>
			</div>
		</section>
	</teleport>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import set from 'lodash/set';
	import {
		FmButton,
		FmIconButton,
		FmProgressLinear,
		FmTextField
	} from '@finmars/ui';
	import { findContentTypeByEntity } from '~/services/meta/metaContentTypeService';
	import { getByKey } from '~/services/attributeTypeService';
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

	const emits = defineEmits(['close']);

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
		}
	});

	const attr = ref({
		name: '',
		user_code: '',
		configuration_code: ''
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

	onBeforeMount(async () => {
		await getAttribute();
	});
</script>

<style lang="scss" scoped>
	.attribute-type__overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.attribute-type {
		position: relative;
		width: 1024px;
		height: auto;
		border-radius: 24px;
		background-color: var(--surface);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

		&__loader {
			position: absolute;
			left: 0;
			width: 100%;
			bottom: -1px;
		}

		&__body {
			position: relative;
			width: 100%;
			padding: 24px;
		}

		&__row {
			margin-bottom: 8px;
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--outline-variant);

			&-block {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 16px;
			}

			button {
				text-transform: none;
			}
		}
	}
</style>
