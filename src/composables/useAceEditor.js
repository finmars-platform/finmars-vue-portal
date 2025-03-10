import { VAceEditor } from 'vue3-ace-editor';
import modeJsonUrl from 'ace-builds/src-noconflict/mode-json?url';
import modePython from 'ace-builds/src-noconflict/mode-python?url';
import modeJavascript from 'ace-builds/src-noconflict/mode-javascript?url';
import themeMonokaiUrl from 'ace-builds/src-noconflict/theme-monokai?url';
import extSearchboxUrl from 'ace-builds/src-noconflict/ext-searchbox?url';
import extLanguageTools from 'ace-builds/src-noconflict/ext-language_tools?url';

export default function useAceEditor(mode = 'json') {
	mode === 'json' && ace.config.setModuleUrl('ace/mode/json', modeJsonUrl);
	mode === 'python' && ace.config.setModuleUrl('ace/mode/python', modePython);
	mode === 'javascript' &&
		ace.config.setModuleUrl('ace/mode/javascript', modeJavascript);

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
