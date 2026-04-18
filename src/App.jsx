import { useState, useEffect, useRef } from "react";
import "./App.css";

import plusIcon from "./assets/plusicon.png";
import plusIcon1 from "./assets/plusicon1.png";
import dots from "./assets/dots.png";
import x from "./assets/x.png";
import menu from "./assets/Menu.png";

export default function App() {
  /* =========================
     Constants
     ========================= */
  const MAX = 10;
  const STORAGE_KEY = "carousel-cards";
  const DEFAULT_TITLE = "New Category";

  /* =========================
     State: card data
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

  // Currently opened card id
  const [selectedCard, setSelectedCard] = useState(null);

  // Current carousel rotation angle
  const [rotation, setRotation] = useState(0);

  /* =========================
     State: add-dish modal
     ========================= */

  // Controls the "Add dish" popup
  const [showInput, setShowInput] = useState(false);

  // Input value for newly added dish
  const [inputValue, setInputValue] = useState("");

  /* =========================
     State: top-right menu / delete modal
     ========================= */

  // Controls the dots dropdown menu
  const [showMenu, setShowMenu] = useState(false);

  // Controls the delete confirmation popup
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /* =========================
     State: edit mode
     ========================= */

  // Whether the active card is currently being edited
  const [isEditing, setIsEditing] = useState(false);

  // Editable category title
  const [editTitle, setEditTitle] = useState("");

  // Editable copy of the dishes list
  const [editDishes, setEditDishes] = useState([]);

  /* =========================
     Derived values
     ========================= */

  // +1 because the default "add new card" tile is part of the carousel
  const quantity = cards.length + 1;

  const cardTitles = cards
    .map((card) => card.title.trim())
    .filter((title) => title !== "");
  /* =========================
     Refs: drag / momentum
     ========================= */

  // Tracks whether user is dragging the carousel
  const isDragging = useRef(false);

  // Tracks previous pointer position / time for velocity calculation
  const lastX = useRef(0);
  const lastTime = useRef(0);

  // Momentum value used for auto-spin after dragging
  const velocity = useRef(0);

  const [isMenuClicked, setIsMenuClicked] = useState(false);

  /* =========================
     Effects
     ========================= */

  // Save cards to localStorage whenever cards change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error("Failed to save cards to localStorage:", error);
    }
  }, [cards]);

  // Auto-rotate the carousel while no card is open
  useEffect(() => {
    if (selectedCard !== null || isMenuClicked) return;

    let animationFrameId;

    const animate = () => {
      setRotation((prev) => {
        const next = prev + velocity.current + 0.04;

        // Gradually reduce drag momentum over time
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
  }, [selectedCard, isMenuClicked]);

  /* =========================
     Helpers
     ========================= */

  // Reset all temporary UI state related to modals / edit mode
  const resetUIState = () => {
    setShowInput(false);
    setInputValue("");
    setShowMenu(false);
    setShowDeleteConfirm(false);
    setIsEditing(false);
    setEditTitle("");
    setEditDishes([]);
  };

  // Find the currently selected card object
  const activeCardData = cards.find((card) => card.id === selectedCard);

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
        title: DEFAULT_TITLE,
        dishes: [],
      },
    ]);
  };

  // Open a card and rotate it to the front
  const handleSelectCard = (position, id) => {
    const angle = (position - 1) * (360 / quantity);

    setRotation(-angle);
    setSelectedCard(id);
    resetUIState();

    // Stop any leftover momentum when opening a card
    velocity.current = 0;
  };

  // Close the active card and clear all temporary UI states
  const closeCard = () => {
    setSelectedCard(null);
    resetUIState();
  };

  // Delete the currently selected card
  const handleDeleteCard = () => {
    if (selectedCard === null) return;

    setCards((prevCards) =>
      prevCards.filter((card) => card.id !== selectedCard),
    );

    setSelectedCard(null);
    resetUIState();
    velocity.current = 0;
  };

  /* =========================
     Edit mode actions
     ========================= */

  // Enter edit mode and copy the current card data into editable state
  const handleStartEdit = () => {
    if (!activeCardData) return;

    setEditTitle(activeCardData.title);
    setEditDishes(activeCardData.dishes.map((dish) => ({ ...dish })));

    setIsEditing(true);
    setShowMenu(false);
    setShowInput(false);
  };

  // Update a dish name while editing
  const handleEditDishChange = (dishId, value) => {
    setEditDishes((prev) =>
      prev.map((dish) =>
        dish.id === dishId ? { ...dish, name: value } : dish,
      ),
    );
  };

  // Remove a dish from the editable list
  const handleDeleteDish = (dishId) => {
    setEditDishes((prev) => prev.filter((dish) => dish.id !== dishId));
  };

  // Save edited title + dishes back into the selected card
  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim() || DEFAULT_TITLE;

    // Trim dish names and remove empty rows
    const cleanedDishes = editDishes
      .map((dish) => ({
        ...dish,
        name: dish.name.trim(),
      }))
      .filter((dish) => dish.name !== "");

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === selectedCard
          ? {
              ...card,
              title: trimmedTitle,
              dishes: cleanedDishes,
            }
          : card,
      ),
    );

    setIsEditing(false);
    setEditTitle("");
    setEditDishes([]);
  };

  /* =========================
     Drag interaction
     ========================= */

  // Start dragging the carousel
  const handlePointerDown = (e) => {
    if (selectedCard !== null || isMenuClicked) return;

    isDragging.current = true;
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  // Rotate the carousel while dragging
  const handlePointerMove = (e) => {
    if (!isDragging.current || selectedCard !== null || isMenuClicked) return;

    const currentX = e.clientX;
    const currentTime = performance.now();
    const deltaX = currentX - lastX.current;
    const deltaTime = currentTime - lastTime.current || 1;

    // Convert horizontal drag to rotation amount
    const dragRotation = deltaX * 0.03;
    setRotation((prev) => prev + dragRotation);

    // Save drag velocity for momentum after release
    velocity.current = (deltaX / deltaTime) * 0.3;

    lastX.current = currentX;
    lastTime.current = currentTime;
  };

  // Stop dragging
  const handlePointerUp = () => {
    isDragging.current = false;
  };

  /* =========================
     Add-dish modal actions
     ========================= */

  // Open the add-dish popup
  const handleOpenInput = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowInput(true);
  };

  // Add a new dish to the currently selected card
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

  // Allow Enter key to submit new dish
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleDone();
    }
  };

  /* =========================
     Visual helpers
     ========================= */

  // Add or remove the fade effect depending on scroll position
  const updateFade = (el) => {
    if (!el) return;

    const isOverflowing = el.scrollHeight > el.clientHeight;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    el.classList.toggle("fade", isOverflowing && !atBottom);
  };

  /* =========================
     Render
     ========================= */
  return (
    <div>
      <div className="banner">
        {/* Dark background overlay shown when a card is open */}
        {(selectedCard !== null || isMenuClicked) && (
          <div
            className="overlay"
            onClick={() => {
              if (selectedCard !== null) {
                closeCard();
              }
              if (isMenuClicked) {
                setIsMenuClicked(false);
              }
            }}
          />
        )}

        <div
          className={`menuBanner ${isMenuClicked ? "active" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            onClick={(e) => {
              e.stopPropagation();
              velocity.current = 0;
              isDragging.current = false;
              setIsMenuClicked((prev) => !prev);
            }}
            src={menu}
            alt="Menu Icon"
          />
          {isMenuClicked && (
            <div className="menuBannerContent">
              {cardTitles.length > 0 ? (
                cardTitles.map((title, index) => (
                  <p key={index} className="menuBannerItem">
                    {title}
                  </p>
                ))
              ) : (
                <p className="menuBannerItem empty">No categories yet</p>
              )}
            </div>
          )}
        </div>

        <div
          className={`slider ${selectedCard !== null ? "cardOpen" : ""} ${
            isMenuClicked ? "menuOpen" : ""
          }`}
          style={{ "--quantity": quantity, "--rotation": `${rotation}deg` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Default tile used to create a new category card */}
          <div
            className={`card defaultCard ${
              selectedCard !== null ? "collapsed" : ""
            }`}
            style={{ "--position": 1 }}
            onClick={selectedCard === null ? newCard : undefined}
          >
            <img src={plusIcon} alt="Add card" />
          </div>

          {/* Existing category cards */}
          {cards.map((card, index) => {
            const isActive = selectedCard === card.id;

            return (
              <div
                key={card.id}
                className={`card ${isActive ? "active" : ""} ${
                  selectedCard !== null && !isActive ? "collapsed" : ""
                } ${isActive && isEditing ? "editingCard" : ""}`}
                style={{ "--position": index + 2 }}
                onClick={() => {
                  if (selectedCard === null) {
                    handleSelectCard(index + 2, card.id);
                  }
                }}
              >
                {/* Title: normal mode vs edit mode */}
                {isActive && isEditing ? (
                  <input
                    className="editTitleInput"
                    type="text"
                    value={editTitle === "New Category" ? "" : editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Category name"
                  />
                ) : (
                  <h1>{card.title}</h1>
                )}

                {/* Dish preview / scrollable list in non-edit mode */}
                {!isEditing && card.dishes.length > 0 && (
                  <ul
                    key={`${card.id}-${isActive}`}
                    className={`dishList ${
                      isActive ? "activeList" : "previewList"
                    }`}
                    ref={(el) => el && updateFade(el)}
                    onScroll={(e) => updateFade(e.currentTarget)}
                  >
                    {card.dishes.map((dish) => (
                      <li key={dish.id}>{dish.name}</li>
                    ))}
                  </ul>
                )}

                {/* Editable dish list */}
                {isActive && isEditing && (
                  <div
                    className="editDishList"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {editDishes.length > 0 ? (
                      editDishes.map((dish) => (
                        <div key={dish.id} className="editDishRow">
                          <div className="inputWrapper">
                            <input
                              className="editDishInput"
                              type="text"
                              value={dish.name}
                              onChange={(e) =>
                                handleEditDishChange(dish.id, e.target.value)
                              }
                              placeholder="Dish name"
                            />

                            <img
                              src={x}
                              alt="Delete dish"
                              className="deleteDishIcon"
                              onClick={() => handleDeleteDish(dish.id)}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="emptyEditText">No dishes yet</p>
                    )}
                  </div>
                )}

                {/* Controls shown only on the active card */}
                {isActive && (
                  <>
                    {/* Top-right dots menu (hidden during edit mode) */}
                    {!isEditing && (
                      <>
                        <button
                          className="menuButton"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu((prev) => !prev);
                          }}
                        >
                          <img src={dots} alt="Card menu" />
                        </button>

                        {showMenu && (
                          <div
                            className="cardMenu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="menuItem"
                              onClick={handleStartEdit}
                            >
                              Edit
                            </button>

                            <button
                              className="menuItem deleteItem"
                              onClick={() => {
                                setShowMenu(false);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Bottom control: add button in normal mode, save button in edit mode */}
                    {!isEditing ? (
                      <img
                        className="add"
                        src={plusIcon1}
                        alt="Open input"
                        onClick={handleOpenInput}
                      />
                    ) : (
                      <button
                        className="saveButton"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                      >
                        Save
                      </button>
                    )}

                    {/* Add-dish modal */}
                    {showInput && !isEditing && (
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

                    {/* Delete-card confirmation modal */}
                    {showDeleteConfirm && (
                      <div
                        className="modalBackdrop"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        <div
                          className="modal confirmModal"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h2>Delete category?</h2>
                          <p>Do you want to delete this entire card?</p>

                          <div className="modalActions">
                            <button
                              className="cancelBtn"
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              No
                            </button>

                            <button
                              className="doneBtn"
                              onClick={handleDeleteCard}
                            >
                              Yes
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
    </div>
  );
}
