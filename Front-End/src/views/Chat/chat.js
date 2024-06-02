import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./chat.css";

const baseURL = "http://localhost:3001/chat";
const authURL = "http://localhost:3010/auth";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Function to check token validity
  const checkTokenValidity = useCallback(async () => {
    try {
      const response = await axios.get(`${authURL}/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.valid;
    } catch (error) {
      console.error("Error during authentication:", error);
      return false;
    }
  }, [token]);

  // Function to refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(`${authURL}/refresh-token`, { token });
      return response.data.newToken;
    } catch (error) {
      console.error("Error while refreshing token:", error);
      return null;
    }
  }, [token]);

  // Effect to fetch data and validate token on mount
  useEffect(() => {
    const fetchData = async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        const newToken = await refreshToken();
        if (newToken) {
          localStorage.setItem("token", newToken);
          setToken(newToken);
        } else {
          console.error("Failed to refresh token");
          return;
        }
      }
    };

    fetchData();
  }, [checkTokenValidity, refreshToken]);

  // Effect to fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`${baseURL}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChatHistory(response.data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [token]);
  console.log("Token:", token);

  // Function to handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = { message: inputMessage, response: "..." };
    setMessages([...messages, newMessage]);

    try {
      const response = await axios.post(
        baseURL,
        { message: inputMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botResponse = response.data.response;

      setMessages((prevMessages) =>
        prevMessages.map((msg, idx) =>
          idx === prevMessages.length - 1
            ? { ...msg, response: botResponse }
            : msg
        )
      );
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Function to handle selecting a chat history item
  const handleSelectHistory = (selectedMessages) => {
    setMessages(selectedMessages);
  };

  // Effect to scroll to bottom of chat messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="chat-page">
      <div id="sidebar">
        <h2>Chat History</h2>
        <ul>
          {chatHistory.map((historyItem, index) => (
            <li
              key={index}
              onClick={() => handleSelectHistory(historyItem.messages)}
            >
              {historyItem.message.substring(0, 20)}...
            </li>
          ))}
        </ul>
      </div>
      <div id="chat-container">
        <div id="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <div className="user-message">{msg.message}</div>
              <div className="bot-response">{msg.response}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div id="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
