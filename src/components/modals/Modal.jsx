export default function Modal({
  backdropClassName = "modalBackdrop",
  contentClassName = "modal",
  onClose,
  children,
}) {
  return (
    <div className={backdropClassName} onClick={onClose}>
      <div className={contentClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
