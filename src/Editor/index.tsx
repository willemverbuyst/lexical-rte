import { EditorState } from "lexical";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useState } from "react";
import AutoFocusPlugin from "./Plugins/AutoFocusPlugin";
import CodeHighlightPlugin from "./Plugins/CodeHighlightPlugin";
import SidebarPlugin from "./Plugins/SidebarPlugin";
import ToolbarPlugin from "./Plugins/ToolbarPlugin";
import TreeViewPlugin from "./Plugins/TreeViewPlugin";
import config from "./config";

function Placeholder() {
  return <div className="placeholder">Enter some text...</div>;
}

function onChange(editorState: EditorState) {
  editorState.read(() => {
    // const root = $getRoot();
    // const selection = $getSelection();
    // console.log(root, selection);
  });
}

export default function Editor() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <div className="editor-container">
      <LexicalComposer initialConfig={config}>
        <ToolbarPlugin />
        <SidebarPlugin handleClick={setShowDebugPanel} show={showDebugPanel} />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <AutoFocusPlugin />
        <CodeHighlightPlugin />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <ListPlugin />
        <TreeViewPlugin show={showDebugPanel} />
      </LexicalComposer>
    </div>
  );
}
