// 標準のTailwindクラスだけ使用
const Standard = () => {
  return (
    <div className="flex gap-4 p-6 bg-gray-100">
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Save
      </button>
      <button className="bg-red-500 text-white px-4 py-2 rounded">
        Delete
      </button>
    </div>
  );
};
