
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import axiosClient from "../Utils/axiosClient.js"; // Adjust path if needed

const ChatAi = ({problem}) => {
  const { register, handleSubmit, reset } = useForm();
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Hello! I'm your coding assistant. How can I help you today?" }] }
  ]);
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = async (data) => {
    const trimmed = data.message.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', parts: [{ text: trimmed }] };
    setMessages(prev => [...prev, userMessage]);
    reset();
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/AI/chat', {
        messages: trimmed,
        title:problem.title,
        description:problem.description,
        testCases:problem.visibleTestCases,
        startCode:problem.startCode
      });

      const aiText = response.data?.message || response.data?.response || "I got your message!";
      const aiMessage = {
        role: 'model',
        parts: [{ text: aiText }]
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorText = error.response?.data?.message || "Sorry, I encountered an error. Please try again.";
      const errorMessage = {
        role: 'model',
        parts: [{ text: errorText }]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] bg-base-100 rounded-lg overflow-hidden">
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`chat ${msg.role === 'model' ? 'chat-start' : 'chat-end'}`}>
            <div className={`chat-bubble ${msg.role === 'model' ? 'bg-base-300' : 'bg-primary text-primary-content'}`}>
              {msg.parts.map((part, i) => (
                <p key={i}>{part.text}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-base-300">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-base-100 p-4 border-t border-base-200">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
          <input
            {...register("message", { required: true, minLength: 1 })}
            placeholder="Type your message..."
            className="input input-bordered flex-1"
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAi;
