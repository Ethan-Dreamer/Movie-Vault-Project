import React from "react";
import Modal from "react-modal";
import CloseIcon from "@mui/icons-material/Close";

Modal.setAppElement("#root");

export default function PopUp({
  isOpen,
  onClose,
  children,
  removeClose,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={!removeClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      closeTimeoutMS={400}
    >
      {!removeClose && (
        <button onClick={onClose} className="modal-close">
          <CloseIcon />
        </button>
      )}
      <div className="modal-children">{children}</div>
    </Modal>
  );
}