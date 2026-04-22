import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableMenuRow({ item, icon }) {
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
