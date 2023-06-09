import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState } from "lexical";
import { useState } from "react";
import config from "./Config";
import AutoFocusPlugin from "./Plugins/AutoFocusPlugin";
import CodeHighlightPlugin from "./Plugins/CodeHighlightPlugin";
import SidebarPlugin from "./Plugins/SidebarPlugin";
import ToolbarPlugin from "./Plugins/ToolbarPlugin";
import TreeViewPlugin from "./Plugins/TreeViewPlugin";

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
        <LinkPlugin />
        <ClearEditorPlugin />
        <TreeViewPlugin show={showDebugPanel} />
      </LexicalComposer>
    </div>
  );
}
