import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type PaymentMethodDto } from '../../../model/payment-methods';
import Header from '../../../components/Header/Header';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, Switch, TextField, Typography, } from '@mui/material';
import RRuleGenerator from '../../../components/RRuleGenerator/RRuleGenerator';
import { useNavigate } from 'react-router';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import { useState, type FormEvent } from 'react';
import { ApiService } from '../../../services/api/api.service';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';

export default function NewPaymentMethod() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, reset } = useForm<PaymentMethodDto>({
    defaultValues: {
      name: '',
      credit: false,
      creditClosingDateRule: '',
      creditDueDateRule: '',
    },
  });
  const [isCredit, setIsCredit] = useState(false);

  function onSubmit(data: PaymentMethodDto) {
    ApiService.saveNewPaymentMethod(data)
      .then(() => {
        navigate('/payment-methods');
      })
      .catch((error) => {
        enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
      });
  }

  function onFormChange(event: FormEvent<HTMLFormElement>) {
    if ((event.target as any)?.name === 'credit') {
      setIsCredit((event.target as HTMLInputElement).checked);
    }
  }

  function onReturn() {
    navigate('..');
  }

  function onReset() {
    reset({
      name: '',
      credit: false,
      creditClosingDateRule: '',
      creditDueDateRule: '',
    });
  }

  return (
    <>
      <Header location={t('paymentMethods.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <div className="container pt-5">
          <div className="row">
            <div className="col-12">
              <Typography variant="h4" textAlign="center">
                {t('paymentMethods.new.title')}
              </Typography>
            </div>
          </div>
        </div>
        <div className="container py-3">
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-start gap-3 pb-3">
                <div className="d-flex gap-3">
                  <Button color="primary" className="d-flex gap-2" sx={{ width: 'fit-content' }} onClick={onReturn}>
                    <ArrowBackIcon />
                    <span>{t('actions.return')}</span>
                  </Button>
                </div>
              </div>
              <form className="d-flex flex-column gap-3 my-2" onChange={onFormChange} onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label={t('paymentMethods.new.controls.name')} variant="outlined" required />
                  )}
                />
                <Controller
                  name="credit"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label={t('paymentMethods.new.controls.credit')}
                    />
                  )}
                />
                <Controller
                  name="creditClosingDateRule"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <InputLabel>{t('paymentMethods.new.controls.creditClosingDateRule')}</InputLabel>
                      <OutlinedInput
                        {...field}
                        label={t('paymentMethods.new.controls.creditClosingDateRule')}
                        type="text"
                        disabled={!isCredit}
                        required={isCredit}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton onClick={() => {}} disabled={!isCredit}>
                              <CalendarMonthIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  name="creditDueDateRule"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <InputLabel>{t('paymentMethods.new.controls.creditDueDateRule')}</InputLabel>
                      <OutlinedInput
                        {...field}
                        label={t('paymentMethods.new.controls.creditDueDateRule')}
                        type="text"
                        disabled={!isCredit}
                        required={isCredit}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton onClick={() => {}} disabled={!isCredit}>
                              <CalendarMonthIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  )}
                />
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>RRule Generator</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <RRuleGenerator />
                  </AccordionDetails>
                </Accordion>
                <div className="d-flex justify-content-end gap-3">
                  <div className="d-flex gap-3">
                    <Button color="primary" className="d-flex gap-2" sx={{ width: 'fit-content' }} onClick={onReset}>
                      <UndoIcon />
                      <span>{t('actions.reset')}</span>
                    </Button>
                    <Button color="success" type="submit" className="d-flex gap-2" sx={{ width: 'fit-content' }}>
                      <SaveIcon />
                      <span>{t('actions.save')}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

