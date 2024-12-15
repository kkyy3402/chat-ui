import { motion } from "framer-motion";

interface ChatMessageProps {
  message: {
    content: string;
    role: "user" | "assistant";
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg shadow-md ${
          isUser
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {message.content}
      </motion.div>
    </motion.div>
  );
}
