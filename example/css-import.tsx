import "./style.css";

// 通常のCSS importのテスト
// → style.css のクラスがプレビューに反映されればOK
const CssImportTest = () => {
  return (
    <div className="card">
      <div className="card-title">CSS Import Test</div>
      <p className="card-text">
        This card is styled with a regular CSS file, not Tailwind.
      </p>
      <span className="badge">Plain CSS</span>
    </div>
  );
};
