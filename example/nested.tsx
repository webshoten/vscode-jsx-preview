import { Button } from "./components/Button";
import { Card } from "./components/Card";

// コンポーネントの中にコンポーネントがあるケース
const Nested = () => {
  return (
    <div className="p-6 bg-gray-100 flex flex-col gap-4">
      <Card title="ユーザー設定">
        <p className="text-gray-600 mb-4">アカウント情報を更新できます</p>
        <div className="flex gap-2">
          <Button>保存</Button>
          <Button variant="danger">削除</Button>
        </div>
      </Card>

      <Card title="通知">
        <p className="text-gray-600">新しい通知はありません</p>
      </Card>
    </div>
  );
};
