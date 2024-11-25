import { VAceEditor } from 'vue3-ace-editor';
import modeJsonUrl from 'ace-builds/src-noconflict/mode-json?url';
import themeMonokaiUrl from 'ace-builds/src-noconflict/theme-monokai?url';
import extSearchboxUrl from 'ace-builds/src-noconflict/ext-searchbox?url';
import extLanguageTools from 'ace-builds/src-noconflict/ext-language_tools?url';

export default function useAceEditor() {
	ace.config.setModuleUrl('ace/mode/json', modeJsonUrl);
	ace.config.setModuleUrl('ace/theme/monokai', themeMonokaiUrl);
	ace.config.setModuleUrl('ace/ext/searchbox', extSearchboxUrl);
	ace.config.setModuleUrl('ace/ext/language_tools', extLanguageTools);

	function onEditorInit(editor) {
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14);
		editor.setBehavioursEnabled(true);
		editor.navigateFileStart();
	}

	return {
		VAceEditor,
		onEditorInit
	};
}
