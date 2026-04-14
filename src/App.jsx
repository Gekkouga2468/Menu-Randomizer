import { useState, useEffect, useRef } from "react";
import "./App.css";
import plusIcon from "./assets/plusicon.png";

export default function App() {
  const MAX = 10;
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [rotation, setRotation] = useState(0);

  const quantity = cards.length + 1;

  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

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

    let animationFrameId;

    const animate = () => {
      setRotation((prev) => {
        const next = prev + velocity.current + 0.15;
        velocity.current *= 0.95;

        if (Math.abs(velocity.current) < 0.001) {
          velocity.current = 0;
        }

        return next;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedCard]);

  const handleSelectCard = (position, id) => {
    const angle = (position - 1) * (360 / quantity);
    setRotation(-angle);
    setSelectedCard(id);
    velocity.current = 0;
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  const handlePointerDown = (e) => {
    if (selectedCard !== null) return;

    isDragging.current = true;
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || selectedCard !== null) return;

    const currentX = e.clientX;
    const currentTime = performance.now();
    const deltaX = currentX - lastX.current;
    const deltaTime = currentTime - lastTime.current || 1;

    const dragRotation = deltaX * 0.35;
    setRotation((prev) => prev + dragRotation);

    velocity.current = (deltaX / deltaTime) * 2.2;

    lastX.current = currentX;
    lastTime.current = currentTime;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="banner">
      {selectedCard !== null && <div className="overlay" onClick={closeCard} />}
      <div
        className={`slider ${selectedCard !== null ? "paused" : ""}`}
        style={{ "--quantity": quantity, "--rotation": `${rotation}deg` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className={`card defaultCard  ${
            selectedCard !== null ? "collapsed" : ""
          }`}
          onClick={selectedCard === null ? newCard : undefined}
          style={{ "--position": 1 }}
        >
          <img src={plusIcon} alt="Add card" />
        </div>
        {cards.map((card, index) => {
          const isActive = selectedCard === card.id;

          return (
            <div
              key={card.id}
              className={`card ${isActive ? "active" : ""} ${
                selectedCard !== null && !isActive ? "collapsed" : ""
              }`}
              style={{ "--position": index + 2 }}
              onClick={() => {
                if (selectedCard === null) {
                  handleSelectCard(index + 2, card.id);
                }
              }}
            >
              <h1>
                {card.title} {card.id + 1}
              </h1>
            </div>
          );
        })}
      </div>
    </div>
  );
}
