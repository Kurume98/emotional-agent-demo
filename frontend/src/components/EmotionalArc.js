import React, { useEffect, useState } from "react";
import axios from "axios";

function EmotionalArc() {
  const [arc, setArc] = useState([]);

  useEffect(() => {
    const fetchArc = async () => {
      try {
        const res = await axios.post("/api/chat", { message: "" });
        setArc(res.data.arc || []);
      } catch (error) {
        console.error("Error fetching arc:", error);
      }
    };
    fetchArc();
  }, []);

  return (
    <div>
      <h3>Emotional Arc</h3>
      <ul>
        {arc.map((entry, index) => (
          <li key={index}>
            <strong>You:</strong> {entry.user} <br />
            <strong>Agent:</strong> {entry.agent} <br />
            <em>Mood:</em> {entry.mood}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmotionalArc;