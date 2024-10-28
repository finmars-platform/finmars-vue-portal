<template>
	<div>
		<div id="jstree_explorer" style="width: 100%; overflow: hidden"></div>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import jQuery from 'jquery'
	import 'jstree/dist/jstree.min.js'
	import 'jstree/dist/themes/default/style.min.css'

	const alreadyMadeRequests = ref(['']);
	const path = ref('');
	const emit = defineEmits(['pathForMove']);

	function buildTreeData (data, nodePath) {
		return data.map(function (item) {
			return {
				path: nodePath,
				text: item.name,
				type: item.type === 'dir' ? 'folder' : 'file',
				children: item.type === 'dir' ? [] : null
			};
		});
	};

	const listFiles = async (path) => {
		try {
			const data = await useApi('explorer.get', {
				filters: { page_size: 100, page: 1, path: path }
			});
			if (data) {
				const result =  data.results.filter(function (item) {
					let result = true;
					if (item.name[0] === '.') {
						result = false;
					}
					emit('pathForMove', path);
					return result;
				})
				return buildTreeData(result, path);
			}
			return [];
		} catch (e) {
			console.warn('Error explorer.get', e)
		}
	}

	listFiles(path.value).then((data)=> {
		jQuery('#jstree_explorer').jstree({
			"core": {
				"animation": 0,
				"check_callback": true,
				"themes": { "stripes": true },
				'data': [
					{
						'text': 'Root',
						'state': { 'opened': true, 'selected': true },
						'children': data
					}
				]
			},
			"types": {
				"#": {
					"valid_children": ["root"]
				},
				"root": {
					"icon": "/img/ic_folder_black_1x.png",
					"valid_children": ["default"]
				},
				"default": {
					"icon": "/img/ic_label_outline_black_1x.png",
					"valid_children": ["default", "folder"]
				},
				"folder": {
					"icon": "/img/ic_folder_black_1x.png",
					"valid_children": ["default", "folder"]
				}
			},
			"plugins": [
				"contextmenu", "dnd", "search",
				"state", "types", "wholerow"
			]
		});

		jQuery('#jstree_explorer').on('changed.jstree', function (e, data) {
			const node = data.node;
			path.value = "";
			if(node) {
				let nodeParents = [...node.parents];
				nodeParents.sort((a, b) => {
					if (a === "#") return 1;
					if (b === "#") return -1;
					return a.localeCompare(b);
				});

				nodeParents.forEach((parent) => {
					if (parent !== "#" && document.getElementById(parent + '_anchor').text === "Root") {
						return;
					}
					if (parent === "#") {
						path.value = path.value + node.text;
					} else {
						path.value = path.value  + document.getElementById(parent + '_anchor').text + '/';
					}
				})
				if (path.value === "Root") {
					path.value = "";
				}
				if(!alreadyMadeRequests.value.includes(path.value)) {
					listFiles(path.value).then(function (treeDataChild) {
						if (treeDataChild.length) {
							treeDataChild.forEach(function (childData) {
								jQuery('#jstree_explorer').jstree(
									'create_node',
									jQuery('#'+ node.id),  // Parent node selector
									childData,             // Node data to be added
									'last',                // Position in parent
									false,                 // Do not select node after creation
									false                  // Do not open node after creation
								);
							});
						}
					});
					alreadyMadeRequests.value.push(path.value);
				}
			}
		});
	})
</script>

<style scoped>

	:deep() {
		.jstree-wholerow {
			background: transparent !important;
		}
		.jstree-wholerow-hovered {
			background: transparent !important;
		}
		.jstree-wholerow-clicked{
			background: var(--activeState-backgroundColor) !important;
		}
	}
</style>
