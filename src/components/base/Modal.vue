<template>
	<Teleport to="body" v-if="modelValue">
		<transition name="fade">
			<div
				v-show="modelValue"
				class="modal_wrap flex aic jcc"
				:class="{ no_padding: no_padding }"
			>
				<div class="modal" v-bind="$attrs">
					<div v-if="!empty_hack" class="modal_top flex aic sb">
						<!--						<div class="modal_head">{{ title }}</div>

						<slot name="modalTop" />-->
						<div class="flex aic">
							<div class="modal_head">{{ title }}</div>
							<slot name="modalTop" />
						</div>

						<FmBtn
							:disabled="closingDisabled"
							type="icon"
							icon="close"
							@click="cancel"
						/>
					</div>

					<div class="modal_content scrollable">
						<slot />
					</div>

					<div class="modal_bottom">
						<slot name="controls" :cancel="cancel">
							<div class="flex sb" v-if="controls">
								<FmBtn
									type="text"
									@click="
										cancel(), controls.cancel.cb ? controls.cancel.cb() : ''
									"
									>{{ controls.cancel.name }}</FmBtn
								>
								<FmBtn @click="cancel(), controls.action.cb()">{{
									controls.action.name
								}}</FmBtn>
							</div>
						</slot>
					</div>
				</div>
				<div
					v-if="!empty_hack"
					class="mask"
					@[backdropClickable]="cancel"
				></div>
			</div>
		</transition>
	</Teleport>
</template>

<script>
	export default {
		props: {
			modelValue: Boolean,
			title: String,
			// {
			//	cancel:
			//  action
			// }
			controls: Object,
			no_padding: Boolean,
			closeOnClickOutside: {
				type: Boolean,
				default: false,
			},
			closingDisabled: Boolean,
			empty_hack: Boolean,
		},
		emits: ['update:modelValue', 'open', 'close'],
		data() {
			return {}
		},
		computed: {
			backdropClickable() {
				return this.closeOnClickOutside ? 'click' : false
			},
		},
		async mounted() {

		},
		watch: {
			modelValue(val) {
				if (val) {
                    document.querySelector('html').style.overflow = 'hidden';
                    this.$emit('open');
                }
				else document.querySelector('html').style.overflow = 'initial'
			},
		},

		methods: {
			cancel() {
				if (this.closingDisabled) return
				this.$emit('update:modelValue', false)
				this.$emit('close')
			},
		},
	}
</script>

<style lang="scss" scoped>
	.modal_wrap {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: $modal-z-index;
		background: rgba(0, 0, 0, 0.55);

		.mask {
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			z-index: 50;
		}
		&.no_padding {
			.modal_content {
				padding: 0;
			}
		}
	}
	.modal_top {
		height: $modal-header-height;
		padding: 0 20px;
		border-bottom: 1px solid var(--table-border-color);
	}
	.modal_content {
		overflow: auto;
		max-height: calc(90vh - $modal-header-height - $modal-footer-height);
		height: calc(100% - $modal-header-height - $modal-footer-height);
		padding: 15px 20px 0;
		min-width: 400px; // so that FmInputEntityNames could fit in
		background: var(--base-backgroundColor);
		font: var(--body-large-font);
	}
	.modal_content :deep(.base-input) {
		background: transparent;
	}
	.modal_bottom {
		height: $modal-footer-height;
		border-top: 1px solid var(--table-border-color);
		padding: 10px 20px;
	}
	.modal {
		position: relative;
		background-color: var(--dropdown-background-color);
		color: var(--secondary-color);
		min-width: 300px;
		max-width: 90%;
		border-radius: 4px;
		z-index: 51;

		.close {
			cursor: pointer;

			path {
				transition: 0.3s;
			}

			&:hover path {
				stroke: var(--primary-color) !important;
			}
		}

		&_head {
			font-weight: 500;
			font-size: 20px;
		}
	}

	@media screen and (max-width: 768px) {
		.modal {
			width: 100%;
			height: 100%;
			max-height: 100%;
		}
	}

	.nopadding .modal {
		padding-left: 0;
		padding-right: 0;
	}
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.3s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}
</style>
