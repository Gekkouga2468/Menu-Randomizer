import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableMenuRow({
  item,
  icon,
  cards,
  handleSelectCard,
  setIsMenuClicked,
}) {
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

  const handleRowClick = () => {
    const cardIndex = cards.findIndex((card) => card.id === item.id);

    if (cardIndex === -1) return;

    handleSelectCard(cardIndex + 2, item.id);
    setIsMenuClicked(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="menuBannerRow"
      onClick={handleRowClick}
    >
      <p className="menuBannerItem">{item.title}</p>

      <img
        className="menuIcon dragHandle"
        src={icon}
        alt="Reorder category"
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      />
    </div>
  );
}
