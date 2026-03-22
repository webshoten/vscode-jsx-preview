// エラー表示のテスト（閉じタグが足りない）
const ErrorTest = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Error Test</h1>
      <p className="text-gray-600">
        This paragraph is never closed.
    </div>
  );
};
