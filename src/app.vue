<template>

		<NuxtLayout >
			<NuxtPage />
		</NuxtLayout>

		<notifications />
		<notifications class="toast-error-group" group="server_error" width="400px" position="top right">
			<template #body="props">
				<div class="toast-container server-error">
					<div class="title_wrap flex aic sb">
						<div class="flex aic">
							<p class="title">
								{{ props.item?.title }}
							</p>
							<div class="toast_copy" @click="copy(props.item?.text)">Click to copy</div>
						</div>

						<FmIcon class="toast-close-button" @click="props.close" icon="close" />
					</div>

					<div class="toast-error">
						<span class="toast-error-field">Title: </span>
						<div>{{ props.item?.text?.message }}</div>
					</div>
					<div class="toast-error">
						<span class="toast-error-field">Code: </span>
						<div>{{ props.item?.text?.status_code }}</div>
					</div>
					<div class="toast-error">
						<span class="toast-error-field">URL: </span>
						<div class="toast_error_text">{{ props.item?.text?.url }}</div>
					</div>
					<div class="toast-error">
						<span class="toast-error-field">Date & Time: </span>
						<div>{{ props.item?.text?.datetime }}</div>
					</div>
					<pre class="toast-pre">{{JSON.stringify(props.item?.text?.details, null, 2)}}</pre>
				</div>
			</template>
		</notifications>

		<notifications class="toast-error-group" group="fm_warning" width="400px" position="top right">
			<template #body="props">
				<div class="toast-container warning">
					<div class="title_wrap flex aic sb">
						<div class="flex aic">
							<p class="title">
								{{ props.item?.title }}
							</p>
						</div>

						<FmIcon class="toast-close-button" @click="props.close" icon="close" />
					</div>

					<div class="toast-error">
						<span class="toast-error-field">Title: </span>
						<div>{{ props.item?.text?.title }}</div>
					</div>

					<div v-if="props.item?.text?.context" class="toast-error">
						<span class="toast-error-field">Context: </span>
						<div>{{ props.item?.text?.context }}</div>
					</div>

					<div class="toast-error">
						<span class="toast-error-field">Details: </span>
						<div>{{ props.item?.text?.details }}</div>
					</div>

				</div>
			</template>
		</notifications>


		<fm-confirm></fm-confirm>

</template>

<script setup>

	// let store = useStore()
	function copy( value ) {
		navigator.clipboard.writeText( JSON.stringify(value, null, 2) ).then(() => {
    });
	}


</script>

<style lang="scss" scoped>
.toast-error-notifications {
	padding-top: 10px !important;
	padding-right: 10px !important;
}
.toast-container {
	background: #fff;
	color: #000;
	padding: 8px 8px 12px;
	border-left: 4px solid;
	white-space: pre-wrap;
	.title_wrap {
		margin-bottom: 4px;
	}
	.title {
		font-weight: 500;
		font-size: 20px;
	}
	.toast_error_text {
		width: 90%;
		word-wrap: break-word;
	}
	.toast_copy {
		padding: 2px 5px;
		border-radius: 20px;
		border: 1px solid #000;
		margin-left: 10px;
		cursor: pointer;
	}
  .toast-error {
		display: flex;
		font-size: 14px;
    button.toast-close-button {
      right: 2px;
      top: 0;
    }

    .toast-error-field {
      opacity: .7;
    }

    span.toast-click-to-copy {
      border: 1px solid #000;
      margin-left: 8px;
      padding: 2px 4px;
      font-size: 11px;
      border-radius: 8px;
      opacity: .8;
      position: relative;
      top: -2px;
    }
    .toast-close-button {
      color: #000;
    }
  }
	.toast-pre {
		white-space: pre-wrap;
		margin: 0;
		padding: 4px;
		border: 1px solid #ddd;
		background: #f1f1f1;
		margin-top: 10px;
		font-size: 14px;
	}
}

.toast-container.server-error {
    border-left-color: #ff623d;
}

.toast-container.warning {
    border-left-color: #f7c33d;
}

</style>
