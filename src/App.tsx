import Editor from "./Editor";

function App() {
  return (
    <div className="container">
      <div className="link">
        <a
          href="https://github.com/willemverbuyst/lexical-rte"
          target="_blank"
          rel="noreferrer"
        >
          <span className="link__icon icon__github" />
        </a>
      </div>
      <h1 className="gradient-text">lexical rte</h1>
      <div className="editor-wrapper">
        <Editor />
      </div>
    </div>
  );
}

export default App;
