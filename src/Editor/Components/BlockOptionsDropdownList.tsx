import { $createCodeNode } from "@lexical/code";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $wrapNodes } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from "lexical";
import { useEffect, useRef } from "react";
import { blockTypeToBlockName } from "../constants";

function BlockOptionsDropdownList({
  editor,
  blockType,
  toolbarRef,
  setShowBlockOptionsDropDown,
}: {
  editor: LexicalEditor;
  blockType: keyof typeof blockTypeToBlockName;
  toolbarRef: React.MutableRefObject<HTMLDivElement | null>;
  setShowBlockOptionsDropDown: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const dropDownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const dropDown = dropDownRef.current;

    if (toolbar !== null && dropDown !== null) {
      const { top, left } = toolbar.getBoundingClientRect();
      dropDown.style.top = `${top + 40}px`;
      dropDown.style.left = `${left}px`;
    }
  }, [dropDownRef, toolbarRef]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const dropDown = dropDownRef.current;
    const toolbar = toolbarRef.current;

    if (dropDown !== null && toolbar !== null) {
      const handle = (event: MouseEvent) => {
        const { target } = event;

        if (
          !dropDown.contains(target as Node) &&
          !toolbar.contains(target as Node)
        ) {
          setShowBlockOptionsDropDown(false);
        }
      };
      document.addEventListener("click", handle);

      return () => {
        document.removeEventListener("click", handle);
      };
    }
  }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef]);

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatLargeHeading = () => {
    if (blockType !== "h1") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode("h1"));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatSmallHeading = () => {
    if (blockType !== "h2") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode("h2"));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createCodeNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  return (
    <div className="dropdown" ref={dropDownRef}>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatParagraph}
      >
        <span className="dropdown__icon icon__paragraph" />
        <span className="dropdown__item-text">Normal</span>
        {blockType === "paragraph" && (
          <span className="dropdown__item--active" />
        )}
      </button>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatLargeHeading}
      >
        <span className="dropdown__icon icon__large-heading" />
        <span className="dropdown__item-text">Large Heading</span>
        {blockType === "h1" && <span className="dropdown__item--active" />}
      </button>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatSmallHeading}
      >
        <span className="dropdown__icon icon__small-heading" />
        <span className="dropdown__item-text">Small Heading</span>
        {blockType === "h2" && <span className="dropdown__item--active" />}
      </button>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatBulletList}
      >
        <span className="dropdown__icon icon__bullet-list" />
        <span className="dropdown__item-text">Bullet List</span>
        {blockType === "ul" && <span className="dropdown__item--active" />}
      </button>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatNumberedList}
      >
        <span className="dropdown__icon icon__numbered-list" />
        <span className="dropdown__item-text">Numbered List</span>
        {blockType === "ol" && <span className="dropdown__item--active" />}
      </button>
      <button type="button" className="dropdown__item" onClick={formatQuote}>
        <span className="dropdown__icon icon__quote" />
        <span className="dropdown__item-text">Quote</span>
        {blockType === "quote" && <span className="dropdown__item--active" />}
      </button>
      <button type="button" className="dropdown__item" onClick={formatCode}>
        <span className=" dropdown__icon icon__code" />
        <span className="dropdown__item-text">Code Block</span>
        {blockType === "code" && <span className="dropdown__item--active" />}
      </button>
    </div>
  );
}

export default BlockOptionsDropdownList;
