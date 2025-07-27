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
import { useTranslation } from 'react-i18next';
import type { Currency } from '../../../model/currencies';
import SaveIcon from '@mui/icons-material/Save';

export interface NewCurrencyDialogProps {
  open: boolean;
  onSubmit: (data: Omit<Currency, 'id'>) => void;
  onCancel: () => void;
}

export default function NewCurrencyDialog(props: NewCurrencyDialogProps) {
  const { t } = useTranslation();
  const { open, onSubmit, onCancel } = props;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      visible: formData.get('visible') === 'true',
    };
    onSubmit(data);
  };

  return (
    <Dialog onClose={() => onCancel()} open={open}>
      <DialogTitle>{t('currencies.new.title')}</DialogTitle>
      <DialogContent>
        <form className="d-flex flex-column gap-3 my-2" onSubmit={handleSubmit}>
          <TextField name="name" label={t('currencies.new.name')} variant="outlined" />
          <TextField
            name="code"
            label={t('currencies.new.iso')}
            slotProps={{ htmlInput: { maxLength: 3 } }}
            variant="outlined"
          />
          <TextField name="symbol" label={t('currencies.new.symbol')} variant="outlined" />
          <FormControlLabel control={<Switch name="status" defaultChecked />} label={t('currencies.new.status')} />
          <DialogActions className="d-flex justify-content-end p-0 mt-3">
            <Button color="success" type="submit" className="d-flex gap-2">
              <SaveIcon />
              <span>{t('currencies.new.save')}</span>
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

