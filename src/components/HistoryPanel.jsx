export default function HistoryPanel({
  isHistoryOpen,
  setIsHistoryOpen,
  isMenuClicked,
  setIsMenuClicked,
  selectedCard,
  closeCard,
  velocity,
  isDragging,
  historyItems,
  historyIcon,
  historyIconWhite,
}) {
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`historyBanner ${isHistoryOpen ? "active" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <img
        onClick={(e) => {
          e.stopPropagation();
          velocity.current = 0;
          isDragging.current = false;

          if (selectedCard !== null) closeCard();
          if (isMenuClicked) setIsMenuClicked(false);

          setIsHistoryOpen((prev) => !prev);
        }}
        draggable={false}
        src={isHistoryOpen ? historyIconWhite : historyIcon}
        alt="History Icon"
        className="historyBannerIcon"
      />

      {isHistoryOpen && (
        <div className="historyBannerContent">
          {historyItems.length > 0 ? (
            historyItems.map((item) => (
              <div key={item.id} className="historyBannerRow">
                <p className="historyDishMeta">
                  {formatDateTime(item.chosenAt)}
                </p>
                <p className="historyDishName">{item.dishName}</p>
              </div>
            ))
          ) : (
            <p className="historyBannerEmpty">No history yet</p>
          )}
        </div>
      )}
    </div>
  );
}
