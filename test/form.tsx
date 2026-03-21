const LoginForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none" />
        </div>
        <button className="w-full bg-indigo-600 text-white py-2 px-4 mb-2 rounded-md hover:bg-indigo-700">
          Sign In
        </button>
        <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
          Sign Up
        </button>
      </div>
    </div>
  );
};
