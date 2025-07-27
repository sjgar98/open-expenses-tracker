import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import type { Currency } from '../../../model/currencies';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

export interface NewCurrencyDialogProps {
  currency: Currency;
  open: boolean;
  onSave: (data: Currency) => void;
  onDelete: (data: Currency) => void;
  onCancel: () => void;
}

export default function EditCurrencyDialog(props: NewCurrencyDialogProps) {
  const { t } = useTranslation();
  const { currency, open, onSave, onDelete, onCancel } = props;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      id: currency.id,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      symbol: formData.get('symbol') as string,
      status: formData.get('status') === 'true',
    };
    onSave(data);
  }

  function handleDelete() {
    onDelete(currency);
  }

  return (
    <Dialog onClose={() => onCancel()} open={open}>
      <DialogTitle>{t('currencies.edit.title')}</DialogTitle>
      <DialogContent>
        <form className="d-flex flex-column gap-3 my-2" onSubmit={handleSubmit}>
          <TextField name="name" label={t('currencies.edit.name')} variant="outlined" value={currency.name} />
          <TextField
            name="code"
            label={t('currencies.edit.iso')}
            slotProps={{ htmlInput: { maxLength: 3 } }}
            variant="outlined"
            value={currency.code}
          />
          <TextField name="symbol" label={t('currencies.edit.symbol')} variant="outlined" value={currency.symbol} />
          <FormControlLabel
            control={<Switch name="status" defaultChecked={currency.visible} value={currency.visible} />}
            label={t('currencies.edit.status')}
          />
          <DialogActions className="d-flex justify-content-between p-0 mt-3">
            <Button sx={{ minWidth: 'max-content' }} color="error" onClick={handleDelete}>
              <DeleteIcon />
            </Button>
            <Button color="success" type="submit" className="d-flex gap-2">
              <SaveIcon />
              <span>{t('currencies.edit.save')}</span>
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
