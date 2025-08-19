import React, { useState, useEffect, useRef } from "react";
import "./EmotionalMemoryAgent.css";

function EmotionalMemoryAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentMood, setCurrentMood] = useState("neutral");
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [emotionalArc, setEmotionalArc] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [emotionalJourney, setEmotionalJourney] = useState([]);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      text: "Welcome to Emotional Memory Agent. I'll track every emotional shift and create a beautiful memory of your emotional journey.",
      sender: "bot",
      timestamp: new Date(),
      mood: "neutral",
      voiceEmotion: "neutral"
    }]);
    
    // Initialize emotional arc with starting point
    setEmotionalArc([{
      timestamp: new Date(),
      mood: "neutral",
      intensity: 0.5,
      trigger: "conversation_start"
    }]);
  }, []);

  const updateEmotionalState = (newMood, voiceEmotion = null, trigger = "text") => {
    const previousMood = currentMood;
    
    // Calculate emotional intensity based on change
    const intensity = calculateEmotionalIntensity(previousMood, newMood, voiceEmotion);
    
    // Create emotional shift record
    const emotionalShift = {
      timestamp: new Date(),
      previousMood,
      newMood,
      voiceEmotion,
      intensity,
      trigger,
      id: Date.now()
    };
    
    // Update emotional arc
    setEmotionalArc(prev => [...prev, {
      timestamp: new Date(),
      mood: newMood,
      intensity,
      trigger
    }]);
    
    // Update mood history
    setMoodHistory(prev => [...prev, emotionalShift]);
    
    // Update emotional journey for visualization
    setEmotionalJourney(prev => [...prev, {
      x: prev.length + 1,
      y: getMoodValue(newMood),
      mood: newMood,
      timestamp: new Date()
    }]);
    
    // Update current state
    setCurrentMood(newMood);
    updateBackgroundColor(newMood, intensity);
  };

  const calculateEmotionalIntensity = (prevMood, newMood, voiceEmotion) => {
    let intensity = 0.5;
    
    // Increase intensity if voice emotion matches text emotion
    if (voiceEmotion && voiceEmotion.toLowerCase().includes(newMood.toLowerCase())) {
      intensity = 0.8;
    }
    
    // Increase intensity for dramatic mood changes
    if (prevMood !== newMood) {
      intensity = Math.min(intensity + 0.3, 1.0);
    }
    
    return intensity;
  };

  const updateBackgroundColor = (mood, intensity) => {
    const baseColors = {
      neutral: "#f5f5f5",
      happy: "#fff3e0",
      excited: "#ffe0b2",
      sad: "#e3f2fd",
      angry: "#ffebee",
      calm: "#e8f5e8",
      anxious: "#fff8e1"
    };
    
    const color = baseColors[mood] || baseColors.neutral;
    
    // Adjust color intensity based on emotional intensity
    const adjustedColor = adjustColorIntensity(color, intensity);
    setBackgroundColor(adjustedColor);
  };

  const adjustColorIntensity = (color, intensity) => {
    // Simple color intensity adjustment
    const factor = 0.5 + (intensity * 0.5);
    return color;
  };

  const getMoodValue = (mood) => {
    const moodValues = {
      excited: 2,
      happy: 1.5,
      calm: 0.5,
      neutral: 0,
      anxious: -0.5,
      sad: -1,
      angry: -1.5
    };
    return moodValues[mood] || 0;
  };

  const getMoodColor = (mood, intensity = 1) => {
    const colors = {
      excited: `hsl(45, 100%, ${50 + intensity * 20}%)`,
      happy: `hsl(120, 70%, ${50 + intensity * 20}%)`,
      calm: `hsl(270, 50%, ${50 + intensity * 20}%)`,
      neutral: `hsl(0, 0%, ${85 + intensity * 10}%)`,
      anxious: `hsl(60, 80%, ${50 + intensity * 20}%)`,
      sad: `hsl(210, 70%, ${50 + intensity * 20}%)`,
      angry: `hsl(0, 70%, ${50 + intensity * 20}%)`
    };
    return colors[mood] || colors.neutral;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      excited: "🤗",
      happy: "😊",
      calm: "😌",
      neutral: "😐",
      anxious: "😰",
      sad: "😢",
      angry: "😠"
    };
    return emojis[mood] || "😐";
  };

  // Voice analysis functions
  const startVoiceAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsListening(true);
      analyzeAudioStream();
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const analyzeAudioStream = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const analyze = () => {
      if (!isListening) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const energy = Math.sqrt(dataArray.reduce((a, b) => a + Math.pow(b - average, 2), 0) / bufferLength);
      
      const voiceEmotion = detectVoiceEmotion(average, energy, dataArray);
      setVoiceEmotion(voiceEmotion);
      
      requestAnimationFrame(analyze);
    };
    
    analyze();
  };

  const detectVoiceEmotion = (average, energy, frequencies) => {
    const highFreqEnergy = frequencies.slice(frequencies.length * 0.7).reduce((a, b) => a + b, 0);
    const lowFreqEnergy = frequencies.slice(0, frequencies.length * 0.3).reduce((a, b) => a + b, 0);
    
    if (energy > 50 && highFreqEnergy > lowFreqEnergy * 2) {
      return "excited";
    } else if (energy > 40 && lowFreqEnergy > highFreqEnergy * 2) {
      return "angry";
    } else if (energy < 20) {
      return "sad";
    } else if (energy > 25 && energy < 35) {
      return "calm";
    } else {
      return "neutral";
    }
  };

  const stopVoiceAnalysis = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const textEmotion = analyzeTextEmotion(input);
    const finalEmotion = voiceEmotion || textEmotion;
    
    const userMessage = { 
      text: input, 
      sender: "user", 
      timestamp: new Date(),
      mood: finalEmotion,
      voiceEmotion: voiceEmotion || "none"
    };
    
    setMessages(prev => [...prev, userMessage]);
    updateEmotionalState(finalEmotion, voiceEmotion, "user_message");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/emotional-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          voiceEmotion: voiceEmotion,
          currentMood: currentMood
        }),
      });

      const data = await response.json();
      
      const botEmotion = analyzeTextEmotion(data.reply);
      updateEmotionalState(botEmotion, null, "bot_response");
      
      const botMessage = { 
        text: data.reply, 
        sender: "bot",
        timestamp: new Date(),
        mood: botEmotion
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { 
        text: "I'm having trouble connecting. Please try again.", 
        sender: "bot",
        timestamp: new Date(),
        mood: "neutral"
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInput("");
    setVoiceEmotion(null);
  };

  const analyzeTextEmotion = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("excited") || lowerText.includes("amazing") || lowerText.includes("wonderful")) {
      return "excited";
    } else if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("great")) {
      return "happy";
    } else if (lowerText.includes("sad") || lowerText.includes("sorry") || lowerText.includes("upset") || lowerText.includes("depressed")) {
      return "sad";
    } else if (lowerText.includes("angry") || lowerText.includes("frustrated") || lowerText.includes("mad")) {
      return "angry";
    } else if (lowerText.includes("calm") || lowerText.includes("peaceful") || lowerText.includes("relaxed")) {
      return "calm";
    } else if (lowerText.includes("anxious") || lowerText.includes("worried") || lowerText.includes("nervous")) {
      return "anxious";
    }
    return "neutral";
  };

  const renderEmotionalArc = () => {
    return (
      <div className="emotional-arc-container">
        <h3>🌈 Emotional Journey</h3>
        <div className="arc-visualization">
          {emotionalArc.map((point, idx) => (
            <div 
              key={idx} 
              className="arc-point"
              style={{
                backgroundColor: getMoodColor(point.mood, point.intensity),
                opacity: 0.7 + (point.intensity * 0.3)
              }}
            >
              <div className="arc-mood">{getMoodEmoji(point.mood)}</div>
              <div className="arc-time">{point.timestamp.toLocaleTimeString()}</div>
              <div className="arc-intensity">Intensity: {(point.intensity * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        
        <div className="emotional-summary">
          <h4>Emotional Summary</h4>
          <div className="mood-distribution">
            {Object.entries(
              emotionalArc.reduce((acc, point) => {
                acc[point.mood] = (acc[point.mood] || 0) + 1;
                return acc;
              }, {})
            ).map(([mood, count]) => (
              <div key={mood} className="mood-count">
                <span style={{ color: getMoodColor(mood) }}>
                  {getMoodEmoji(mood)} {mood}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="emotional-memory-container" style={{ backgroundColor }}>
      <header className="emotional-header">
        <h1>🧠 Emotional Memory Agent</h1>
        <div className="current-state">
          <div 
            className="mood-orb" 
            style={{ 
              backgroundColor: getMoodColor(currentMood),
              boxShadow: `0 0 30px ${getMoodColor(currentMood)}40`
            }}
          >
            <div className="mood-emoji">{getMoodEmoji(currentMood)}</div>
            <div className="mood-label">{currentMood.toUpperCase()}</div>
          </div>
        </div>
      </header>

      <main className="emotional-main">
        <div className="chat-section">
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
                <div className="message-meta">
                  <span className="message-mood" style={{ color: getMoodColor(msg.mood) }}>
                    {getMoodEmoji(msg.mood)} {msg.mood}
                  </span>
                  {msg.voiceEmotion && msg.voiceEmotion !== "none" && (
                    <span className="voice-indicator">🎤 {msg.voiceEmotion}</span>
                  )}
                  <span className="message-timestamp">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="input-section">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Share your feelings..."
              className="emotional-input"
            />
            
            <div className="control-buttons">
              <button onClick={handleSend} className="send-button">
                💬 Send
              </button>
              
              <button 
                onClick={isListening ? stopVoiceAnalysis : startVoiceAnalysis}
                className={`voice-button ${isListening ? 'listening' : ''}`}
              >
                {isListening ? '⏹️ Stop' : '🎤 Voice'}
              </button>
            </div>
          </div>

          {isListening && (
            <div className="voice-feedback">
              <div className="listening-waves">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Analyzing your voice tone...</p>
            </div>
          )}
        </div>

        <div className="memory-section">
          {renderEmotionalArc()}
        </div>
      </main>
    </div>
  );
}

export default EmotionalMemoryAgent;
