import CardMenu from "./CardMenu";
import Modal from "./modals/Modal";
import DecisionModal from "./modals/DecisionModal";

export default function CategoryCard({
  card,
  index,
  selectedCard,
  isEditing,
  editTitle,
  editDishes,
  usedDishIds,
  showMenu,
  didDrag,
  x,
  dots,
  plusIcon1,
  onSelectCard,
  onEditTitleChange,
  onEditDishChange,
  onDeleteDish,
  onToggleMenu,
  onStartEdit,
  onRequestDelete,
  onOpenInput,
  onSaveEdit,
  onDishClick,
  updateFade,
}) {
  const isActive = selectedCard === card.id;

  return (
    <div
      className={`card ${isActive ? "active" : ""} ${
        selectedCard !== null && !isActive ? "collapsed" : ""
      } ${isActive && isEditing ? "editingCard" : ""}`}
      style={{ "--position": index + 2 }}
      onClick={() => {
        if (selectedCard === null && !didDrag.current) {
          onSelectCard(index + 2, card.id);
        }
        didDrag.current = false;
      }}
    >
      {isActive && isEditing ? (
        <input
          className="editTitleInput"
          type="text"
          value={editTitle === "New Category" ? "" : editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Category name"
        />
      ) : (
        <h1>{card.title}</h1>
      )}

      {!isEditing && card.dishes.length > 0 && (
        <ul
          key={`${card.id}-${isActive}`}
          className={`dishList ${isActive ? "activeList" : "previewList"}`}
          ref={(el) => el && updateFade(el)}
          onScroll={(e) => updateFade(e.currentTarget)}
          onClick={(e) => {
            if (isActive) e.stopPropagation();
          }}
        >
          {card.dishes.map((dish) => {
            const isUsed = usedDishIds.has(dish.id);

            return (
              <li
                key={dish.id}
                style={
                  isUsed ? { textDecoration: "line-through", opacity: 0.4 } : {}
                }
                onClick={(e) => {
                  if (!isActive) return;
                  e.stopPropagation();
                  onDishClick(dish, isUsed, card);
                }}
              >
                {dish.name}
              </li>
            );
          })}
        </ul>
      )}

      {isActive && isEditing && (
        <div className="editDishList" onClick={(e) => e.stopPropagation()}>
          {editDishes.length > 0 ? (
            editDishes.map((dish) => (
              <div key={dish.id} className="editDishRow">
                <div className="inputWrapper">
                  <input
                    className="editDishInput"
                    type="text"
                    value={dish.name}
                    onChange={(e) => onEditDishChange(dish.id, e.target.value)}
                  />

                  <img
                    src={x}
                    alt="Delete dish"
                    className="deleteDishIcon"
                    draggable={false}
                    onClick={() => onDeleteDish(dish.id)}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="emptyEditText">No dishes yet</p>
          )}
        </div>
      )}

      {isActive && (
        <>
          {!isEditing && (
            <CardMenu
              showMenu={showMenu}
              onToggleMenu={onToggleMenu}
              onStartEdit={onStartEdit}
              onRequestDelete={() => onRequestDelete(card)}
              dots={dots}
            />
          )}

          {!isEditing ? (
            <img
              className="add"
              src={plusIcon1}
              alt="Open input"
              onClick={onOpenInput}
              draggable={false}
            />
          ) : (
            <button
              className="saveButton"
              onClick={(e) => {
                e.stopPropagation();
                onSaveEdit();
              }}
            >
              Save
            </button>
          )}
        </>
      )}
    </div>
  );
}
