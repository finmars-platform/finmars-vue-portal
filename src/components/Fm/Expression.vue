<template>
	<BaseModal
		:modelValue="modelValue"
		@close="cancel()"
		title="Expression editor"
	>
		<div class="wrap pb-14 pt-5">
			<div>
				<div class="editor_block mx-5 m-b-24">
					<div class="editor_block_toolbar flex sb aic">
						<div class="editor_block_h">Expression</div>
						<div>
							<!-- <FmIcon
								icon="undo_variant"
							/> -->
						</div>
					</div>
					<code class="code_block">
						<div class="snippets">
							<div class="snippets_item"
								v-for="(item, index) in snippets"
								:key="index"
								@mousedown="paste( item )"
							>
								{{ item }}
							</div>
						</div>
						<div class="line flex aic">
							<div class="line_id" contenteditable="false">
								<div class="">1</div>
							</div>
							<pre ref="code_elem"
									 class="code"
									 contenteditable="true"
									 @input="change"
									 v-html="code"
									 @blur="snippets = []"></pre>
						</div>
					</code>
				</div>
				<div class="info ma-5">
					<div v-html="info" v-if="info"></div>
					<div v-else>
						<div class="info_item">
							<div class="text-h4 info_h">parse_date</div>
							<div>parse_date - Converting string attributes to date attributes</div>
						</div>

						<div class="info_item">
							<div class="text-h6 info_h">Description</div>
							<code class="info_code">parse_date([date_string], [format='%Y-%m-%d']): [date]</code>
							<div class="info_desc_text">
								This function may be used in: <br>
								- importing any objects (transactions, accounts, portfolio) with date attributes <br>
								- converting string attributes to date attributes
							</div>
						</div>

						<div class="info_item">
							<div class="text-h6 info_h">Parameters</div>
							<div class="info_param_block">
								<code class="info_param">[date_string]</code>
								<div class="info_param_text">String with date in text format</div>
							</div>
							<div class="info_param_block">
								<code class="info_param">[format]</code>
								<div class="info_param_text">String - reflects format in which [date_string] is written</div>
							</div>
						</div>

						<div class="info_item">
							<div class="text-h6 info_h">Examples</div>
							<div>
								parse_date(string_variable, format='%Y-%m-%d') for string variable with name string_variable, which contains this text - 2018-01-01
								parse_date(string_variable, format='%d-%m-%Y') for this text - 01-01-2018
								parse_date(string_variable, format='%Y/%m/%d') for this text - 2018/01/01
								parse_date(string_variable, format='%d.%m.%Y') for this text - 01.01.2018
								parse_date(string_variable, format='%Y.%m.%d') for this text - 2018.01.01

								parse_date('18.01.01', format='%y.%m.%d') for this text - 18.01.01
								parse_date('2018/September/01', format='%Y/%B/%d') for this text - 2018/September/01
								parse_date('01/September/18', format='%d/%b/%Y') for this text - 01/September/2018
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="right_side ">
				<BaseInput
					label="Search"
					placeholder="Search"
				/>
