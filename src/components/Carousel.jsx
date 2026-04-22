import CategoryCard from "./CategoryCard";

export default function Carousel({ cards, didDrag, state, assets, handlers }) {
  const {
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
  } = state;

  const { plusIcon, plusIcon1, dots, x } = assets;

  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onNewCard,
    onSelectCard,
    onEditTitleChange,
    onEditDishChange,
    onDeleteDish,
    onToggleMenu,
    onStartEdit,
    onRequestDelete,
    onOpenInput,
    onSaveEdit,
    onInputChange,
    onInputKeyDown,
    onDone,
    onCloseInput,
    onCloseDeleteConfirm,
    onDeleteCard,
    onDishClick,
    updateFade,
  } = handlers;

  return (
    <div
      className={`slider ${selectedCard !== null ? "cardOpen" : ""} ${
        isMenuClicked ? "menuOpen" : ""
      }`}
      style={{ "--quantity": quantity, "--rotation": `${rotation}deg` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        className={`card defaultCard ${
          selectedCard !== null ? "collapsed" : ""
        }`}
        style={{ "--position": 1 }}
        onClick={selectedCard === null ? onNewCard : undefined}
      >
        <img src={plusIcon} alt="Add card" draggable={false} />
      </div>

      {cards.map((card, index) => (
        <CategoryCard
          key={card.id}
          card={card}
          index={index}
          selectedCard={selectedCard}
          isEditing={isEditing}
          editTitle={editTitle}
          editDishes={editDishes}
          usedDishIds={usedDishIds}
          showMenu={showMenu}
          showInput={showInput}
          showDeleteConfirm={showDeleteConfirm}
          didDrag={didDrag}
          x={x}
          dots={dots}
          plusIcon1={plusIcon1}
          onSelectCard={onSelectCard}
          onEditTitleChange={onEditTitleChange}
          onEditDishChange={onEditDishChange}
          onDeleteDish={onDeleteDish}
          onToggleMenu={onToggleMenu}
          onStartEdit={onStartEdit}
          onRequestDelete={onRequestDelete}
          onOpenInput={onOpenInput}
          onSaveEdit={onSaveEdit}
          onInputChange={onInputChange}
          onInputKeyDown={onInputKeyDown}
          inputValue={inputValue}
          onDone={onDone}
          onCloseInput={onCloseInput}
          onCloseDeleteConfirm={onCloseDeleteConfirm}
          onDeleteCard={onDeleteCard}
          onDishClick={onDishClick}
          updateFade={updateFade}
        />
      ))}
    </div>
  );
}
