const Card = () => {
  return (
    <div className="max-w-sm rounded-xl overflow-hidden shadow-lg bg-white">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-gray-800">Mountain View</div>
        <p className="text-gray-600 text-base">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div className="px-6 pt-4 pb-4 flex gap-2">
        <span className="bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">#travel</span>
        <span className="bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">#nature</span>
        <span className="bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">#photo</span>
      </div>
    </div>
  );
};
