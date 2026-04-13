import { useState } from "react";
import "./App.css";
import plusIcon from "./assets/plusicon.png";

export default function App() {
  const [cards, setCards] = useState([]);
  const quantity = cards.length + 1;

  const newCard = () => {
    setCards((prevCards) => [...prevCards, prevCards.length + 1]);
  };

  return (
    <div className="banner">
      <div className="slider" style={{ "--quantity": quantity }}>
        <div className="card" onClick={newCard} style={{ "--position": 1 }}>
          <img src={plusIcon} alt="Add card" />
        </div>
        {cards.map((card, index) => (
          <div key={index} className="card" style={{ "--position": index + 2 }}>
            Card {card}
          </div>
        ))}
      </div>
    </div>
  );
}
