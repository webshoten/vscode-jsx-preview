const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-bold">MyApp</div>
      <div className="flex gap-6">
        <a className="hover:text-gray-300 cursor-pointer">Home</a>
        <a className="hover:text-gray-300 cursor-pointer">About</a>
        <a className="hover:text-gray-300 cursor-pointer">Contact</a>
      </div>
      <button className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600">
        Sign Up
      </button>
    </nav>
  );
};
