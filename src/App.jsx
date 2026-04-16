import { useState, useEffect, useRef } from "react";
import "./App.css";
import plusIcon from "./assets/plusicon.png";
import plusIcon1 from "./assets/plusicon1.png";

export default function App() {
  /* =========================
     Constants
     ========================= */
  const MAX = 10;
  const STORAGE_KEY = "carousel-cards";

  /* =========================
     State
     ========================= */

  // Load saved cards from localStorage on first render
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to load cards from localStorage:", error);
      return [];
    }
  });

  // Currently opened card
  const [selectedCard, setSelectedCard] = useState(null);

  // Current carousel rotation
  const [rotation, setRotation] = useState(0);

  // Modal state for adding a dish
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  /* =========================
     Derived values
     ========================= */

  // +1 because the default add-card tile is part of the carousel
  const quantity = cards.length + 1;

  /* =========================
     Refs for drag / momentum
     ========================= */
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  /* =========================
     Effects
     ========================= */

  // Save cards to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error("Failed to save cards to localStorage:", error);
    }
  }, [cards]);

  // Auto-rotate the carousel when no card is selected
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

  /* =========================
     Card actions
     ========================= */

  // Create a new category card
  const newCard = () => {
    if (cards.length >= MAX) {
      alert("Maximum number of category reached");
      return;
    }

    setCards((prevCards) => [
      ...prevCards,
      {
        id: Date.now(),
        title: "New Category",
        dishes: [],
      },
    ]);
  };

  // Open a card and rotate it to the front
  const handleSelectCard = (position, id) => {
    const angle = (position - 1) * (360 / quantity);

    setRotation(-angle);
    setSelectedCard(id);
    setShowInput(false);
    setInputValue("");
    velocity.current = 0;
  };

  // Close the active card and reset modal/input state
  const closeCard = () => {
    setSelectedCard(null);
    setShowInput(false);
    setInputValue("");
  };

  /* =========================
     Drag interaction
     ========================= */

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

  /* =========================
     Modal / input actions
     ========================= */

  const handleOpenInput = (e) => {
    e.stopPropagation();
    setShowInput(true);
  };

  // Add a dish to the selected card
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

  /* =========================
     Render
     ========================= */
  return (
    <div className="banner">
      {/* Dark background when a card is open */}
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
        {/* Default tile used to create a new card */}
        <div
          className={`card defaultCard ${
            selectedCard !== null ? "collapsed" : ""
          }`}
          style={{ "--position": 1 }}
          onClick={selectedCard === null ? newCard : undefined}
        >
          <img src={plusIcon} alt="Add card" />
        </div>

        {/* Category cards */}
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
                {card.title} {index + 1}
              </h1>

              {/* Dish list */}
              {card.dishes.length > 0 && (
                <ul
                  key={`${card.id}-${isActive}`}
                  className={`dishList ${
                    isActive ? "activeList" : "previewList"
                  }`}
                  ref={(el) => {
                    if (!el) return;

                    const isOverflowing = el.scrollHeight > el.clientHeight;

                    if (isOverflowing) {
                      el.classList.add("fade");
                    } else {
                      el.classList.remove("fade");
                    }
                  }}
                >
                  {card.dishes.map((dish) => (
                    <li key={dish.id}>{dish.name}</li>
                  ))}
                </ul>
              )}

              {/* Active card controls */}
              {isActive && (
                <>
                  <img
                    className="add"
                    src={plusIcon1}
                    alt="Open input"
                    onClick={handleOpenInput}
                  />

                  {/* Simple modal for adding a dish */}
                  {showInput && (
                    <div
                      className="modalBackdrop"
                      onClick={() => setShowInput(false)}
                    >
                      <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h2>Add dish</h2>

                        <input
                          type="text"
                          placeholder="Enter dish name"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />

                        <div className="modalActions">
                          <button
                            className="cancelBtn"
                            onClick={() => setShowInput(false)}
                          >
                            Cancel
                          </button>

                          <button className="doneBtn" onClick={handleDone}>
                            Done
                          </button>
                        </div>
                      </div>
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
