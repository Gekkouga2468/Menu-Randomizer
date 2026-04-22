import { useRef } from "react";

export default function useCarouselDrag({
  selectedCard,
  isMenuClicked,
  setRotation,
  dragThreshold = 6,
}) {
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const pointerStartX = useRef(0);
  const didDrag = useRef(false);

  const handlePointerDown = (e) => {
    if (selectedCard !== null || isMenuClicked) return;

    isDragging.current = true;
    didDrag.current = false;
    pointerStartX.current = e.clientX;

    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || selectedCard !== null || isMenuClicked) return;

    const currentX = e.clientX;
    const currentTime = performance.now();
    const deltaX = currentX - lastX.current;
    const deltaTime = currentTime - lastTime.current || 1;

    if (Math.abs(currentX - pointerStartX.current) > dragThreshold) {
      didDrag.current = true;
    }

    const dragRotation = deltaX * 0.05;
    setRotation((prev) => prev + dragRotation);

    velocity.current = (deltaX / deltaTime) * 0.8;

    lastX.current = currentX;
    lastTime.current = currentTime;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return {
    isDragging,
    velocity,
    didDrag,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
