import "./style.css";

// CSS import + Tailwind クラスの混在テスト
const MixedTest = () => {
	return (
		<div className="card p-6">
			<div className="card-title text-blue-500">Mixed Test</div>
			<p className="card-text mb-4">CSS import + Tailwind classes together.</p>
			<span className="badge bg-brand">Mixed</span>
		</div>
	);
};
