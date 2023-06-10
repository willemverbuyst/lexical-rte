import { $getRoot, $getSelection, EditorState } from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useState } from "react";
import Debug from "./Components/Debug";
import Placeholder from "./Components/Placeholder";
import config from "./config";
import AutoFocusPlugin from "./Plugins/AutoFocusPlugin";
import DateTimePlugin from "./Plugins/DateTimePlugin";
import HighlightPlugin from "./Plugins/HighlightPlugin";
import PrintPlugin from "./Plugins/PrintPlugin";
import TreeViewPlugin from "./Plugins/TreeViewPlugin";

function onChange(editorState: EditorState) {
  editorState.read(() => {
    const root = $getRoot();
    const selection = $getSelection();

    // eslint-disable-next-line no-console
    // console.log(root, selection);
  });
}

function Editor() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <div className="editor-container">
      <LexicalComposer initialConfig={config}>
        <div className="toolbar">
          <DateTimePlugin />
          <HighlightPlugin />
          <PrintPlugin />
          <Debug handleClick={setShowDebugPanel} show={showDebugPanel} />
        </div>
        <div className="sidebar">
          <DateTimePlugin />
          <HighlightPlugin />
          <PrintPlugin />
          <Debug handleClick={setShowDebugPanel} show={showDebugPanel} />
        </div>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <TreeViewPlugin show={showDebugPanel} />
      </LexicalComposer>
    </div>
  );
}

export default Editor;
