<template>
	<div class="tab-scheme">
		<div
			class="flex justify-start align-center gap-x-2 text-[18px] cursor-pointer mb-1"
			@click.stop.prevent="toggleShowingDryRun"
		>
			{{ dryRun.isShow ? 'Hide' : 'Show' }} Dry Run

			<FmIcon
				:icon="dryRun.isShow ? 'mdi-menu-down' : 'mdi-menu-right'"
				color="var(--on-surface-variant)"
			/>
		</div>

		<div
			v-show="dryRun.isShow"
			:class="[
				'tab-scheme__dry-run',
				{ 'tab-scheme__dry-run--readonly': dryRun.isProcessing }
			]"
		>
			<div class="tab-scheme__dry-run-editor-wrapper">
				<VAceEditor
					:value="JSON.stringify([{ user_code: 'example' }], null, 4)"
					lang="json"
					theme="monokai"
					class="tab-scheme__dry-run-editor"
					@init="_onEditorInit"
				/>
			</div>

			<FmButton
				type="tertiary"
				rounded
				:disabled="dryRun.isProcessing"
				@click.stop.prevent="executeDryRun"
			>
				Execute
			</FmButton>

			<div v-if="dryRun.isProcessing" class="tab-scheme__loader">
				<FmProgressCircular indeterminate size="120" />
			</div>
		</div>

		<div
			v-if="dryRun.processingResult && !dryRun.processingResult._$error"
			class="tab-scheme__block tab-scheme__dry-run-result"
		>
			<div class="tab-scheme__block-label">The Dry Run Result</div>

			<div class="tab-scheme__block-body">
				<template v-if="dryRun.processingResult?.result">
					<div
						v-for="(item, index) in dryRun.processingResult?.result?.items"
						:key="index"
						:class="[
							'tab-scheme__dry-run-result-item',
							{
								'tab-scheme__dry-run-result-item--active':
									index === dryRun.processingResultActiveItemIndex
							}
						]"
						@click.prevent.stop="activateResultItem(item, index)"
					>
						<span>
							<i>Line</i>: {{ index + 1 }}.&nbsp; <i>Status</i>:
							{{ item.status }}
						</span>
						<span>{{ item.message }}</span>
						<span class="tab-scheme__dry-run-result--error">
							{{ item.error_message }}
						</span>
					</div>
				</template>

				<span v-else class="tab-scheme__dry-run-result--error">
					{{ dryRun.processingResult?.error_message }}
				</span>
			</div>
		</div>

		<div
			:class="[
				'tab-scheme__body',
				{
					'tab-scheme__body--short': dryRun.processingResult,
					'tab-scheme__body--shorter': dryRun.isShow,
					'tab-scheme__body--shortest': dryRun.isShow && dryRun.processingResult
				}
			]"
		>
			<!-- imported columns -->
			<div :class="['tab-scheme__column', 'tab-scheme__imported']">
				<TabSchemeInputs
					block="inputs"
					label="Imported Columns"
					:scheme="scheme"
					:dry-run-result-active-item="dryRun.processingResultActiveItem"
					@update:block="updateBlock('inputs', $event)"
					@update:valid="isBlockValid.inputs = $event"
				/>
			</div>
			<!-- calculated variables columns -->
			<div :class="['tab-scheme__column', 'tab-scheme__calculated']">
				<TabSchemeInputs
					block="calculated_inputs"
					label="Calculated Variables"
					:scheme="scheme"
					:dry-run-result-active-item="dryRun.processingResultActiveItem"
					@update:block="updateBlock('calculated_inputs', $event)"
					@update:valid="isBlockValid.calculated_inputs = $event"
				/>
			</div>
			<!-- scenarios columns -->
			<div :class="['tab-scheme__column', 'tab-scheme__scenarios']">
				<TabSchemeScenarios
					label="Transaction Type Matching Scenarios"
					:scheme="scheme"
					:dry-run-result-active-item="dryRun.processingResultActiveItem"
					@update:block="updateBlock('rule_scenarios', $event)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, nextTick, ref, watch } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmButton, FmIcon, FmProgressCircular } from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';
	import useApi from '~/composables/useApi';
	import useNotify from '~/composables/useNotify';
	import TabSchemeInputs from './TabSchemeInputs.vue';
	import TabSchemeScenarios from './TabSchemeScenarios.vue';

	const props = defineProps({
		scheme: {
			type: Object
		},
		loading: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:scheme', 'update:valid']);

	const { VAceEditor, onEditorInit } = useAceEditor();

	const dryRun = ref({
		isShow: false,
		editor: null,
		isProcessing: false,
		processingResult: null,
		processingResultActiveItem: null,
		processingResultActiveItemIndex: null
	});
	const isBlockValid = ref({
		inputs: true,
		calculated_inputs: true
	});

	const isTabValid = computed(
		() => isBlockValid.value.inputs && isBlockValid.value.calculated_inputs
	);

	function _onEditorInit(editor) {
		dryRun.value.editor = editor;
		onEditorInit(editor);
	}

	function toggleShowingDryRun() {
		dryRun.value.isShow = !dryRun.value.isShow;
		nextTick(() => {
			if (dryRun.value.isShow) {
				dryRun.value.editor.focus();
			}
		});
	}

	async function executeDryRun() {
		try {
			dryRun.value.isProcessing = true;

			const currentDryRunData = dryRun.value.editor.getValue();
			const formData = new FormData();
			const blob = new Blob([JSON.stringify(JSON.parse(currentDryRunData))], {
				type: 'application/json'
			});
			formData.append('file', blob, `input ${new Date().getUTCDate()}.json`);
			formData.append('scheme', props.scheme.id);
			const res = await useApi('importSchemeDryRun.post', {
				body: formData
			});

			if (res._$error) {
				useNotify({
					type: 'error',
					title: 'The dry run error',
					text: res.code,
					duration: 10000
				});
			} else {
				dryRun.value.processingResult = res;
			}
		} catch (e) {
			useNotify({
				type: 'error',
				title: 'The dry run error',
				text: JSON.stringify(e),
				duration: 10000
			});
		} finally {
			dryRun.value.isProcessing = false;
		}
	}

	function activateResultItem(item, index) {
		dryRun.value.processingResultActiveItem = item;
		dryRun.value.processingResultActiveItemIndex = index;
	}

	function updateBlock(block, value) {
		const updateScheme = cloneDeep(props.scheme);
		updateScheme[block] = value;
		emits('update:scheme', updateScheme);
	}

	watch(
		() => isTabValid.value,
		(val, oVal) => {
			if (oVal !== val) {
				emits('update:valid', val);
			}
		},
		{ immediate: true }
	);
</script>

<style lang="scss" scoped>
	.tab-scheme {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
		color: var(--on-surface);

		&__block {
			position: relative;
			width: 100%;
			padding-top: 5px;

			&-label {
				position: absolute;
				left: 12px;
				top: -4px;
				font-size: 12px;
				font-weight: 400;
				line-height: 18px;
				color: var(--on-surface-variant);
				background-color: var(--surface);
				padding: 0 4px;
				z-index: 1;
			}

			&-body {
				position: relative;
				width: 100%;
				height: 100%;
				padding: 8px;
				border-radius: 8px;
				border: 1px solid var(--outline-variant);
				overflow-y: auto;
			}
		}

		&__dry-run {
			position: relative;
			width: 100%;
			margin-bottom: 16px;
			display: grid;
			grid-template-columns: 1fr 200px 1fr;
			column-gap: 16px;

			:deep(.fm-button) {
				text-transform: none;
			}

			&-editor {
				position: relative;
				width: 100%;
				height: 100%;
				border-radius: 8px;
			}

			&-editor-wrapper {
				position: relative;
				height: 280px;
				border-radius: 8px;
			}

			&-result {
				height: 120px;
				margin-top: 8px;
				overflow-y: auto;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;

				&-item {
					display: flex;
					width: 100%;
					flex-direction: column;
					justify-content: flex-start;
					align-items: flex-start;
					margin-bottom: 4px;
					cursor: pointer;
					padding: 4px;
					border-radius: 4px;

					&:hover {
						background-color: var(--surface-container-highest);
					}

					&--active {
						background-color: var(--secondary-container);
					}
				}

				&--error {
					color: var(--error);
				}
			}

			&--readonly {
				pointer-events: none;
			}
		}

		&__body {
			position: relative;
			width: 100%;
			height: calc(100% - 32px - 16px);
			margin-top: 16px;

			&--short {
				height: calc(100% - 120px - 16px);
			}

			&--shorter {
				height: calc(100% - 328px - 16px);
			}

			&--shortest {
				height: calc(100% - 448px - 16px);
			}
		}

		&__column {
			position: absolute;
			width: calc(100% / 3 - 8px);
			top: 0;
			bottom: 0;
		}

		&__imported {
			left: 0;
		}

		&__calculated {
			left: calc(100% / 3 + 4px);
		}

		&__scenarios {
			right: 0;
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
