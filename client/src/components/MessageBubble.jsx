import React from "react";

export default function MessageBubble({ message, isOwn }) {
  const bubbleClasses = isOwn
    ? "bg-green-500 text-white self-end"
    : "bg-white text-gray-800 self-start";

  const statusIcons = {
    sent: "✓",
    delivered: "✓✓",
    read: "✓✓" 
  };

  return (
    <div className={`max-w-xs mb-2 p-3 rounded-lg shadow ${bubbleClasses}`}>
      <div>{message.text}</div>
      <div className="text-xs flex justify-between mt-1">
        <span>{new Date(Number(message.timestamp) * 1000).toLocaleTimeString()}</span>
        {isOwn && <span>{statusIcons[message.status]}</span>}
      </div>
    </div>
  );
}
