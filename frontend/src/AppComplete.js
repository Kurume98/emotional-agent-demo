import React, { useState, useEffect } from 'react';
import './components/CompleteApp.css';

function AppComplete() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState("neutral");
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");
  const [userName, setUserName] = useState("User");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      text: "Welcome to Adaptive Emotional Intelligence. I'm here to listen and support you.",
      sender: "bot",
      timestamp: new Date()
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      text: input, 
      sender: "user", 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { 
        text: data.reply, 
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Update mood based on response
      updateMood(data.reply);
      
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { 
        text: "I'm having trouble connecting. Please try again.", 
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInput("");
  };

  const updateMood = (text) => {
    const lowerText = text.toLowerCase();
    let newMood = "neutral";
    let newColor = "#f5f5f5";

    if (lowerText.includes("sad") || lowerText.includes("sorry") || lowerText.includes("upset") || lowerText.includes("depressed")) {
      newMood = "sad";
      newColor = "#e3f2fd";
    } else if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("great") || lowerText.includes("excited")) {
      newMood = "happy";
      newColor = "#fff3e0";
    } else if (lowerText.includes("angry") || lowerText.includes("frustrated") || lowerText.includes("mad")) {
      newMood = "angry";
      newColor = "#ffebee";
    } else if (lowerText.includes("calm") || lowerText.includes("peaceful") || lowerText.includes("relaxed")) {
      newMood = "calm";
      newColor = "#e8f5e8";
    }

    setMood(newMood);
    setBackgroundColor(newColor);
  };

  const getMoodEmoji = () => {
    switch (mood) {
      case "happy": return "😊";
      case "sad": return "😢";
      case "angry": return "😠";
      case "calm": return "😌";
      default: return "😐";
    }
  };

  const getMoodColor = () => {
    switch (mood) {
      case "happy": return "#4caf50";
      case "sad": return "#2196f3";
      case "angry": return "#f44336";
      case "calm": return "#ff9800";
      default: return "#9e9e9e";
    }
  };

  return (
    <div className="app-container" style={{ backgroundColor }}>
      <header className="app-header">
        <div className="header-content">
          <h1>Adaptive Emotional Intelligence</h1>
          <div className="user-profile">
            <div className="profile-icon">👤</div>
            <span>{userName}</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="mood-display">
          <div className="mood-orb" style={{ backgroundColor: getMoodColor() }}>
            <div className="mood-emoji">{getMoodEmoji()}</div>
            <div className="mood-label">{mood.toUpperCase()}</div>
          </div>
        </div>

        <div className="chat-container">
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
                <div className="message-timestamp">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="message-input"
            />
            <button onClick={handleSend} className="send-button">
              Send
            </button>
            <button 
              onClick={() => setIsListening(!isListening)}
              className={`mic-button ${isListening ? 'listening' : ''}`}
            >
              🎤
            </button>
          </div>
        </div>

        <div className="emotional-arc">
          <h3>Emotional Journey</h3>
          <div className="arc-visualization">
            {messages.slice(-5).map((msg, idx) => (
              <div key={idx} className={`arc-point ${msg.sender}`}>
                <div className="arc-message">{msg.text.substring(0, 30)}...</div>
                <div className="arc-time">{msg.timestamp.toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2024 Adaptive Emotional Intelligence</p>
          <div className="footer-links">
            <span>Privacy</span>
            <span>Support</span>
            <span>About</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppComplete;
