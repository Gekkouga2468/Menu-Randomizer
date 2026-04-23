import { useState, useEffect } from "react";
import "./App.css";

import plusIcon from "./assets/plusicon.png";
import plusIcon1 from "./assets/plusicon1.png";
import dots from "./assets/dots.png";
import x from "./assets/x.png";
import menu from "./assets/Menu.png";
import menuBlack from "./assets/MenuBlack.png";
import historyIcon from "./assets/history.png";
import historyIconWhite from "./assets/historyWhite.png";
import manual from "./assets/manual.png";

import { arrayMove } from "@dnd-kit/sortable";
import SideMenu from "./components/SideMenu";
import Carousel from "./components/Carousel";
import DecisionModal from "./components/modals/DecisionModal";
import useLocalStorageState from "./hooks/useLocalStorageState";
import useCarouselDrag from "./hooks/useCarouselDrag";
import useRandomizer from "./hooks/useRandomizer";
import useCardEditor from "./hooks/useCardEditor";
import HistoryPanel from "./components/HistoryPanel";

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

  const [cards, setCards] = useLocalStorageState(STORAGE_KEY, []);

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

  const [selectedCard, setSelectedCard] = useState(null);
  const [rotation, setRotation] = useState(0);

  const [isMenuClicked, setIsMenuClicked] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  const [cycleIndex, setCycleIndex] = useLocalStorageState("cycle-index", 0);

  const [usedDishIds, setUsedDishIds] = useLocalStorageState(
    "used-dish-ids",
    new Set(),
    {
      serialize: (value) => JSON.stringify([...value]),
      deserialize: (value) => new Set(JSON.parse(value)),
    },
  );

  const [restoreDish, setRestoreDish] = useState(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [hasSeenHelp, setHasSeenHelp] = useLocalStorageState(
    "has-seen-help",
    false,
  );

  /* =========================
     Visual helper
     ========================= */

  const updateFade = (el) => {
    if (!el) return;

    const isOverflowing = el.scrollHeight > el.clientHeight;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    el.classList.toggle("fade", isOverflowing && !atBottom);
  };

  /* =========================
     Derived values
     ========================= */

  const quantity = cards.length + 1;

  const activeCardData = cards.find((card) => card.id === selectedCard);

  const {
    showInput,
    setShowInput,
    inputValue,
    setInputValue,
    showMenu,
    setShowMenu,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isEditing,
    editTitle,
    setEditTitle,
    editDishes,
    resetUIState,
    handleStartEdit,
    handleEditDishChange,
    handleDeleteDish,
    handleSaveEdit,
    handleOpenInput,
    handleDone,
    handleKeyDown,
  } = useCardEditor({
    activeCardData,
    selectedCard,
    setCards,
    defaultTitle: DEFAULT_TITLE,
  });

  /* =========================
     Card actions
     ========================= */

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

  const handleSelectCard = (position, id) => {
    const angle = (position - 1) * (360 / quantity);

    setRotation(-angle);
    setSelectedCard(id);
    resetUIState();

    velocity.current = 0;
  };

  const closeCard = () => {
    setSelectedCard(null);
    resetUIState();
  };

  const handleDeleteCard = () => {
    if (selectedCard === null) return;

    setCards((prevCards) =>
      prevCards.filter((card) => card.id !== selectedCard),
    );

    setSelectedCard(null);
    resetUIState();
    velocity.current = 0;
  };

  const {
    isDragging,
    velocity,
    didDrag,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCarouselDrag({
    selectedCard,
    isMenuClicked,
    setRotation,
    dragThreshold: DRAG_THRESHOLD,
  });

  const {
    isSpinning,
    isSpinningState,
    result,
    handleRandomize,
    handleAccept,
    handleDecline,
  } = useRandomizer({
    cards,
    cardCycle,
    cycleIndex,
    setCycleIndex,
    usedDishIds,
    setUsedDishIds,
    quantity,
    rotation,
    setRotation,
    velocity,
  });

  const carouselState = {
    selectedCard,
    isMenuClicked,
    isEditing,
    editTitle,
    editDishes,
    usedDishIds,
    showMenu,
    showInput,
    showDeleteConfirm,
    inputValue,
    quantity,
    rotation,
  };

  const carouselAssets = {
    plusIcon,
    plusIcon1,
    dots,
    x,
  };

  const carouselHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onNewCard: newCard,
    onSelectCard: handleSelectCard,
    onEditTitleChange: setEditTitle,
    onEditDishChange: handleEditDishChange,
    onDeleteDish: handleDeleteDish,
    onToggleMenu: () => setShowMenu((prev) => !prev),
    onStartEdit: handleStartEdit,
    onRequestDelete: () => {
      setShowMenu(false);
      setShowDeleteConfirm(true);
    },
    onOpenInput: handleOpenInput,
    onSaveEdit: handleSaveEdit,
    onInputChange: setInputValue,
    onInputKeyDown: handleKeyDown,
    onDone: handleDone,
    onCloseInput: () => setShowInput(false),
    onCloseDeleteConfirm: () => setShowDeleteConfirm(false),
    onDeleteCard: handleDeleteCard,
    onDishClick: (dish, isUsed, card) => {
      if (isUsed) {
        setRestoreDish({ id: dish.id, name: dish.name });
      } else {
        const availableDishes = card.dishes.filter(
          (item) => !usedDishIds.has(item.id),
        );

        setSelectedDish({
          id: dish.id,
          name: dish.name,
          cardId: card.id,
          isLastDish: availableDishes.length === 1,
        });
      }
    },
    updateFade,
  };

  /* =========================
     Menu reorder actions
     ========================= */

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setCardCycle((prevCycle) => {
      const oldIndex = prevCycle.findIndex((item) => item.id === active.id);
      const newIndex = prevCycle.findIndex((item) => item.id === over.id);

      return arrayMove(prevCycle, oldIndex, newIndex);
    });
  };

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [historyItems, setHistoryItems] = useLocalStorageState(
    "dish-history",
    [],
  );

  const addToHistory = ({ dishName, source }) => {
    setHistoryItems((prev) =>
      [
        {
          id: Date.now(),
          dishName,
          source,
          chosenAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 30),
    );
  };

  useEffect(() => {
    if (!hasSeenHelp) {
      setIsHelpOpen(true);
      setHasSeenHelp(true);
    }
  }, []);

  /* =========================
     Effects
     ========================= */

  useEffect(() => {
    setCardCycle((prevCycle) => {
      const prevIds = new Set(prevCycle.map((item) => item.id));

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

      const newItems = cards
        .filter((card) => !prevIds.has(card.id))
        .map((card) => ({
          id: card.id,
          title: card.title.trim() || DEFAULT_TITLE,
        }));

      return [...updatedCycle, ...newItems];
    });
  }, [cards]);

  useEffect(() => {
    if (
      selectedCard !== null ||
      isHistoryOpen ||
      isMenuClicked ||
      isHelpOpen ||
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
  }, [
    selectedCard,
    isMenuClicked,
    isHistoryOpen,
    isHelpOpen,
    isSpinningState,
    result,
  ]);

  /* =========================
     Render
     ========================= */

  return (
    <div>
      <div className="banner">
        {(selectedCard !== null ||
          isMenuClicked ||
          isHistoryOpen ||
          isHelpOpen) && (
          <div
            className="overlay"
            onClick={() => {
              if (selectedCard !== null) closeCard();
              if (isMenuClicked) setIsMenuClicked(false);
              if (isHistoryOpen) setIsHistoryOpen(false);
              if (isHelpOpen) setIsHelpOpen(false);
            }}
          />
        )}

        <div
          className={`topControl ${selectedCard !== null ? "hiddenOnCardOpen" : ""}`}
        >
          <SideMenu
            isMenuClicked={isMenuClicked}
            setIsMenuClicked={setIsMenuClicked}
            cards={cards}
            cardCycle={cardCycle}
            handleDragEnd={handleDragEnd}
            handleSelectCard={handleSelectCard}
            velocity={velocity}
            isDragging={isDragging}
            menu={menu}
            menuBlack={menuBlack}
          />

          <HistoryPanel
            isHistoryOpen={isHistoryOpen}
            setIsHistoryOpen={setIsHistoryOpen}
            isMenuClicked={isMenuClicked}
            setIsMenuClicked={setIsMenuClicked}
            selectedCard={selectedCard}
            closeCard={closeCard}
            velocity={velocity}
            isDragging={isDragging}
            historyItems={historyItems}
            historyIcon={historyIcon}
            historyIconWhite={historyIconWhite}
          />

          <img
            className="helpButton"
            onClick={(e) => {
              e.stopPropagation();
              velocity.current = 0;
              isDragging.current = false;
              setIsHelpOpen((prev) => !prev);
            }}
            draggable={false}
            src={manual}
            alt="Manual Icon"
          />
        </div>

        <Carousel
          cards={cards}
          didDrag={didDrag}
          state={carouselState}
          assets={carouselAssets}
          handlers={carouselHandlers}
        />
      </div>

      {selectedCard === null && !isMenuClicked && (
        <button className="startButton" onClick={handleRandomize}>
          Start
        </button>
      )}

      {result && (
        <DecisionModal
          backdropClassName="resultBackdrop"
          contentClassName="resultModal"
          headerClassName="resultHeader"
          headerTextClassName="resultHeaderText"
          headerText="The chosen dish is"
          title={result.dish}
          titleClassName="resultDish"
          cancelText="Decline"
          confirmText="Accept"
          onCancel={handleDecline}
          onConfirm={() => {
            addToHistory({
              dishName: result.dish,
              source: "random",
            });
            handleAccept();
          }}
          actionsClassName="resultActions"
          cancelButtonClassName="resultDecline"
          confirmButtonClassName="resultAccept"
        />
      )}

      {selectedDish && (
        <DecisionModal
          backdropClassName="resultBackdrop"
          contentClassName="resultModal"
          headerClassName="resultHeader"
          headerTextClassName="resultHeaderText"
          headerText="Do you want to choose this dish?"
          title={selectedDish.name}
          titleClassName="resultDish"
          cancelText="No"
          confirmText="Yes"
          onCancel={() => setSelectedDish(null)}
          onConfirm={() => {
            const matchingCard = cards.find(
              (card) => card.id === selectedDish.cardId,
            );

            if (!matchingCard) {
              setSelectedDish(null);
              return;
            }

            setUsedDishIds((prev) => {
              if (selectedDish.isLastDish) {
                const next = new Set(prev);
                matchingCard.dishes.forEach((dish) => next.delete(dish.id));
                return next;
              }

              return new Set([...prev, selectedDish.id]);
            });

            addToHistory({
              dishName: selectedDish.name,
              source: "manual",
            });

            setSelectedDish(null);
          }}
          actionsClassName="resultActions"
          cancelButtonClassName="resultDecline"
          confirmButtonClassName="resultAccept"
        />
      )}

      {restoreDish && (
        <DecisionModal
          backdropClassName="resultBackdrop"
          contentClassName="resultModal"
          headerClassName="resultHeader"
          headerTextClassName="resultHeaderText"
          headerText="Restore this dish?"
          title={restoreDish.name}
          titleClassName="resultDish"
          cancelText="No"
          confirmText="Yes"
          onCancel={() => setRestoreDish(null)}
          onConfirm={() => {
            setUsedDishIds((prev) => {
              const next = new Set(prev);
              next.delete(restoreDish.id);
              return next;
            });
            setRestoreDish(null);
          }}
          actionsClassName="resultActions"
          cancelButtonClassName="resultDecline"
          confirmButtonClassName="resultAccept"
        />
      )}

      {isHelpOpen && (
        <div className="resultBackdrop" onClick={() => setIsHelpOpen(false)}>
          <div className="helpModal" onClick={(e) => e.stopPropagation()}>
            <h2 className="helpTitle">How to use</h2>
            <div className="helpContent">
              <p>
                <strong>🎠 Carousel</strong> — Drag left or right to spin. Click
                a card to open it.
              </p>
              <p>
                <strong>➕ Add category</strong> — Click the plus card to create
                a new category.
              </p>
              <p>
                <strong>🍽 Add dish</strong> — Open a card, tap the plus icon at
                the bottom.
              </p>
              <p>
                <strong>✏️ Edit / Delete</strong> — Open a card, tap the ⋯ menu
                in the top right.
              </p>
              <p>
                <strong>🎲 Start</strong> — Press the Start button to randomly
                pick a dish from the next category in the cycle.
              </p>
              <p>
                <strong>✅ Accept / Decline</strong> — Accept marks the dish as
                used. Decline skips it and tries again next time.
              </p>
              <p>
                <strong>👆 Manual pick</strong> — Open a card and tap any dish
                to choose it directly.
              </p>
              <p>
                <strong>↩️ Restore</strong> — Tap a crossed-out dish to restore
                it to the pool.
              </p>
              <p>
                <strong>☰ Menu</strong> — Reorder categories to change the
                randomization cycle.
              </p>
              <p>
                <strong>🕐 History</strong> — View the last 30 dishes that were
                chosen.
              </p>
            </div>
            <button className="helpClose" onClick={() => setIsHelpOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
