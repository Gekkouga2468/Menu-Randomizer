import { useState, useEffect, useRef } from "react";
import "./App.css";

import plusIcon from "./assets/plusicon.png";
import plusIcon1 from "./assets/plusicon1.png";
import dots from "./assets/dots.png";
import x from "./assets/x.png";
import menu from "./assets/Menu.png";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* =========================
   Sortable menu row
   ========================= */

/*
  Represents one category row inside the side menu.

  The row itself is sortable through dnd-kit.
  The small menu icon on the right acts as the drag handle.
*/
function SortableMenuRow({ item, icon }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="menuBannerRow">
      <p className="menuBannerItem">{item.title}</p>

      <img
        className="menuIcon dragHandle"
        src={icon}
        alt="Reorder category"
        draggable={false}
        {...attributes}
        {...listeners}
      />
    </div>
  );
}

export default function App() {
  /* =========================
     Constants
     ========================= */

  const MAX = 10;
  const STORAGE_KEY = "carousel-cards";
  const DEFAULT_TITLE = "New Category";
  const AUTO_SPIN_SPEED = 0.04;
  const DRAG_THRESHOLD = 6;

  /* =========================
     Main card state
     ========================= */

  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to load cards from localStorage:", error);
      return [];
    }
  });

  /*
    cardCycle:
    Separate ordering used only for the side menu / category cycle.
    Reordering this does NOT change the order of cards in the carousel.
  */
  const [cardCycle, setCardCycle] = useState(() =>
    cards
      .map((card) => ({
        id: card.id,
        title: card.title.trim() || DEFAULT_TITLE,
      }))
      .filter((item) => item.title !== ""),
  );

  /* =========================
     UI state
     ========================= */

  // The currently opened card in the carousel
  const [selectedCard, setSelectedCard] = useState(null);

  // The current rotation angle of the carousel
  const [rotation, setRotation] = useState(0);

  // Controls the add-dish popup
  const [showInput, setShowInput] = useState(false);

  // Current value inside the add-dish input
  const [inputValue, setInputValue] = useState("");

  // Controls the card's top-right dropdown menu
  const [showMenu, setShowMenu] = useState(false);

  // Controls the delete-card confirmation popup
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Whether the current active card is in edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Temporary editable title for the active card
  const [editTitle, setEditTitle] = useState("");

  // Temporary editable dishes for the active card
  const [editDishes, setEditDishes] = useState([]);

  // Controls the side menu banner
  const [isMenuClicked, setIsMenuClicked] = useState(false);

  const [cycleIndex, setCycleIndex] = useState(() => {
    try {
      const saved = localStorage.getItem("cycle-index");
      return saved ? JSON.parse(saved) : 0;
    } catch (error) {
      console.error("Failed to load cycle index from localStorage:", error);
      return 0;
    }
  });

  const [usedDishIds, setUsedDishIds] = useState(() => {
    try {
      const saved = localStorage.getItem("used-dish-ids");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error("Failed to load used dish ids from localStorage:", error);
      return new Set();
    }
  });

  const [result, setResult] = useState(null);

  const isSpinning = useRef(false);

  const [isSpinningState, setIsSpinningState] = useState(false);

  /* =========================
     Derived values
     ========================= */

  /*
    The default "add new card" tile counts as one item in the carousel,
    so quantity is cards.length + 1.
  */
  const quantity = cards.length + 1;

  // The full card object for the currently selected card
  const activeCardData = cards.find((card) => card.id === selectedCard);

  /* =========================
     Drag / animation refs
     ========================= */

  // Whether the user is dragging the carousel
  const isDragging = useRef(false);

  // Pointer tracking for drag velocity
  const lastX = useRef(0);
  const lastTime = useRef(0);

  // Momentum applied after releasing a drag
  const velocity = useRef(0);

  // Drag detection for distinguishing click vs drag
  const pointerStartX = useRef(0);
  const didDrag = useRef(false);

  /* =========================
     DnD sensors
     ========================= */

  /*
    dnd-kit sensor for the side menu reorder.
    distance: 6 means the user must move 6px before drag begins.
  */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
  );

  /* =========================
     Effects
     ========================= */

  /*
    Persist cards to localStorage whenever they change.
    This saves:
    - titles
    - dishes
    - card order in the carousel
  */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error("Failed to save cards to localStorage:", error);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem("used-dish-ids", JSON.stringify([...usedDishIds]));
    } catch (error) {
      console.error("Failed to save used dish ids to localStorage:", error);
    }
  }, [usedDishIds]);

  useEffect(() => {
    try {
      localStorage.setItem("cycle-index", JSON.stringify(cycleIndex));
    } catch (error) {
      console.error("Failed to save cycle index to localStorage:", error);
    }
  }, [cycleIndex]);

  /*
    Keep cardCycle in sync with cards.

    This handles:
    - title edits
    - deleted cards
    - newly added cards

    It preserves the user's custom cycle order as much as possible.
  */
  useEffect(() => {
    setCardCycle((prevCycle) => {
      const prevIds = new Set(prevCycle.map((item) => item.id));

      // Keep existing cycle items, but update their titles from cards
      const updatedCycle = prevCycle
        .map((item) => {
          const matchingCard = cards.find((card) => card.id === item.id);
          if (!matchingCard) return null;

          return {
            id: matchingCard.id,
            title: matchingCard.title.trim() || DEFAULT_TITLE,
          };
        })
        .filter(Boolean);

      // Add newly created cards to the end of the cycle
      const newItems = cards
        .filter((card) => !prevIds.has(card.id))
        .map((card) => ({
          id: card.id,
          title: card.title.trim() || DEFAULT_TITLE,
        }));

      return [...updatedCycle, ...newItems];
    });
  }, [cards]);

  /*
    Auto-rotate the carousel while:
    - no card is open
    - side menu is not open

    The carousel rotates with:
    - a constant auto-spin speed
    - leftover drag momentum
  */
  useEffect(() => {
    if (
      selectedCard !== null ||
      isMenuClicked ||
      isSpinningState ||
      result !== null
    )
      return;

    let animationFrameId;

    const animate = () => {
      setRotation((prev) => {
        const next = prev + velocity.current + AUTO_SPIN_SPEED;
        velocity.current *= 0.95;
        if (Math.abs(velocity.current) < 0.001) velocity.current = 0;
        return next;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedCard, isMenuClicked, isSpinningState, result]);

  useEffect(() => {
    if (selectedCard !== null || isMenuClicked || isSpinning.current) return;
  }, [selectedCard, isMenuClicked]);

  /* =========================
     Helper functions
     ========================= */

  /*
    Reset temporary UI state related to:
    - popups
    - edit mode
    - menus
  */
  const resetUIState = () => {
    setShowInput(false);
    setInputValue("");
    setShowMenu(false);
    setShowDeleteConfirm(false);
    setIsEditing(false);
    setEditTitle("");
    setEditDishes([]);
  };

  /* =========================
     Card actions
     ========================= */

  /*
    Create a new category card.
    It starts with the default title and no dishes.
  */
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

  /*
    Open a card and rotate it to the front of the carousel.
  */
  const handleSelectCard = (position, id) => {
    const angle = (position - 1) * (360 / quantity);

    setRotation(-angle);
    setSelectedCard(id);
    resetUIState();

    // Stop remaining momentum once a card is opened
    velocity.current = 0;
  };

  /*
    Close the currently active card.
  */
  const closeCard = () => {
    setSelectedCard(null);
    resetUIState();
  };

  /*
    Delete the currently selected card from cards.
  */
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

  /*
    Enter edit mode for the active card.
    Copy its title and dishes into temporary editable state.
  */
  const handleStartEdit = () => {
    if (!activeCardData) return;

    setEditTitle(activeCardData.title);
    setEditDishes(activeCardData.dishes.map((dish) => ({ ...dish })));

    setIsEditing(true);
    setShowMenu(false);
    setShowInput(false);
  };

  /*
    Update the name of a dish while editing.
  */
  const handleEditDishChange = (dishId, value) => {
    setEditDishes((prev) =>
      prev.map((dish) =>
        dish.id === dishId ? { ...dish, name: value } : dish,
      ),
    );
  };

  /*
    Remove a dish from the editable dish list.
  */
  const handleDeleteDish = (dishId) => {
    setEditDishes((prev) => prev.filter((dish) => dish.id !== dishId));
  };

  /*
    Save edited title + edited dishes back into the real cards array.
  */
  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim() || DEFAULT_TITLE;

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
     Carousel drag interactions
     ========================= */

  /*
    Start dragging the carousel.
    Also reset click-vs-drag detection.
  */
  const handlePointerDown = (e) => {
    if (selectedCard !== null || isMenuClicked) return;

    isDragging.current = true;
    didDrag.current = false;
    pointerStartX.current = e.clientX;

    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  /*
    Rotate the carousel while dragging.
    If the pointer moves enough, treat it as a drag instead of a click.
  */
  const handlePointerMove = (e) => {
    if (!isDragging.current || selectedCard !== null || isMenuClicked) return;

    const currentX = e.clientX;
    const currentTime = performance.now();
    const deltaX = currentX - lastX.current;
    const deltaTime = currentTime - lastTime.current || 1;

    if (Math.abs(currentX - pointerStartX.current) > DRAG_THRESHOLD) {
      didDrag.current = true;
    }

    const dragRotation = deltaX * 0.05;
    setRotation((prev) => prev + dragRotation);

    velocity.current = (deltaX / deltaTime) * 0.8;

    lastX.current = currentX;
    lastTime.current = currentTime;
  };

  /*
    Stop dragging the carousel.
  */
  const handlePointerUp = () => {
    isDragging.current = false;
  };

  /* =========================
     Add dish actions
     ========================= */

  /*
    Open the add-dish input popup.
  */
  const handleOpenInput = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowInput(true);
  };

  /*
    Add a new dish to the currently selected card.
  */
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

  /*
    Allow pressing Enter to submit a new dish.
  */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleDone();
    }
  };

  /* =========================
     Visual helper
     ========================= */

  /*
    Adds or removes the fade class on long scrollable dish lists.
    This creates the subtle fade at the bottom when more content exists.
  */
  const updateFade = (el) => {
    if (!el) return;

    const isOverflowing = el.scrollHeight > el.clientHeight;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    el.classList.toggle("fade", isOverflowing && !atBottom);
  };

  /* =========================
     Menu reorder actions
     ========================= */

  /*
    Reorder only the side-menu cycle, not the real cards array.
  */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setCardCycle((prevCycle) => {
      const oldIndex = prevCycle.findIndex((item) => item.id === active.id);
      const newIndex = prevCycle.findIndex((item) => item.id === over.id);

      return arrayMove(prevCycle, oldIndex, newIndex);
    });
  };

  const handleRandomize = () => {
    if (cardCycle.length === 0 || isSpinning.current) return;

    const currentCycleItem = cardCycle[cycleIndex % cardCycle.length];
    const matchingCard = cards.find((card) => card.id === currentCycleItem.id);

    if (!matchingCard || matchingCard.dishes.length === 0) {
      console.log(`Category "${currentCycleItem.title}" has no dishes.`);
      return;
    }

    const availableDishes = matchingCard.dishes.filter(
      (dish) => !usedDishIds.has(dish.id),
    );

    if (availableDishes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableDishes.length);
    const randomDish = availableDishes[randomIndex];

    // Find what position this card sits at in the carousel (+2 because position 1 is the default tile)
    const cardPositionIndex =
      cards.findIndex((c) => c.id === matchingCard.id) + 2;

    spinToCategory(cardPositionIndex, () => {
      setResult({
        category: currentCycleItem.title,
        dish: randomDish.name,
        dishId: randomDish.id,
        cardId: matchingCard.id,
        isLastDish: availableDishes.length === 1,
      });
    });

    setCycleIndex((prev) => (prev + 1) % cardCycle.length);
  };

  const handleAccept = () => {
    if (!result) return;

    const matchingCard = cards.find((card) => card.id === result.cardId);
    if (!matchingCard) return;

    setUsedDishIds((prev) => {
      if (result.isLastDish) {
        const next = new Set(prev);
        matchingCard.dishes.forEach((dish) => next.delete(dish.id));
        return next;
      }
      return new Set([...prev, result.dishId]);
    });

    setResult(null);
  };

  const handleDecline = () => {
    // Roll back the cycle index since the pick was rejected
    setCycleIndex((prev) => (prev - 1 + cardCycle.length) % cardCycle.length);
    setResult(null);
  };

  const spinToCategory = (targetCardIndex, onComplete) => {
    isSpinning.current = true;
    setIsSpinningState(true);
    velocity.current = 0;

    const SPIN_DURATION = 10000;
    const FAST_PHASE = 0.2;
    const SLOW_PHASE = 0.999;
    const MAX_SPEED = 1.5;

    const targetAngle = -(targetCardIndex - 1) * (360 / quantity);
    const startTime = performance.now();
    let startRotation = rotation;
    const extraSpins = 3 * 360;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / SPIN_DURATION, 1);

      let newRotation;

      if (t < FAST_PHASE) {
        const localT = t / FAST_PHASE;
        const speed = MAX_SPEED * localT;
        newRotation = startRotation + speed * (elapsed / 16);
      } else if (t < SLOW_PHASE) {
        const localT = (t - FAST_PHASE) / (SLOW_PHASE - FAST_PHASE);
        const eased = 1 - Math.pow(1 - localT, 3);
        const totalTravel = extraSpins + (targetAngle - (startRotation % 360));
        newRotation = startRotation + totalTravel * eased;
      } else {
        newRotation = targetAngle;
      }

      setRotation(newRotation);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning.current = false;
        setIsSpinningState(false);
        setRotation(targetAngle);
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  };
  /* =========================
     Render
     ========================= */

  return (
    <div>
      <div className="banner">
        {/* Overlay shown whenever a card or the side menu is open */}
        {(selectedCard !== null || isMenuClicked) && (
          <div
            className="overlay"
            onClick={() => {
              if (selectedCard !== null) closeCard();
              if (isMenuClicked) setIsMenuClicked(false);
            }}
          />
        )}

        {/* =========================
            Side menu banner
           ========================= */}
        <div
          className={`menuBanner ${isMenuClicked ? "active" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top-left menu button */}
          <img
            onClick={(e) => {
              e.stopPropagation();
              velocity.current = 0;
              isDragging.current = false;
              setIsMenuClicked((prev) => !prev);
            }}
            draggable={false}
            src={menu}
            alt="Menu Icon"
          />

          {/* Sortable category cycle list */}
          {isMenuClicked && (
            <div className="menuBannerContent">
              {cards.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={cardCycle.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {cardCycle.map((item) => (
                      <SortableMenuRow key={item.id} item={item} icon={menu} />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="menuBannerItem empty">No categories yet</p>
              )}
            </div>
          )}
        </div>

        {/* =========================
            Carousel slider
           ========================= */}
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
          {/* Default "add new card" tile */}
          <div
            className={`card defaultCard ${
              selectedCard !== null ? "collapsed" : ""
            }`}
            style={{ "--position": 1 }}
            onClick={selectedCard === null ? newCard : undefined}
          >
            <img src={plusIcon} alt="Add card" draggable={false} />
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
                  if (selectedCard === null && !didDrag.current) {
                    handleSelectCard(index + 2, card.id);
                  }
                  didDrag.current = false;
                }}
              >
                {/* Card title */}
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

                {/* Normal dish list */}
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
                      <li
                        key={dish.id}
                        style={
                          usedDishIds.has(dish.id)
                            ? { textDecoration: "line-through", opacity: 0.4 }
                            : {}
                        }
                      >
                        {dish.name}
                      </li>
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
                              draggable={false}
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
                    {/* Top-right card menu */}
                    {!isEditing && (
                      <>
                        <button
                          className="menuButton"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu((prev) => !prev);
                          }}
                        >
                          <img src={dots} alt="Card menu" draggable={false} />
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

                    {/* Bottom control */}
                    {!isEditing ? (
                      <img
                        className="add"
                        src={plusIcon1}
                        alt="Open input"
                        onClick={handleOpenInput}
                        draggable={false}
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

                    {/* Delete confirmation modal */}
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
      {selectedCard === null && !isMenuClicked && (
        <button className="startButton" onClick={handleRandomize}>
          Start
        </button>
      )}

      {result && (
        <div className="resultBackdrop">
          <div className="resultModal">
            <div className="resultHeader">
              <p className="resultHeaderText">The chosen dish is</p>
            </div>
            <h2 className="resultDish">{result.dish}</h2>
            <div className="resultActions">
              <button className="resultDecline" onClick={handleDecline}>
                Decline
              </button>
              <button className="resultAccept" onClick={handleAccept}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
