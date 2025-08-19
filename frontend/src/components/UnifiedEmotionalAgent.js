import React, { useState, useEffect, useRef, useCallback } from "react";
import "./UnifiedEmotionalAgent.css";

function UnifiedEmotionalAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentMood, setCurrentMood] = useState("neutral");
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [emotionalArc, setEmotionalArc] = useState([]);
  const [unifiedEmotionalState, setUnifiedEmotionalState] = useState({
    mood: "neutral",
    intensity: 0.5,
    voiceData: null,
    memoryData: null
  });
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Initialize unified system
  useEffect(() => {
    const welcomeMessage = {
      text: "Welcome to the Unified Emotional Intelligence System. Your voice and memories are now connected to create a living emotional arc.",
      sender: "bot",
      timestamp: new Date(),
      mood: "excited",
      voiceEmotion: "neutral"
    };
    
    setMessages([welcomeMessage]);
    
    // Initialize emotional arc with starting point
    const initialArcPoint = {
      timestamp: new Date(),
      mood: "excited",
      intensity: 0.8,
      trigger: "system_unified",
      voiceData: null,
      memoryData: { type: "system_init" }
    };
    
    setEmotionalArc([initialArcPoint]);
    updateUnifiedState(initialArcPoint);
  }, []);

  // Unified state updater
  const updateUnifiedState = useCallback((newState) => {
    setUnifiedEmotionalState(prev => ({
      ...prev,
      ...newState,
      timestamp: new Date()
    }));
    
    // Update visual representation
    updateVisualDisplay(newState);
  }, []);

  // Visual display updater
  const updateVisualDisplay = (state) => {
    const moodColors = {
      excited: { bg: "#fff3e0", orb: "#ff9800" },
      happy: { bg: "#e8f5e8", orb: "#4caf50" },
      sad: { bg: "#e3f2fd", orb: "#2196f3" },
      angry: { bg: "#ffebee", orb: "#f44336" },
      calm: { bg: "#f3e5f5", orb: "#9c27b0" },
      anxious: { bg: "#fff8e1", orb: "#ff9800" },
      neutral: { bg: "#f5f5f5", orb: "#9e9e9e" }
    };

    const colors = moodColors[state.mood] || moodColors.neutral;
    setBackgroundColor(colors.bg);
    setCurrentMood(state.mood);
  };

  // Voice analysis integration
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
      
      // Initialize speech recognition
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setInput(transcript);
        };

        recognitionRef.current.start();
      }
      
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
      
      // Create voice data for memory
      const voiceData = {
        average,
        energy,
        emotion: voiceEmotion,
        frequencies: [...dataArray]
      };
      
      updateUnifiedState({
        voiceData,
        mood: voiceEmotion || currentMood,
        intensity: Math.min(energy / 100, 1)
      });
      
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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsListening(false);
    setVoiceEmotion(null);
  };

  // Memory integration
  const addToEmotionalArc = (data) => {
    const arcPoint = {
      timestamp: new Date(),
      mood: data.mood || currentMood,
      intensity: data.intensity || 0.5,
      trigger: data.trigger || "user_input",
      voiceData: data.voiceData || null,
      memoryData: {
        type: data.type || "message",
        content: data.content || input,
        previousMood: emotionalArc[emotionalArc.length - 1]?.mood || "neutral"
      }
    };
    
    setEmotionalArc(prev => [...prev, arcPoint]);
    updateUnifiedState(arcPoint);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Analyze text emotion
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
    
    // Add to emotional arc
    addToEmotionalArc({
      mood: finalEmotion,
      intensity: voiceEmotion ? 0.8 : 0.5,
      trigger: "user_message",
      voiceData: unifiedEmotionalState.voiceData,
      content: input,
      type: "user_input"
    });

    try {
      const response = await fetch("http://127.0.0.1:5000/api/unified-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          voiceEmotion: voiceEmotion,
          currentMood: currentMood,
          emotionalArc: emotionalArc
        }),
      });

      const data = await response.json();
      
      const botEmotion = analyzeTextEmotion(data.reply);
      
      // Add bot response to emotional arc
      addToEmotionalArc({
        mood: botEmotion,
        intensity: 0.6,
        trigger: "bot_response",
        content: data.reply,
        type: "bot_response"
      });
      
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
    } else if (lowerText.includes("sad") || lowerText.includes("sorry") || lowerText.includes("upset")) {
      return "sad";
    } else if (lowerText.includes("angry") || lowerText.includes("frustrated")) {
      return "angry";
    } else if (lowerText.includes("calm") || lowerText.includes("peaceful")) {
      return "calm";
    } else if (lowerText.includes("anxious") || lowerText.includes("worried")) {
      return "anxious";
    }
    return "neutral";
  };

  // Render emotional arc visualization
  const renderEmotionalArc = () => {
    if (emotionalArc.length === 0) return null;

    return (
      <div className="unified-arc-container">
        <h3>🌊 Living Emotional Arc</h3>
        <div className="arc-timeline">
          {emotionalArc.map((point, idx) => {
            const isActive = idx === emotionalArc.length - 1;
            return (
              <div 
                key={idx} 
                className={`arc-node ${isActive ? 'active' : ''} ${point.mood}`}
                style={{
                  backgroundColor: `hsl(${getHueForMood(point.mood)}, 70%, ${50 + (point.intensity * 30)}%)`,
                  transform: `scale(${1 + (point.intensity * 0.2)})`,
                  boxShadow: `0 0 ${20 + (point.intensity * 30)}px hsl(${getHueForMood(point.mood)}, 70%, 50%)`
                }}
              >
                <div className="node-emoji">{getMoodEmoji(point.mood)}</div>
                <div className="node-time">{point.timestamp.toLocaleTimeString()}</div>
                <div className="node-trigger">{point.trigger}</div>
                
                {point.voiceData && (
                  <div className="voice-indicator">
                    🎤 Voice: {point.voiceData.emotion}
                  </div>
                )}
                
                {point.memoryData && (
                  <div className="memory-indicator">
                    🧠 {point.memoryData.type}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="arc-flow">
          <svg className="arc-svg" viewBox="0 0 400 100">
            <path
              d={`M 0 50 Q ${emotionalArc.length * 50} 20 ${emotionalArc.length * 50} 50`}
              stroke="url(#gradient)"
              strokeWidth="3"
              fill="none"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {emotionalArc.map((point, idx) => (
                  <stop 
                    key={idx} 
                    offset={`${(idx / emotionalArc.length) * 100}%`}
                    stopColor={`hsl(${getHueForMood(point.mood)}, 70%, 50%)`}
                  />
                ))}
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  };

  const getHueForMood = (mood) => {
    const hues = {
      excited: 45,
      happy: 120,
      sad: 210,
      angry: 0,
      calm: 270,
      anxious: 60,
      neutral: 0
    };
    return hues[mood] || 0;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      excited: "🤗",
      happy: "😊",
      sad: "😢",
      angry: "😠",
      calm: "😌",
      anxious: "😰",
      neutral: "😐"
    };
    return emojis[mood] || "😐";
  };

  return (
    <div className="unified-agent-container" style={{ backgroundColor }}>
      <header className="unified-header">
        <h1>🎭 Unified Emotional Intelligence</h1>
        <div className="state-display">
          <div 
            className="unified-orb"
            style={{
              backgroundColor: `hsl(${getHueForMood(currentMood)}, 70%, 50%)`,
              boxShadow: `0 0 30px hsl(${getHueForMood(currentMood)}, 70%, 50%)40`
            }}
          >
            <div className="orb-emoji">{getMoodEmoji(currentMood)}</div>
            <div className="orb-mood">{currentMood.toUpperCase()}</div>
          </div>
          
          <div className="state-info">
            <div>Voice: {voiceEmotion || "none"}</div>
            <div>Memory: {emotionalArc.length} states</div>
            <div>Intensity: {(unifiedEmotionalState.intensity * 100).toFixed(0)}%</div>
          </div>
        </div>
      </header>

      <main className="unified-main">
        <div className="interaction-panel">
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`unified-message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
                <div className="message-meta">
                  <span className="mood-badge" style={{ backgroundColor: `hsl(${getHueForMood(msg.mood)}, 70%, 80%)` }}>
                    {getMoodEmoji(msg.mood)} {msg.mood}
                  </span>
                  {msg.voiceEmotion && msg.voiceEmotion !== "none" && (
                    <span className="voice-badge">🎤 {msg.voiceEmotion}</span>
                  )}
                  <span className="timestamp">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="unified-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Speak or type your feelings..."
              className="unified-text-input"
            />
            
            <div className="unified-controls">
              <button onClick={handleSend} className="unified-send">
                💬 Send
              </button>
              
              <button 
                onClick={isListening ? stopVoiceAnalysis : startVoiceAnalysis}
                className={`unified-voice ${isListening ? 'active' : ''}`}
              >
                {isListening ? '⏹️ Stop Voice' : '🎤 Start Voice'}
              </button>
            </div>
          </div>

          {isListening && (
            <div className="voice-feedback">
              <div className="listening-animation">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Voice analysis active - detecting emotional tone...</p>
            </div>
          )}
        </div>

        <div className="visualization-panel">
          {renderEmotionalArc()}
          
          <div className="memory-summary">
            <h4>🧠 Emotional Memory</h4>
            <div className="memory-stats">
              <div>Total States: {emotionalArc.length}</div>
              <div>Current Intensity: {(unifiedEmotionalState.intensity * 100).toFixed(0)}%</div>
              <div>Voice Integration: {voiceEmotion ? "Active" : "Inactive"}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UnifiedEmotionalAgent;
