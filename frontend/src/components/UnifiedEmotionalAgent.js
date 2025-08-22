import React, { useState, useEffect, useRef, useCallback } from "react";
import "./UnifiedEmotionalAgent.css";

// Dual-layer emotion mapping for orb and background
export const emotionThemes = {
  excited: { orb: "#ff9800", background: "#fff3e0" },
  happy: { orb: "#4caf50", background: "#e8f5e8" },
  sad: { orb: "#2196f3", background: "#e3f2fd" },
  angry: { orb: "#f44336", background: "#ffebee" },
  calm: { orb: "#9c27b0", background: "#f3e5f5" },
  anxious: { orb: "#ff9800", background: "#fff8e1" },
  neutral: { orb: "#9e9e9e", background: "#f5f5f5" },
  warm_welcome: { orb: "#0D98BA", background: "#87CEFA" },
  concern: { orb: "#b0c4de", background: "#d3d3d3" },
  empathy_grounding: { orb: "#E6E6FA", background: "#F5F5DC" },
  fatigue_hope: { orb: "#4B0082", background: "#191970" },
  empathetic_guidance: { orb: "#FFBF00", background: "#FFB347" },
  fatigue_curiosity: { orb: "#9400D3", background: "#4B0082" },
  empathetic_precision: { orb: "#008000", background: "#90EE90" },
  overwhelm: { orb: "#FF6F61", background: "#333333" },
  soothing_clarity: { orb: "#F0F0F0", background: "#FAFAD2" },
  inquisitive: { orb: "#008080", background: "#AFEEEE" },
  practical_reassurance: { orb: "#FFD700", background: "#FFFACD" }
};

// Pre-scripted demo conversation with orb/background mapping
const demoConversation = [
  {
    text: "Hello, thank you for contacting our Longevity Clinic. I sense your interest in exploring more about this lifestyle and the therapies available. What concerns or goals are most present for you today?",
    sender: "bot",
    mood: "warm_welcome"
  },
  {
    text: "Yes, um, I came across your site and I would like to understand a little bit more about the biomarker tests. I’m concerned about how things are going for me.",
    sender: "user",
    mood: "concern"
  },
  {
    text: "I’m glad you reached out. It’s natural to feel concern. I hear this weighs on you. Our biomarker testing looks at many areas—metabolic health, inflammation, heart risk and more. What feels most pressing to you now: fatigue, or perhaps something else?",
    sender: "bot",
    mood: "empathy_grounding"
  },
  {
    text: "Yes, I have. The reason I’m speaking to you is because I’m just so tired all the time. There has to be a way this can be changed, maybe by doing some of your tests.",
    sender: "user",
    mood: "fatigue_hope"
  },
  {
    text: "I can sense how exhausting this has been—it really takes a toll. Our biomarker panel could help reveal the roots, such as thyroid balance, vitamin levels, or inflammation. Would you like me to explain how we’d begin with a blood panel and then shape a plan to renew your energy?",
    sender: "bot",
    mood: "empathetic_guidance"
  },
  {
    text: "Oh, I like the sound of what you just said, but I also want to focus on the fatigue from not sleeping well either.",
    sender: "user",
    mood: "fatigue_curiosity"
  },
  {
    text: "That must be incredibly draining—not sleeping well and feeling tired. Our biomarker testing can also look at cortisol and nutrients linked to sleep. We could begin with a comprehensive panel to uncover what may be holding your sleep back.",
    sender: "bot",
    mood: "empathetic_precision"
  },
  {
    text: "Mmm, I’m feeling so overwhelmed now with all this information. I don’t know where to start.",
    sender: "user",
    mood: "overwhelm"
  },
  {
    text: "I hear how overwhelmed you’re feeling, and it’s okay not to know where to start—that’s why we’re here. Let’s take it step by step. Since fatigue and poor sleep weigh on you most, we could begin with a simple blood test for cortisol and vitamin D. A clear, gentle first step. Does that sound manageable?",
    sender: "bot",
    mood: "soothing_clarity"
  },
  {
    text: "Yes, that sounds very feasible, but I also want to be more conscious about cost and timeline. Can you tell me more?",
    sender: "user",
    mood: "inquisitive"
  },
  {
    text: "I understand completely—it’s wise to ask. A blood test covering cortisol and vitamin D usually ranges from forty to a hundred pounds, depending on the lab and options. Results often come within a week. From there, we’ll guide you in the next step of your journey.",
    sender: "bot",
    mood: "practical_reassurance"
  }
].map(msg => ({
  ...msg,
  orb: emotionThemes[msg.mood].orb,
  background: emotionThemes[msg.mood].background,
  timestamp: new Date(),
  voiceEmotion: "none",
}));

function UnifiedEmotionalAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentMood, setCurrentMood] = useState("neutral");
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");
  const [orbColor, setOrbColor] = useState("#9e9e9e");
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

  // Initialize unified system with demo conversation
  useEffect(() => {
    setMessages(demoConversation);

    const initialMood = demoConversation[0]?.mood || "neutral";
    const initialArcPoint = {
      timestamp: new Date(),
      mood: initialMood,
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
    const theme = emotionThemes[state.mood] || emotionThemes.neutral;
    setBackgroundColor(theme.background);
    setOrbColor(theme.orb);
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

  // Rest of component (send message, stop listening, etc.) unchanged...
}

export default UnifiedEmotionalAgent;
