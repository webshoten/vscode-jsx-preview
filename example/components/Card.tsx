import React from "react";

type CardProps = {
  title: string;
  children: React.ReactNode;
};

/* @preview
<Card title="ユーザー設定">
  <p>アカウント情報を更新できます</p>
</Card>
*/
export const Card = ({ title, children }: CardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
};
