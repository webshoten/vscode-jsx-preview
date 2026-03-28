import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "danger";
};

// @preview <Button variant="danger">削除する</Button>
export const Button = ({ children, variant = "primary" }: ButtonProps) => {
  const colors =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600"
      : "bg-blue-500 hover:bg-blue-600";

  return (
    <button className={`${colors} text-white px-4 py-2 rounded`}>
      {children}
    </button>
  );
};
