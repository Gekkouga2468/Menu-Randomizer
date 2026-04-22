import Modal from "./Modal";

export default function DecisionModal({
  backdropClassName = "modalBackdrop",
  contentClassName = "modal",
  headerText,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "OK",
  onCancel,
  onConfirm,
  titleClassName,
  actionsClassName = "modalActions",
  cancelButtonClassName = "cancelBtn",
  confirmButtonClassName = "doneBtn",
  headerClassName,
  headerTextClassName,
}) {
  return (
    <Modal
      backdropClassName={backdropClassName}
      contentClassName={contentClassName}
      onClose={onCancel}
    >
      {headerText && (
        <div className={headerClassName}>
          <p className={headerTextClassName}>{headerText}</p>
        </div>
      )}

      {title && <h2 className={titleClassName}>{title}</h2>}
      {message && <p>{message}</p>}

      <div className={actionsClassName}>
        <button className={cancelButtonClassName} onClick={onCancel}>
          {cancelText}
        </button>

        <button className={confirmButtonClassName} onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
