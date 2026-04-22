export default function CardMenu({
  showMenu,
  onToggleMenu,
  onStartEdit,
  onRequestDelete,
  dots,
}) {
  return (
    <>
      <button
        className="menuButton"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu();
        }}
      >
        <img src={dots} alt="Card menu" draggable={false} />
      </button>

      {showMenu && (
        <div className="cardMenu" onClick={(e) => e.stopPropagation()}>
          <button className="menuItem" onClick={onStartEdit}>
            Edit
          </button>

          <button className="menuItem deleteItem" onClick={onRequestDelete}>
            Delete
          </button>
        </div>
      )}
    </>
  );
}
