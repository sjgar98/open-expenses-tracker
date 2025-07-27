import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { PaymentMethod, PaymentMethodDto } from '../../../model/payment-methods';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, type FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Header from '../../../components/Header/Header';
import { Accordion, AccordionDetails, AccordionSummary, Backdrop, Box, Button, CircularProgress, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, Switch, TextField, Typography, } from '@mui/material';
import RRuleGenerator from '../../../components/RRuleGenerator/RRuleGenerator';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';

export default function EditPaymentMethod() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<PaymentMethod | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentMethodDto>({
    defaultValues: {
      name: '',
      credit: false,
      creditClosingDateRule: null,
      creditDueDateRule: null,
    },
  });
  const [isCredit, setIsCredit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { error: paymentMethodError, data: paymentMethodResponse } = useQuery({
    queryKey: ['paymentMethodByUuid', uuid],
    queryFn: () => ApiService.getUserPaymentMethodByUuid(uuid!),
  });

  useEffect(() => {
    if (paymentMethodResponse) {
      setInitialState(paymentMethodResponse);
      reset({
        name: paymentMethodResponse.name,
        credit: paymentMethodResponse.credit,
        creditClosingDateRule: paymentMethodResponse.creditClosingDateRule,
        creditDueDateRule: paymentMethodResponse.creditDueDateRule,
      });
      setIsCredit(paymentMethodResponse.credit);
      setIsLoading(false);
    }
  }, [paymentMethodResponse]);

  useEffect(() => {
    if (paymentMethodError) {
      enqueueSnackbar(t(parseError(paymentMethodError) ?? 'Error'), {
        variant: 'error',
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      });
      navigate('..');
    }
  }, [paymentMethodError]);

  function onSubmit(data: PaymentMethodDto) {
    ApiService.updatePaymentMethod(uuid!, data)
      .then(() => {
        navigate('/payment-methods');
      })
      .catch((error) => {
        enqueueSnackbar(t(parseError(error) ?? 'Error'), {
          variant: 'error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
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

  function onDelete() {
    ApiService.deletePaymentMethod(uuid!)
      .then(() => {
        navigate('/payment-methods');
      })
      .catch((error) => {
        enqueueSnackbar(t(parseError(error) ?? 'Error'), {
          variant: 'error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
      });
  }

  function onReset() {
    reset({
      name: initialState?.name ?? '',
      credit: initialState?.credit ?? false,
      creditClosingDateRule: initialState?.creditClosingDateRule ?? null,
      creditDueDateRule: initialState?.creditDueDateRule ?? null,
    });
  }

  return (
    <>
      <Header location={t('paymentMethods.title')} />
      {!isLoading && (
        <Box sx={{ flexGrow: 1 }}>
          <div className="container pt-5">
            <div className="row">
              <div className="col-12">
                <Typography variant="h4" textAlign="center">
                  {t('paymentMethods.edit.title')}
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
                <form
                  className="d-flex flex-column gap-3 my-2"
                  onChange={onFormChange}
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('paymentMethods.edit.controls.name')}
                        variant="outlined"
                        required
                        error={!!errors.name}
                        helperText={errors.name ? t('paymentMethods.edit.errors.nameRequired') : ''}
                      />
                    )}
                  />
                  <Controller
                    name="credit"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label={t('paymentMethods.edit.controls.credit')}
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
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-3">
                      <Button color="error" className="d-flex gap-2" sx={{ width: 'fit-content' }} onClick={onDelete}>
                        <DeleteIcon />
                      </Button>
                    </div>
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
      )}
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

