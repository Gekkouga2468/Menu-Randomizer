import { useState, useEffect } from "react";
import "./App.css";
import plusIcon from "./assets/plusicon.png";

export default function App() {
  const MAX = 10;
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [rotation, setRotation] = useState(0);

  const quantity = cards.length + 1;

  const newCard = () => {
    if (cards.length >= MAX) {
      alert("Maximum number of category reached");
      return;
    }

    setCards((prevCards) => [
      ...prevCards,
      { id: prevCards.length, title: "New Category" },
    ]);
  };

  useEffect(() => {
    if (selectedCard !== null) return;

    const interval = setInterval(() => {
      setRotation((prev) => prev + 0.3);
    }, 16);

    return () => clearInterval(interval);
  }, [selectedCard]);

  const handleSelectCard = (position, id) => {
    const angle = (position - 1) * (360 / quantity);
    setRotation(-angle);
    setSelectedCard(id);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  return (
    <div className="banner">
      <div
        className={`slider ${selectedCard !== null ? "paused" : ""}`}
        style={{ "--quantity": quantity, "--rotation": `${rotation}deg` }}
      >
        <div
          className="card defaultCard"
          onClick={newCard}
          style={{ "--position": 1 }}
        >
          <img src={plusIcon} alt="Add card" />
        </div>
        {cards.map((card, index) => {
          return (
            <div
              key={card.id}
              className={`card ${selectedCard === card.id ? "active" : ""}`}
              style={{ "--position": index + 2 }}
              onClick={() => handleSelectCard(index + 2, card.id)}
            >
              <h1>
                {card.title} {card.id + 1}
              </h1>

              {selectedCard === card.id && (
                <span
                  className="closeButton"
                  onClick={(e) => {
                    e.stopPropagation(); // IMPORTANT
                    closeCard();
                  }}
                >
                  ✕
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
