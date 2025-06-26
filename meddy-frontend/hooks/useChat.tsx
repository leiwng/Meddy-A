import { useState } from "react";

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
}