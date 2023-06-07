import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Document, Page, pdf } from "@react-pdf/renderer";
import printJS from "print-js";
import Html from "react-pdf-html";
import Export from "../Components/Export";

function CreateDocument({ html }: { html: string | null }) {
  return (
    <Document>
      <Page>
        <Html>{`<html><body>${html}</body></html>`}</Html>
      </Page>
    </Document>
  );
}

export default function ExportPlugin() {
  const [editor] = useLexicalComposerContext();
  let html = "<p>testing</p>";

  const handleClick = () => {
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

  return <Export handleClick={handleClick} />;
}
