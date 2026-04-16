import { useState, useEffect, useRef } from "react";
import "./App.css";
import plusIcon from "./assets/plusicon.png";
import plusIcon1 from "./assets/plusicon1.png";

export default function App() {
  const MAX = 10;
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [rotation, setRotation] = useState(0);

  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
      { id: prevCards.length, title: "New Category", dishes: [] },
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
    setShowInput(false);
    setInputValue("");
    velocity.current = 0;
  };

  const closeCard = () => {
    setSelectedCard(null);
    setShowInput(false);
    setInputValue("");
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

  const handleOpenInput = (e) => {
    e.stopPropagation();
    setShowInput(true);
  };

  const handleDone = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || selectedCard === null) return;

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== selectedCard) return card;

        return {
          ...card,
          dishes: [
            ...card.dishes,
            {
              id: Date.now(),
              name: trimmed,
            },
          ],
        };
      }),
    );

    setInputValue("");
    setShowInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleDone();
    }
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
          className={`card defaultCard ${
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

              {card.dishes.length > 0 && (
                <ul
                  key={`${card.id}-${isActive}`}
                  className={`dishList ${isActive ? "activeList" : "previewList"}`}
                >
                  {card.dishes.map((dish) => (
                    <li key={dish.id}>{dish.name}</li>
                  ))}
                </ul>
              )}

              {isActive && (
                <>
                  <img
                    className="add"
                    src={plusIcon1}
                    alt="Open input"
                    onClick={handleOpenInput}
                  />

                  {showInput && (
                    <div
                      className="inputPanel"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        placeholder="Type here..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                      <button onClick={handleDone}>Done</button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
