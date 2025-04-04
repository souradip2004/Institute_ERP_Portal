
import React from "react";

interface TitleBarProps {
  title: string;
}

const TitleBar: React.FC<TitleBarProps> = ({ title }) => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent px-4 py-4">
      <h1 className="text-xl font-medium text-white">{title}</h1>
    </div>
  );
};

export default TitleBar;
