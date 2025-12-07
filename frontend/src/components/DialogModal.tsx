//DialogModal.tsx
//Function:
//This file contains a reusable DialogModal component that displays a modal dialog with a title, content,
//and optional additional content. It provides "Cancel" and "Confirm" buttons to handle user actions.
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { ReactNode } from "react";

export default function DialogModal({
  open,
  title,
  content,
  additionalContent,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  content: string;
  additionalContent?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
        {additionalContent && <div>{additionalContent}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="secondary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
