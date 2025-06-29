<template>
	<div class="modal">
		<div class="modal_top flex aic sb">
			<div class="flex aic">
				<div class="modal_head">{{ title }}</div>

				<BaseInput
					type="text"
					class="small bi_no_borders bi_border_bottom m-l-20"
					placeholder="Search"
					v-model="searchParams"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
					<template #rightBtn>
						<FmIcon
							size="16"
							icon="close"
							@click="searchParams = ''"
						/>
					</template>
				</BaseInput>
			</div>

			<FmBtn type="icon" icon="close" @click="cancel" />
		</div>

		<div class="modal_content scrollable">
			<div v-if="readyStatus" class="attr_select_wrap">
				<FmAttributesSelectMain
					:modelValue="selAttrsKeysList"
					:attributes="attrsList"
					:favoriteAttributes="favoriteAttributes"
					:disabledAttributes="disabledAttributes"
					:multiselect="true"
					:searchParameters="searchParams"
					:isAdvanced="isAdvanced"
					@update:modelValue="(newVal) => (newSelAttrs = newVal)"
					@favoritesChanged="saveFavorites"
				/>
			</div>
		</div>

		<div class="modal_bottom flex sb">
			<div class="flex aic">
				<FmBtn type="text" @click="cancel()"> Cancel</FmBtn>

				<FmIcon
					class="m-l-24"
					primary
					:icon="isAdvanced ? 'lock_open' : 'lock'"
					@click="isAdvanced = !isAdvanced"
				/>
			</div>

			<FmBtn @click="save()">OK</FmBtn>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		layout: 'external'
	});

	const windowOrigin = window.origin;
	// const windowOrigin = 'http://0.0.0.0:8080'; // for development
	const route = useRoute();

	const iframeId = route.query.iframeId;

	let readyStatus = ref(false);

	let title = ref('');

	let attrsList = ref([]);
	let selAttrsKeysList = ref([]);
	let newSelAttrs = ref();
	let favoriteAttributes = ref([]);
	let disabledAttributes = ref([]);

	let isAdvanced = ref(false);

	let searchParams = ref('');

	const onMessageStack = {
		INITIALIZATION_SETTINGS_TRANSMISSION: init
	};

	function send(data, source = window.parent) {
		data.iframeId = iframeId;

		let dataObj = Object.assign(data, {
			iframeId: iframeId
		});

		source.postMessage(dataObj, windowOrigin);
	}

	onMounted(() => {
		window.addEventListener('message', onMessage);

		send({
			action: 'IFRAME_READY'
		});
	});

	function saveFavorites(favAttrs) {
		favoriteAttributes.value = favAttrs;

		send({
			action: 'SAVE_FAVORITE_ATTRIBUTES',
			payload: JSON.parse(JSON.stringify(favAttrs)) // JSON.parse prevents error when postMessage tries to copy an array proxy
		});
	}

	function onMessage(e) {
		// {
		//     action: 'name',
		//     iframeId: 'modal',
		//     payload: {}
		// }

		if (!e.data.action) {
			console.warn('Message without action sent');
			return false;
		}

		if (e.origin !== windowOrigin) {
			console.error('Received message from a different origin', e.origin);
			return false;
		}

		if (onMessageStack[e.data.action])
			onMessageStack[e.data.action](e.data.payload);
		else console.log('e.data.action:', e.data);
	}

	function cancel() {
		send({
			action: 'CANCEL_DIALOG'
		});
	}

	function save() {
		send({
			action: 'SAVE_DIALOG',
			payload: {
				selectedAttributes: JSON.parse(
					JSON.stringify(newSelAttrs.value)
				)
			}
		});
	}

	function init(data) {
		useToggleDarkMode(route.query.dark_mode === 'true');

		attrsList.value = data.attributes;

		/*disabledAttributes.value = data.attributes.filter(attr => {
			return data.selectedAttributes.includes(attr.key);
		});*/
		disabledAttributes.value = data.selectedAttributes;

		favoriteAttributes.value = data.favoriteAttributes;

		if (!favoriteAttributes.value || !favoriteAttributes.value.length) {
			isAdvanced.value = true;
		}

		selAttrsKeysList.value = data.selectedAttributes;

		if (data.title) title.value = data.title;

		readyStatus.value = true;
	}
</script>

<style lang="scss" scoped>
	.modal_top {
		height: 50px;
		padding: 0 20px;
		border-bottom: 1px solid var(--table-border-color);
	}

	.modal_content {
		overflow: auto;
		height: calc(100vh - 106px);
		min-width: 400px; // so that FmInputEntityNames could fit in
	}

	.modal_bottom {
		position: absolute;
		bottom: 0;
		width: 100%;
		border-top: 1px solid var(--table-border-color);
		padding: 10px 20px;
	}

	.modal {
		position: relative;
		width: 100%;
		height: 100vh;
		max-height: 100%;
		border-radius: 4px;
		z-index: 2;

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

	.select_count {
		background: var(--primary-color);
		width: 18px;
		height: 18px;
		line-height: 18px;
		text-align: center;
		color: #fff;
		margin-left: 11px;
		font-size: 12px;
		font-weight: 400;
		border-radius: 2px;
	}

	.content_grid {
		display: grid;
		grid-template-columns: 1fr 200px;
		height: 100%;

		&.collapsed {
			grid-template-columns: 1fr 32px;
		}

		&.advanced_mod {
			height: calc(100% - 48px);
		}

		&.advanced {
			grid-template-columns: 160px 1fr 200px;
		}

		&_left {
			border-right: 1px solid var(--table-border-color);
			height: 100%;
			overflow: auto;
			padding: 9px 0;
		}

		&_main {
			height: 100%;
			overflow: auto;
			padding: 10px 0;
		}

		&_right {
			position: relative;
			border-left: 1px solid var(--table-border-color);
			height: 100%;
			// overflow: auto;

			&.collapsed {
				.desc_title,
				.desc_subtitle,
				.desc_about,
				.desc_icons {
					display: none;
				}
			}

			&:hover .collapse {
				opacity: 1;
				visibility: visible;
			}
		}
	}

	.attr_item {
		padding: 0 20px;
		height: 26px;
		user-select: none;
		border: none;

		&.active {
			background: rgb(240 90 34 / 12%);

			.favorites {
				opacity: 1;
			}
		}

		&:hover .favorites {
			opacity: 1;
		}
	}

	.desc_title {
		padding: 0 13px;
		height: 40px;
		word-wrap: break-word;
	}

	.desc_subtitle {
		padding: 10px 13px;
		background: #fafafa;
		border-top: 1px solid var(--table-border-color);
		border-bottom: 1px solid var(--table-border-color);
		color: var(--card-secondary-text-color);
		word-wrap: break-word;
	}

	.desc_about {
		padding: 10px 13px;
		color: var(--card-secondary-text-color);
	}

	.collapse {
		position: absolute;
		top: 10px;
		left: -12px;
		border: 1px solid var(--table-border-color);
		background: #fff;
		border-radius: 50%;
		opacity: 0;
		visibility: hidden;
		transition: 0.3s;

		&.active {
			visibility: visible;
			opacity: 1;
		}
	}

	.favorites {
		opacity: 0;
		transition: 0.3s;

		&.active {
			opacity: 1;
		}
	}

	.expand_wrap {
		padding-left: 31px;
	}

	.expand {
		margin-left: -2px;
		margin-right: 9px;
	}

	.select_old {
		color: var(--card-secondary-text-color);
	}
</style>
