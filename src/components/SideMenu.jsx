import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableMenuRow from "./SortableMenuRow";

export default function SideMenu({
  isMenuClicked,
  setIsMenuClicked,
  cards,
  cardCycle,
  handleDragEnd,
  handleSelectCard,
  velocity,
  isDragging,
  menu,
  menuBlack,
  skipAnimation,
  setSkipAnimation,
}) {
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

  return (
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
        draggable={false}
        src={isMenuClicked ? menu : menuBlack}
        alt="Menu Icon"
      />

      {isMenuClicked && (
        <>
          <div className="menuBannerToggle">
            <label>
              <input
                type="checkbox"
                checked={skipAnimation}
                onChange={(e) => setSkipAnimation(e.target.checked)}
              />
              <span>Skip animation</span>
            </label>
          </div>

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
                    <SortableMenuRow
                      key={item.id}
                      item={item}
                      icon={menu}
                      cards={cards}
                      handleSelectCard={handleSelectCard}
                      setIsMenuClicked={setIsMenuClicked}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <p className="menuBannerItem empty">No categories yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
