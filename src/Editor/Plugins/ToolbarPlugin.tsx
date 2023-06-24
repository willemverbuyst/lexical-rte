import {
  $createCodeNode,
  $isCodeNode,
  getCodeLanguages,
  getDefaultCodeLanguage,
} from "@lexical/code";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $isParentElementRTL, $wrapNodes } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./toolbar.css";

const LowPriority = 1;

const supportedBlockTypes = new Set<keyof typeof blockTypeToBlockName>([
  "paragraph",
  "quote",
  "code",
  "h1",
  "h2",
  "ul",
  "ol",
]);

const blockTypeToBlockName = {
  code: "Code Block",
  h1: "Large Heading",
  h2: "Small Heading",
  h3: "Heading",
  h4: "Heading",
  h5: "Heading",
  ol: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
  ul: "Bulleted List",
} as const;

function Select({
  onChange,
  options,
  value,
}: {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  value: string;
}) {
  return (
    <select onChange={onChange} value={value}>
      <option hidden value="" aria-label="empty" />
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

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

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null
  );
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] =
    useState(false);

  const [codeLanguage, setCodeLanguage] = useState("");
  const [, setIsRTL] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = ($isHeadingNode(
            element
          ) as unknown as keyof typeof blockTypeToBlockName)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
          }
        }
      }
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const codeLanguges = useMemo(() => getCodeLanguages(), []);
  const onCodeLanguageSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(e.target.value);
          }
        }
      });
    },
    [editor, selectedElementKey]
  );

  return (
    <div className="toolbar" ref={toolbarRef}>
      <div className="toolbar__item">
        <button
          disabled={!canUndo}
          type="button"
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          aria-label="Undo"
        >
          <span className="toolbar__icon icon__undo-button" />
        </button>
      </div>
      <div className="toolbar__item">
        <button
          disabled={!canRedo}
          type="button"
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          aria-label="Redo"
        >
          <span className="toolbar__icon icon__redo-button" />
        </button>
      </div>
      {supportedBlockTypes.has(blockType) && (
        <div className="toolbar__dropdown">
          <button
            type="button"
            onClick={() =>
              setShowBlockOptionsDropDown(!showBlockOptionsDropDown)
            }
            aria-label="Formatting Options"
          >
            <span className={`toolbar__icon icon__${blockType}`} />
            <span className="toolbar__dropdown-text">
              {blockTypeToBlockName[blockType]}
            </span>
            <span className="toolbar__dropdown-chevron icon__chevron-down" />
          </button>
          {showBlockOptionsDropDown &&
            createPortal(
              <BlockOptionsDropdownList
                editor={editor}
                blockType={blockType}
                toolbarRef={toolbarRef}
                setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
              />,
              document.body
            )}
        </div>
      )}
      {blockType === "code" ? (
        <div className="toolbar__select">
          <Select
            onChange={onCodeLanguageSelect}
            options={codeLanguges}
            value={codeLanguage}
          />
          <span className="toolbar__select-chevron icon__chevron-down" />
        </div>
      ) : (
        <>
          <div className="toolbar__item">
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
              }}
              className={`toolbar-item spaced ${isBold ? "active" : ""}`}
              aria-label="Format Bold"
            >
              <span className="toolbar__icon icon__type-bold" />
            </button>
          </div>
          <div className="toolbar__item">
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
              }}
              className={`toolbar-item spaced ${isItalic ? "active" : ""}`}
              aria-label="Format Italics"
            >
              <span className="toolbar__icon icon__type-italic" />
            </button>
          </div>
          <div className="toolbar__item">
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
              }}
              className={`toolbar-item spaced ${isUnderline ? "active" : ""}`}
              aria-label="Format Underline"
            >
              <span className="toolbar__icon icon__type-underline" />
            </button>
          </div>
          <div className="toolbar__item">
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
              }}
              className={`toolbar-item spaced ${
                isStrikethrough ? "active" : ""
              }`}
              aria-label="Format Strikethrough"
            >
              <span className="toolbar__icon icon__type-strikethrough" />
            </button>
          </div>
          <div className="toolbar__item">
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
              }}
              className={`toolbar-item spaced ${isCode ? "active" : ""}`}
              aria-label="Insert Code"
            >
              <span className="toolbar__icon icon__code" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
