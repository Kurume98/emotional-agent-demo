import React, { useState, useEffect } from 'react';
import './components/CompleteApp.css';
import { emotionThemes } from './components/UnifiedEmotionalAgent';

function AppComplete() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  the [mood, setMood] = useState("neutral");
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");
  const [userName, setUserName] = useState("User");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      text: "Welcome to AIcognitech. I'm here to listen and support you.",
      sender: "bot",
      timestamp: new Date()
    }]);
  }, []);

  const analyzeTextEmotion = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("sad") || lowerText.includes("sorry") || lowerText.includes("upset") || lowerText.includes("depressed")) {
      return "sad";
    } else if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("great") || lowerText.includes("excited")) {
      return "happy";
    } else if (lowerText.includes("angry") || lowerText.includes("frustrated") || lowerText.includes("mad")) {
      return "angry";
    } else if (lowerText.includes("calm") || lowerText.includes("peaceful") || lowerText.includes("relaxed")) {
      return "calm";
    } else if (lowerText.includes("worried") || lowerText.includes("anxious") || lowerText.includes("scared")) {
      return "anxious";
    }
    return "neutral";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMood = analyzeTextEmotion(input);
    const userTheme = emotionThemes[userMood] || emotionThemes.neutral;
    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date(),
      mood: userMood,
      orb: userTheme.orb,
      background: userTheme.background,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMood = data.mood || analyzeTextEmotion(data.reply);
      const theme = emotionThemes[botMood] || emotionThemes.neutral;
      const botMessage = {
        text: data.reply,
        sender: "bot",
        timestamp: new Date(),
        mood: botMood,
        orb: data.orb || theme.orb,
        background: data.background || theme.background,
      };
      setMessages(prev => [...prev, botMessage]);

      setMood(botMood);
      setBackgroundColor(botMessage.background);

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        text: "I'm having trouble connecting. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInput("");
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
          <div className="logo-title">
            <img src="/aicognitech-logo.jpg" alt="AIcognitech" className="logo" />
            <h1>AIcognitech</h1>
          </div>
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
              <div
                key={idx}
                className={`message ${msg.sender}`}
                style={{ backgroundColor: msg.background }}
              >
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
          <p>© 2024 AIcognitech</p>
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
