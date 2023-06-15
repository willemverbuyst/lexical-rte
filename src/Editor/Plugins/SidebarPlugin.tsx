import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import { Document, Page, pdf } from "@react-pdf/renderer";
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  TextNode,
} from "lexical";
import printJS from "print-js";
import { useState } from "react";
import Html from "react-pdf-html";
import { DateTimeNode } from "../Nodes/DateTimeNode";
import "./sidebar.css";

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
  const [active, setActive] = useState(false);

  const date = new Date();
  const color = "#f8ff00";

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

  const handleHighlightClick = () => {
    const newActiveState = !active;
    setActive(newActiveState);

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "background-color": newActiveState ? color : "none",
        });
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

  return (
    <div className="sidebar">
      <button
        type="button"
        aria-label="insert date and time"
        title="insert date and time"
        onClick={handleDateTimeClick}
        className="sidebar__item"
      >
        <span className="sidebar__icon icon__clock" />
      </button>

      <button
        type="button"
        aria-label="highlight selection"
        title="highlight selection"
        onClick={handleHighlightClick}
        className="sidebar__item"
      >
        <span className="sidebar__icon icon__highlight" />
      </button>

      <button
        type="button"
        aria-label="export file"
        title="export file"
        onClick={handlePrintClick}
        className="sidebar__item"
      >
        <span className="sidebar__icon icon__print" />
      </button>

      <button
        type="button"
        aria-label="debug editor"
        title="debug editor"
        onClick={() => handleClick(!show)}
        className="sidebar__item"
      >
        <span className="sidebar__icon icon__bug" />
      </button>
    </div>
  );
}
