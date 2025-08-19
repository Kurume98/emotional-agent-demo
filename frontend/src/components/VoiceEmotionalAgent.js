import React, { useState, useEffect, useRef } from "react";
import "./VoiceEmotionalAgent.css";

function VoiceEmotionalAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [combinedEmotion, setCombinedEmotion] = useState("neutral");
  const [audioData, setAudioData] = useState(null);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      text: "Welcome to Voice Emotional Intelligence. I'll analyze both your words and voice tone to understand your emotions.",
      sender: "bot",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
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
        
        // Analyze voice tone from audio data
        if (audioData) {
          analyzeVoiceTone(audioData);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, [audioData]);

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
      
      // Set up audio context for analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      setIsListening(true);
      
      // Start real-time audio analysis
      analyzeAudioStream();
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to use voice analysis.");
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

  const analyzeAudioStream = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const analyze = () => {
      if (!isListening) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate audio features
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const variance = dataArray.reduce((a, b) => a + Math.pow(b - average, 2), 0) / bufferLength;
      const energy = Math.sqrt(variance);
      
      // Detect voice emotion based on audio characteristics
      const detectedEmotion = detectVoiceEmotion(average, energy, dataArray);
      setVoiceEmotion(detectedEmotion);
      
      // Update combined emotion
      updateCombinedEmotion(detectedEmotion, null);
      
      setAudioData({ average, energy, frequencies: [...dataArray] });
      
      requestAnimationFrame(analyze);
    };
    
    analyze();
  };

  const detectVoiceEmotion = (average, energy, frequencies) => {
    // Simplified voice emotion detection based on audio characteristics
    const highFreqEnergy = frequencies.slice(frequencies.length * 0.7).reduce((a, b) => a + b, 0);
    const lowFreqEnergy = frequencies.slice(0, frequencies.length * 0.3).reduce((a, b) => a + b, 0);
    
    // Voice emotion detection logic
    if (energy > 50 && highFreqEnergy > lowFreqEnergy * 2) {
      return "excited"; // High energy, high pitch
    } else if (energy > 40 && lowFreqEnergy > highFreqEnergy * 2) {
      return "angry"; // High energy, low pitch
    } else if (energy < 20 && lowFreqEnergy < 10) {
      return "sad"; // Low energy, low pitch
    } else if (energy > 25 && energy < 35) {
      return "calm"; // Moderate energy
    } else {
      return "neutral";
    }
  };

  const analyzeVoiceTone = (audioData) => {
    // Additional analysis when we have the final audio
    if (audioData) {
      const { average, energy } = audioData;
      const emotion = detectVoiceEmotion(average, energy, audioData.frequencies || []);
      setVoiceEmotion(emotion);
      return emotion;
    }
    return "neutral";
  };

  const updateCombinedEmotion = (voiceEmotion, textEmotion) => {
    let combined = "neutral";
    
    // Priority: voice emotion > text emotion > neutral
    if (voiceEmotion && voiceEmotion !== "neutral") {
      combined = voiceEmotion;
    } else if (textEmotion) {
      combined = textEmotion;
    }
    
    setCombinedEmotion(combined);
    updateMoodDisplay(combined);
  };

  const updateMoodDisplay = (emotion) => {
    let newMood = "neutral";
    let newColor = "#f5f5f5";

    switch (emotion) {
      case "excited":
      case "happy":
        newMood = "excited";
        newColor = "#fff3e0";
        break;
      case "angry":
        newMood = "angry";
        newColor = "#ffebee";
        break;
      case "sad":
        newMood = "sad";
        newColor = "#e3f2fd";
        break;
      case "calm":
        newMood = "calm";
        newColor = "#e8f5e8";
        break;
      default:
        newMood = "neutral";
        newColor = "#f5f5f5";
    }

    setMood(newMood);
    setBackgroundColor(newColor);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      text: input, 
      sender: "user", 
      timestamp: new Date(),
      voiceEmotion: voiceEmotion || "none"
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          voiceEmotion: voiceEmotion,
          audioData: audioData
        }),
      });

      const data = await response.json();
      
      // Analyze text emotion from response
      const textEmotion = analyzeTextEmotion(data.reply);
      
      // Update combined emotion
      updateCombinedEmotion(voiceEmotion, textEmotion);
      
      const botMessage = { 
        text: data.reply, 
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
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
    setVoiceEmotion(null);
  };

  const analyzeTextEmotion = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("sad") || lowerText.includes("sorry") || lowerText.includes("upset")) {
      return "sad";
    } else if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("great")) {
      return "happy";
    } else if (lowerText.includes("angry") || lowerText.includes("frustrated")) {
      return "angry";
    } else if (lowerText.includes("calm") || lowerText.includes("peaceful")) {
      return "calm";
    }
    return "neutral";
  };

  const getMoodEmoji = () => {
    switch (mood) {
      case "excited": return "🤗";
      case "happy": return "😊";
      case "sad": return "😢";
      case "angry": return "😠";
      case "calm": return "😌";
      default: return "😐";
    }
  };

  const getMoodColor = () => {
    switch (mood) {
      case "excited": return "#ff9800";
      case "happy": return "#4caf50";
      case "sad": return "#2196f3";
      case "angry": return "#f44336";
      case "calm": return "#9c27b0";
      default: return "#9e9e9e";
    }
  };

  return (
    <div className="voice-agent-container" style={{ backgroundColor }}>
      <header className="voice-header">
        <h1>🎤 Voice Emotional Intelligence</h1>
        <div className="mood-indicator">
          <div className="mood-orb" style={{ backgroundColor: getMoodColor() }}>
            <div className="mood-emoji">{getMoodEmoji()}</div>
            <div className="mood-label">{mood.toUpperCase()}</div>
          </div>
          {voiceEmotion && (
            <div className="voice-emotion">
              Voice: {voiceEmotion}
            </div>
          )}
        </div>
      </header>

      <main className="voice-main">
        <div className="chat-section">
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
                {msg.voiceEmotion && msg.voiceEmotion !== "none" && (
                  <div className="voice-tag">🎤 {msg.voiceEmotion}</div>
                )}
                <div className="message-timestamp">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="voice-controls">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message or use voice..."
              className="message-input"
            />
            
            <div className="control-buttons">
              <button onClick={handleSend} className="send-button">
                Send
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
            <div className="voice-status">
              <div className="listening-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Listening and analyzing your voice...</p>
            </div>
          )}
        </div>

        <div className="voice-info">
          <h3>Voice Analysis</h3>
          <div className="analysis-display">
            <p><strong>Current Mood:</strong> {mood}</p>
            {voiceEmotion && <p><strong>Voice Emotion:</strong> {voiceEmotion}</p>}
            <p><strong>Combined Analysis:</strong> {combinedEmotion}</p>
          </div>
          
          <div className="instructions">
            <h4>How it works:</h4>
            <ul>
              <li>Click the voice button to start recording</li>
              <li>Speak naturally - we'll analyze your tone</li>
              <li>Background color changes based on detected emotion</li>
              <li>Combines voice tone + text analysis for accuracy</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VoiceEmotionalAgent;
