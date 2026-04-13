import { useState } from "react";
import "./App.css";
import plusIcon from "./assets/plusicon.png";

export default function App() {
  const [cards, setCards] = useState([]);

  const newCard = () => {
    setCards((prevCards) => [...prevCards, prevCards.length + 1]);
  };

  return (
    <div className="banner">
      <div className="slider" style={{ "--quantity": cards.length + 1 }}>
        <div className="card" onClick={newCard} style={{ "--position": 1 }}>
          <img src={plusIcon} alt="Add card" />
        </div>
        {cards.map((_, index) => (
          <div
            key={index}
            className="card"
            style={{ "--position": index + 2 }}
          ></div>
        ))}
      </div>
    </div>
  );
}
