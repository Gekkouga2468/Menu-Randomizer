import { useRef, useState } from "react";

export default function useRandomizer({
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
  skipAnimation,
}) {
  const isSpinning = useRef(false);
  const [isSpinningState, setIsSpinningState] = useState(false);
  const [result, setResult] = useState(null);

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
    const startRotation = rotation;
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

  const handleRandomize = () => {
    if (cardCycle.length === 0 || isSpinning.current) return;

    let attempts = 0;
    let searchIndex = cycleIndex % cardCycle.length;

    while (attempts < cardCycle.length) {
      const currentCycleItem = cardCycle[searchIndex];
      const matchingCard = cards.find(
        (card) => card.id === currentCycleItem.id,
      );

      const availableDishes =
        matchingCard?.dishes.filter((dish) => !usedDishIds.has(dish.id)) ?? [];

      if (availableDishes.length > 0) {
        const randomDish =
          availableDishes[Math.floor(Math.random() * availableDishes.length)];

        const cardPositionIndex =
          cards.findIndex((c) => c.id === matchingCard.id) + 2;

        const targetAngle = -(cardPositionIndex - 1) * (360 / quantity);

        setCycleIndex((searchIndex + 1) % cardCycle.length);

        if (skipAnimation) {
          velocity.current = 0;
          setRotation(targetAngle);

          setResult({
            category: currentCycleItem.title,
            dish: randomDish.name,
            dishId: randomDish.id,
            cardId: matchingCard.id,
            isLastDish: availableDishes.length === 1,
          });

          return;
        }

        spinToCategory(cardPositionIndex, () => {
          setResult({
            category: currentCycleItem.title,
            dish: randomDish.name,
            dishId: randomDish.id,
            cardId: matchingCard.id,
            isLastDish: availableDishes.length === 1,
          });
        });

        return;
      }

      searchIndex = (searchIndex + 1) % cardCycle.length;
      attempts++;
    }

    alert("All dishes have been used!");
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
    setCycleIndex((prev) => (prev - 1 + cardCycle.length) % cardCycle.length);
    setResult(null);
  };

  return {
    isSpinning,
    isSpinningState,
    result,
    setResult,
    handleRandomize,
    handleAccept,
    handleDecline,
  };
}
