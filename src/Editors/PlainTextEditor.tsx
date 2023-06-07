import { $getRoot, $getSelection, EditorState } from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import AutoFocusPlugin from "./AutoFocusPlugin";
import { DateTimeNode } from "./DateTimeNode";
import DateTimePlugin from "./DateTimePlugin";
import HighlightPlugin from "./HighlightPlugin";
import PrintPlugin from "./PrintPlugin";
import TreeViewPlugin from "./TreeViewPlugin";

const theme = {};

function onChange(editorState: EditorState) {
  editorState.read(() => {
    const root = $getRoot();
    const selection = $getSelection();

    // eslint-disable-next-line no-console
    // console.log(root, selection);
  });
}

function onError(error: Error) {
  throw new Error(error.message);
}

function PlaintTextEditor() {
  const initialConfig = {
    namespace: "PlainEditorTest",
    theme,
    onError,
    nodes: [DateTimeNode],
  };

  return (
    <div className="editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="toolbar">
          <DateTimePlugin date={new Date()} />
          <HighlightPlugin color="#f8ff00" />
          <PrintPlugin />
        </div>
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={
            <div className="editor-input__placeholder">Enter some text...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <TreeViewPlugin />
      </LexicalComposer>
    </div>
  );
}

export default PlaintTextEditor;
