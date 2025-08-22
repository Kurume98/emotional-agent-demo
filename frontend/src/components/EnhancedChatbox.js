import React, { useState, useEffect, useRef } from "react";

function EnhancedChatbox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [backgroundColor, setBackgroundColor] = useState("#f9fafb");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { text: data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);

      // Update mood based on response
      updateMood(data.reply);
      
    } catch (error) {
      console.error("Error talking to backend:", error);
    }

    setInput("");
  };

  const updateMood = (text) => {
    const lowerText = text.toLowerCase();
    let newMood = "neutral";
    let newColor = "#f9fafb";

    if (lowerText.includes("sad") || lowerText.includes("sorry") || lowerText.includes("upset")) {
      newMood = "sad";
      newColor = "#e3f2fd";
    } else if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("great")) {
      newMood = "happy";
      newColor = "#fff3e0";
    } else if (lowerText.includes("angry") || lowerText.includes("frustrated")) {
      newMood = "angry";
      newColor = "#ffebee";
    } else if (lowerText.includes("calm") || lowerText.includes("peaceful")) {
      newMood = "calm";
      newColor = "#e8f5e8";
    }

    setMood(newMood);
    setBackgroundColor(newColor);
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
      <div className="chat-container">
        <div className="mood-orb" style={{ backgroundColor: getMoodColor() }}>
          <div className="mood-text">{mood.toUpperCase()}</div>
        </div>
        
        <div className="chatbox">
          <div className="chatbox-header">
            <img src="/aicognitech-logo.jpg" alt="AIcognitech" className="logo-small" />
            AIcognitech
          </div>
          
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type or speak your message..."
            />
            <button onClick={handleSend}>Send</button>
            <button 
              onClick={isListening ? stopListening : startListening}
              className={`mic-button ${isListening ? 'listening' : ''}`}
            >
              🎤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedChatbox;