<!--				<v-list class="menu" v-model:opened="open">
					<v-list-group
						v-for="(group, title) in functions"
						:key="title"
					>
						<template v-slot:activator="{ props }">
							<v-list-item class="px-2" v-bind="props" :title="title" :value="title"></v-list-item>
						</template>

						<v-list-item
							v-for="({name, description}, i) in group"
							:key="i"
							:value="name"
							:title="name"
							@click="info = description"
						></v-list-item>
					</v-list-group>
				</v-list>-->
				<div class="expression_function_block">
					<div v-for="(group, title) in functions"
							 :key="title">

						<div><h3 class="text-bold p-r-8 p-l-8">{{ title }}</h3></div>

						<div class="fm_list">
							<div class="fm_list_item px-2"
									 v-for="({name, description}, i) in group"
									 :key="i"
									 @click="info = description"
							>
								<div>{{ name }}</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>

		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="cancel()">cancel</FmBtn>
				<FmBtn @click="save()">save</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import functions from '~/assets/data/expressions.js'
	import snippetsList from '~/assets/data/snippets.js'

	const props = defineProps([
		'modelValue', 'expressions'
	])
	const emit = defineEmits([
		'cancel', 'save'
	])

	let open = ref(['All'])
	let code_elem = ref()
	let info = ref('')
	let snippets = ref([])
	let currentSnip = ''

	let code = ref( props.expressions || '' )

	watch(
		() => props.expressions,
		() => { parse(props.expressions || '') }
	)

	parse(code.value)

	function change( event ) {
		let elem = event.target
		let pos = getCursorPosition(elem)

		if ( event.data ) {
			let enteredChar = '\\' + event.data; // escaping entered character
			let match = elem.innerText.slice(0, pos).match(new RegExp('[a-z\_]+' + enteredChar + '$'))

			if ( match ) {
				currentSnip = match
				snippets.value = snippetsList.filter(item => item.startsWith(currentSnip) )
			}
		}

		parse( elem.innerText )

		nextTick(() => {
			setCursorPosition(elem, pos)
		})
	}
	function paste( snippet ) {

		let stock = code_elem.value.innerText.replace(currentSnip, snippet)
		let pos = stock.indexOf( currentSnip )

		parse( stock )
		snippets.value = []

		nextTick(() => {
			setCursorPosition(code_elem.value, +pos + (snippet.length - currentSnip.length) + 1)
		})
	}
	function parse( val ) {
		code.value = val
			.replace(/([\-\+\=\/\*])/g, '<span class="signs">$1</span>')
			.replace(/([0-9]+)/g, '<span class="numbers">$1</span>')
			.replace(/([a-zA-Z\_]+)(?=\(.*\))/g, '<span class="func">$1</span>')
	}
	function save( ) {
		emit('save', code_elem.value.innerText)
	}
	function getCursorPosition(parent) {
		let selection = document.getSelection()
		let range = new Range

		range.setStart(parent, 0)
		range.setEnd(selection.anchorNode, selection.anchorOffset)

		return range.toString().length
	}
	function setCursorPosition(parent, position) {
		let child = parent.firstChild
		while(position > 0) {
			let length = child.textContent.length
			if(position > length) {
				position -= length
				child = child.nextSibling
			}
			else {
				if(child.nodeType == 3) return document.getSelection().collapse(child, position)
				child = child.firstChild
			}
		}
	}
	function cancel(params) {
		emit('cancel')
	}
</script>
<style lang="scss" scoped>

	.wrap {
		display: grid;
		grid-template-columns: 1fr 260px;
		max-width: 1000px;
	}
	.menu {
		padding-top: 0;
	}
	.editor_block_h {

	}
	.right_side {
		width: 260px;
		height: inherit;
		overflow: hidden;

	}
	.expression_function_block {
		max-height: 450px;
		overflow: auto;
	}
	.info {
		flex: 1;
		overflow: auto;

		&_h {
			margin-bottom: 10px;
		}
		&_item {
			padding-bottom: 20px;
		}
		&_code {
			display: block;
			border: 1px solid $border;
			border-radius: 5px;
			padding: 15px;
			background: #f6f6f6;
			margin-bottom: 10px;
			width: 100%;
		}
		&_param {
			color: #f05a22;
			margin-bottom: 5px;
		}
		&_param_block + &_param_block {
			margin-top: 20px;
		}
		&_param_text {
			padding-left: 20px;
		}
		&_desc_text {
			line-height: 1.5;
		}
	}
	.editor_block {
		border: 1px solid $border;
		border-radius: 5px;
		position: relative;
	}
	.editor_block_toolbar {
		background: #f6f6f6;
		padding: 11px 10px;
	}
	.code_block {
		padding: 15px 10px;
		padding-left: 5px;

		.func {
		color: green;
		}
		.signs {
			color: red;
		}
		.numbers {
			color: purple;
		}
	}
	.snippets {
		top: 100px;
    position: absolute;
    left: 39px;
		background: #fff;
		box-shadow: 0 0 10px 4px #e8e8e8;

		&_item {
			padding: 10px 14px;
			cursor: pointer;

			&:hover {
				background: #e8e8e8;
			}
		}
		&_item + &_item {
			border-top: 1px solid $border;
		}
	}
	.line_id {
		padding: 3px 10px;
		margin-right: 10px;
		border-right: 1px solid #cecece;
		color: #767676;
		font-size: 14px;
	}

</style>
