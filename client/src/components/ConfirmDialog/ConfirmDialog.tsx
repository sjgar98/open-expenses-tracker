import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, message, onConfirm, onCancel } = props;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {message && <p>{message}</p>}
        <Button color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
        <Button color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
