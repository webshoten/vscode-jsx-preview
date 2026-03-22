// カスタムカラー（brand, subtle）を使用
// → Tailwind CLIなら表示される。CDNでは表示されない
const Custom = () => {
  return (
    <div className="p-6 bg-subtle rounded-lg">
      <h1 className="text-2xl font-bold text-brand mb-4">Custom Colors</h1>
      <p className="text-gray-600 mb-4">brandとsubtleはtailwind.config.jsで定義したカスタムカラーです</p>
      <button className="bg-brand text-white px-6 py-2 rounded-md">
        Action
      </button>
    </div>
  );
};
