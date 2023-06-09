import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Document, Page, pdf } from "@react-pdf/renderer";
import {
  $getSelection,
  $insertNodes,
  CLEAR_EDITOR_COMMAND,
  TextNode,
} from "lexical";
import printJS from "print-js";
import { useState } from "react";
import Html from "react-pdf-html";
import { DateTimeNode } from "../Nodes/DateTimeNode";

function CreateDocument({ html }: { html: string }) {
  return (
    <Document>
      <Page>
        <Html>{`<html><body>${html}</body></html>`}</Html>
      </Page>
    </Document>
  );
}

interface Props {
  show: boolean;
  handleClick: (show: boolean) => void;
}

export default function SidebarPlugin({ handleClick, show }: Props) {
  const [editor] = useLexicalComposerContext();
  const [debugActive, setDebugActive] = useState(show);

  const date = new Date();

  const handleDateTimeClick = () => {
    editor.update(() => {
      const node = new DateTimeNode(date.toLocaleString());
      const nodes = [node, new TextNode(" ")];

      const selection = $getSelection();
      if (selection?.getTextContent()) {
        selection.insertNodes(nodes);
      } else {
        $insertNodes(nodes);
      }
    });
  };

  const handlePrintClick = () => {
    let html = "<p>nothing to print</p>";
    editor.update(() => {
      html = $generateHtmlFromNodes(editor, null);
    });

    pdf(CreateDocument({ html }))
      .toBlob()
      .then((blob) => URL.createObjectURL(blob))
      .then((url) => {
        printJS({
          printable: url,
          type: "pdf",
        });
      });
  };

  const handleDebugClick = () => {
    setDebugActive(!show);
    handleClick(!show);
  };

  return (
    <div className="sidebar">
      <button
        type="button"
        aria-label="insert date and time"
        title="insert date and time"
        onClick={handleDateTimeClick}
        className="sidebar-item sidebar-item__btn"
      >
        <span className="sidebar__icon icon__clock" />
      </button>

      <button
        type="button"
        onClick={handlePrintClick}
        className="sidebar-item sidebar-item__btn"
        aria-label="Export file"
        title="export file"
      >
        <span className="sidebar__icon icon__print" />
      </button>

      <button
        type="button"
        onClick={handleDebugClick}
        className={
          debugActive
            ? "sidebar-item sidebar-item__btn sidebar-item__btn--active"
            : "sidebar-item sidebar-item__btn"
        }
        aria-label="Debug editor"
        title="debug editor"
      >
        <span className="sidebar__icon icon__bug" />
      </button>

      <button
        type="button"
        className="sidebar-item sidebar-item__btn"
        onClick={() => {
          editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          editor.focus();
        }}
        title="Clear"
        aria-label="Clear editor contents"
      >
        <span className="sidebar__icon icon__trash" />
      </button>
    </div>
  );
}
