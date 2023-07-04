/* eslint-disable no-param-reassign */
import {
  $createCodeNode,
  $isCodeNode,
  getCodeLanguages,
  getDefaultCodeLanguage,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
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
import {
  $getSelectionStyleValueForProperty,
  $isAtNodeEnd,
  $isParentElementRTL,
  $patchStyleText,
  $wrapNodes,
} from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  GridSelection,
  LexicalEditor,
  NodeSelection,
  REDO_COMMAND,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

const backgroundColors = {
  "#fdff00": false,
  "#ff9a00": false,
  "#00ff04": false,
  "#00c5ff": false,
  "#ff00a7": false,
  transparent: true,
};

const fontColors = {
  "#fff": false,
  "#000": false,
  "#0000ff": false,
  "#ff0000": false,
  "#00ff00": false,
  "#aaa": true,
};

function getSelectedNode(selection: RangeSelection) {
  const { anchor } = selection;
  const { focus } = selection;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  }
  return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
}

function positionEditorElement(editor: HTMLDivElement, rect: DOMRect | null) {
  if (rect === null) {
    editor.style.opacity = "0";
    editor.style.top = "-1000px";
    editor.style.left = "-1000px";
  } else {
    editor.style.opacity = "1";
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
    }px`;
  }
}

function FloatingLinkEditor({ editor }: { editor: LexicalEditor }) {
  const editorRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | NodeSelection | GridSelection | null
  >(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();

    if (!nativeSelection) {
      return;
    }

    const { activeElement } = document;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild as HTMLElement;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      positionEditorElement(editorElem, null);
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl("");
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className="link-editor">
      {isEditMode ? (
        <input
          ref={inputRef}
          className="link-editor__input"
          value={linkUrl}
          onChange={(event) => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (lastSelection !== null) {
                if (linkUrl !== "") {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                }
                setEditMode(false);
              }
            } else if (event.key === "Escape") {
              event.preventDefault();
              setEditMode(false);
            }
          }}
        />
      ) : (
        <div className="link-editor__input">
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {linkUrl}
          </a>
          <button
            type="button"
            className="link-editor__button"
            onClick={() => setEditMode(true)}
          >
            <span className="link-editor__icon icon__highlight" />
          </button>
        </div>
      )}
    </div>
  );
}

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
    <div className="toolbar-item__dropdown-options" ref={dropDownRef}>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatParagraph}
      >
        <span className="dropdown__item-icon icon__paragraph" />
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
        <span className="dropdown__item-icon icon__large-heading" />
        <span className="dropdown__item-text">Large Heading</span>
        {blockType === "h1" && <span className="dropdown__item--active" />}
      </button>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatSmallHeading}
      >
        <span className="dropdown__item-icon icon__small-heading" />
        <span className="dropdown__item-text">Small Heading</span>
        {blockType === "h2" && <span className="dropdown__item--active" />}
      </button>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatBulletList}
      >
        <span className="dropdown__item-icon icon__bullet-list" />
        <span className="dropdown__item-text">Bullet List</span>
        {blockType === "ul" && <span className="dropdown__item--active" />}
      </button>
      <button
        type="button"
        className="dropdown__item"
        onClick={formatNumberedList}
      >
        <span className="dropdown__item-icon icon__numbered-list" />
        <span className="dropdown__item-text">Numbered List</span>
        {blockType === "ol" && <span className="dropdown__item--active" />}
      </button>
      <button type="button" className="dropdown__item" onClick={formatQuote}>
        <span className="dropdown__item-icon icon__quote" />
        <span className="dropdown__item-text">Quote</span>
        {blockType === "quote" && <span className="dropdown__item--active" />}
      </button>
      <button type="button" className="dropdown__item" onClick={formatCode}>
        <span className=" dropdown__item-icon icon__code" />
        <span className="dropdown__item-text">Code Block</span>
        {blockType === "code" && <span className="dropdown__item--active" />}
      </button>
    </div>
  );
}

function ColorPicker({
  onChange,
  toolbarRef,
  close,
  colorMap,
  type,
}: {
  onChange: (color: string) => void;
  toolbarRef: React.MutableRefObject<HTMLDivElement | null>;
  close: () => void;
  colorMap: Record<string, boolean>;
  type: "Font" | "Background";
}) {
  const colorPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const dropDown = colorPickerRef.current;

    if (toolbar !== null && dropDown !== null) {
      const { top, left } = toolbar.getBoundingClientRect();
      dropDown.style.top = `${top + 40}px`;
      dropDown.style.left = `${left + 460}px`;
    }
  }, [colorPickerRef, toolbarRef]);

  const [colors, setColors] = useState(colorMap);

  const handleSelectColor = (color: keyof typeof colors) => {
    (Object.keys(colors) as Array<keyof typeof colors>).forEach((k) => {
      colors[k] = k === color;
    });

    setColors({ ...colors });
    onChange(color);
  };

  return (
    <div className="color-picker" ref={colorPickerRef}>
      <div className="picker__swatches">
        {(Object.keys(colors) as Array<keyof typeof colors>)
          .slice(0, -1)
          .map((presetColor) => (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <button
              type="button"
              key={presetColor}
              className="picker__swatch"
              style={{
                background: presetColor,
                transform: `scale(${colors[presetColor] ? 1.2 : 1})`,
              }}
              onClick={() => handleSelectColor(presetColor)}
            />
          ))}
      </div>
      <div className="picker__reset">
        <button
          type="button"
          className="picker__action-btn"
          onClick={() =>
            handleSelectColor(type === "Background" ? "transparent" : "#aaa")
          }
        >
          clear
        </button>
        <button type="button" className="picker__action-btn" onClick={close}>
          ok
        </button>
      </div>
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
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] =
    useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);

  const [, setFontColor] = useState("#000");
  const [, setBgColor] = useState("transparent");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [, setIsRTL] = useState(false);
  const [isLink, setIsLink] = useState(false);
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

      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      setFontColor(
        $getSelectionStyleValueForProperty(selection, "color", "#000")
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "transparent"
        )
      );
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

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor]
  );

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ "background-color": value });
    },
    [applyStyleText]
  );

  const closeBgColorSelect = () => {
    setShowBackgroundColorPicker(false);
  };

  const closeFontColorSelect = () => {
    setShowFontColorPicker(false);
  };

  const handleBgColorSelect = () => {
    if (showFontColorPicker) {
      setShowFontColorPicker(false);
    }
    setShowBackgroundColorPicker((prev) => !prev);
  };

  const handleFontColorSelect = () => {
    if (showBackgroundColorPicker) {
      setShowBackgroundColorPicker(false);
    }
    setShowFontColorPicker((prev) => !prev);
  };

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        type="button"
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        aria-label="Undo"
        className="toolbar-item toolbar-item__btn-group toolbar-item__btn-group-left"
      >
        <span className="toolbar__icon icon__undo-button" />
      </button>
      <button
        disabled={!canRedo}
        type="button"
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        aria-label="Redo"
        className="toolbar-item toolbar-item__btn-group toolbar-item__btn-group-right"
      >
        <span className="toolbar__icon icon__redo-button" />
      </button>

      {supportedBlockTypes.has(blockType) && (
        <button
          type="button"
          onClick={() => setShowBlockOptionsDropDown(!showBlockOptionsDropDown)}
          aria-label="Formatting Options"
          className="toolbar-item toolbar-item__dropdown"
        >
          <span className={`toolbar__icon icon__${blockType}`} />
          <span className="toolbar-item__dropdown-text">
            {blockTypeToBlockName[blockType]}
          </span>
          <span className="toolbar-item__dropdown-chevron icon__chevron-down" />
        </button>
      )}
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

      {blockType === "code" ? (
        <div className="toolbar-item toolbar-item__select">
          <Select
            onChange={onCodeLanguageSelect}
            options={codeLanguges}
            value={codeLanguage}
          />
          <span className="toolbar-item__select-chevron icon__chevron-down" />
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={
              isBold
                ? "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-left toolbar-item__btn-group-left--active"
                : "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-left"
            }
            aria-label="Format Bold"
          >
            <span className="toolbar__icon icon__type-bold" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={
              isItalic
                ? "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle toolbar-item__btn-group-middle--active"
                : "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle"
            }
            aria-label="Format Italics"
          >
            <span className="toolbar__icon icon__type-italic" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={
              isUnderline
                ? "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle toolbar-item__btn-group-middle--active"
                : "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle"
            }
            aria-label="Format Underline"
          >
            <span className="toolbar__icon icon__type-underline" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            className={
              isStrikethrough
                ? "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle toolbar-item__btn-group-middle--active"
                : "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle"
            }
            aria-label="Format Strikethrough"
          >
            <span className="toolbar__icon icon__type-strikethrough" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            className={
              isCode
                ? "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-right toolbar-item__btn-group-right--active"
                : "toolbar-item toolbar-item__btn-group toolbar-item__btn-group-right"
            }
            aria-label="Insert Code"
          >
            <span className="toolbar__icon icon__code" />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className={
              isLink
                ? "toolbar-item toolbar-item__btn toolbar-item__btn--active"
                : "toolbar-item toolbar-item__btn"
            }
            aria-label="Insert Link"
          >
            <span className="toolbar__icon icon__link" />
          </button>
          {isLink &&
            createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
          <button
            type="button"
            onClick={handleBgColorSelect}
            className={
              showBackgroundColorPicker
                ? "toolbar-item toolbar-item__btn toolbar-item__btn--active"
                : "toolbar-item toolbar-item__btn"
            }
            aria-label="Formatting background color"
          >
            <span className="toolbar__icon icon__paint-bucket" />
          </button>
          {showBackgroundColorPicker &&
            createPortal(
              <ColorPicker
                onChange={onBgColorSelect}
                toolbarRef={toolbarRef}
                close={closeBgColorSelect}
                colorMap={backgroundColors}
                type="Background"
              />,
              document.body
            )}
          <button
            type="button"
            onClick={handleFontColorSelect}
            className={
              showFontColorPicker
                ? "toolbar-item toolbar-item__btn toolbar-item__btn--active"
                : "toolbar-item toolbar-item__btn"
            }
            aria-label="Formatting background color"
          >
            <span className="toolbar__icon icon__pencil-fill" />
          </button>
          {showFontColorPicker &&
            createPortal(
              <ColorPicker
                onChange={onFontColorSelect}
                toolbarRef={toolbarRef}
                close={closeFontColorSelect}
                colorMap={fontColors}
                type="Font"
              />,
              document.body
            )}
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
            }}
            className="toolbar-item toolbar-item__btn-group toolbar-item__btn-group-left"
            aria-label="Insert Code"
          >
            <span className="toolbar__icon icon__text-left" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
            }}
            className="toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle"
            aria-label="Insert Code"
          >
            <span className="toolbar__icon icon__text-center" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
            }}
            className="toolbar-item toolbar-item__btn-group toolbar-item__btn-group-middle"
            aria-label="Insert Code"
          >
            <span className="toolbar__icon icon__text-justify" />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
            }}
            className="toolbar-item toolbar-item__btn-group toolbar-item__btn-group-right"
            aria-label="Insert Code"
          >
            <span className="toolbar__icon icon__text-right" />
          </button>
        </>
      )}
    </div>
  );
}
