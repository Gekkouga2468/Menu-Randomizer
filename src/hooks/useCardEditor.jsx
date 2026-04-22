import { useState } from "react";

export default function useCardEditor({
  activeCardData,
  selectedCard,
  setCards,
  defaultTitle,
}) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDishes, setEditDishes] = useState([]);

  const resetUIState = () => {
    setShowInput(false);
    setInputValue("");
    setShowMenu(false);
    setShowDeleteConfirm(false);
    setIsEditing(false);
    setEditTitle("");
    setEditDishes([]);
  };

  const handleStartEdit = () => {
    if (!activeCardData) return;

    setEditTitle(activeCardData.title);
    setEditDishes(activeCardData.dishes.map((dish) => ({ ...dish })));

    setIsEditing(true);
    setShowMenu(false);
    setShowInput(false);
  };

  const handleEditDishChange = (dishId, value) => {
    setEditDishes((prev) =>
      prev.map((dish) =>
        dish.id === dishId ? { ...dish, name: value } : dish,
      ),
    );
  };

  const handleDeleteDish = (dishId) => {
    setEditDishes((prev) => prev.filter((dish) => dish.id !== dishId));
  };

  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim() || defaultTitle;

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

  const handleOpenInput = (e) => {
    e.stopPropagation();
    setShowMenu(false);
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

  return {
    showInput,
    setShowInput,
    inputValue,
    setInputValue,
    showMenu,
    setShowMenu,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isEditing,
    setIsEditing,
    editTitle,
    setEditTitle,
    editDishes,
    setEditDishes,
    resetUIState,
    handleStartEdit,
    handleEditDishChange,
    handleDeleteDish,
    handleSaveEdit,
    handleOpenInput,
    handleDone,
    handleKeyDown,
  };
}
