import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type PaymentMethodDto } from '../../../model/payment-methods';
import Header from '../../../components/Header/Header';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, FormControlLabel, Icon, MenuItem, Switch, TextField, Typography, } from '@mui/material';
import RRuleGenerator from '../../../components/RRuleGenerator/RRuleGenerator';
import { useNavigate } from 'react-router';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import { useState, type FormEvent } from 'react';
import { ApiService } from '../../../services/api/api.service';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';
import { PAYMENT_METHOD_ICONS } from '../../../constants/icons';
import { MuiColorInput } from 'mui-color-input';

export default function NewPaymentMethod() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, reset } = useForm<PaymentMethodDto>({
    defaultValues: {
      name: '',
      icon: '',
      iconColor: '#FFFFFF',
      credit: false,
      creditClosingDateRule: '',
      creditDueDateRule: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCredit, setIsCredit] = useState(false);

  function onSubmit(data: PaymentMethodDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.saveNewPaymentMethod(data)
        .then(() => {
          navigate('/payment-methods');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
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
      icon: '',
      iconColor: '#FFFFFF',
      credit: false,
      creditClosingDateRule: '',
      creditDueDateRule: '',
    });
  }

  return (
    <>
      <Header location={t('paymentMethods.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <div className="container pt-3">
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-start gap-3 pb-3">
                <div className="d-flex gap-3">
                  <Button
                    color="primary"
                    className="d-flex gap-2"
                    sx={{ width: 'fit-content' }}
                    onClick={onReturn}
                    disabled={isSubmitting}
                  >
                    <ArrowBackIcon />
                    <span>{t('actions.return')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
              <form className="d-flex flex-column gap-3 my-2" onChange={onFormChange} onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('paymentMethods.new.controls.name')}
                      variant="outlined"
                      required
                      disabled={isSubmitting}
                    />
                  )}
                />
                <div className="container px-0">
                  <div className="row mx-0 gap-3">
                    <div className="col-12 col-md px-0">
                      <Controller
                        name="icon"
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                          <TextField
                            fullWidth
                            {...field}
                            select
                            label={t('paymentMethods.new.controls.icon')}
                            required
                            disabled={isSubmitting}
                            error={fieldState.invalid}
                          >
                            {PAYMENT_METHOD_ICONS.map((icon) => (
                              <MenuItem key={icon.icon} value={icon.icon}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Icon>{icon.icon}</Icon>
                                  <span>{icon.label}</span>
                                </Box>
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </div>
                    <div className="col-12 col-md px-0">
                      <Controller
                        name="iconColor"
                        control={control}
                        rules={{ validate: (value) => /^#([0-9A-F]{3}){1,2}$/i.test(value) }}
                        render={({ field, fieldState }) => (
                          <MuiColorInput
                            fullWidth
                            {...field}
                            label={t('paymentMethods.new.controls.iconColor')}
                            required
                            format="hex"
                            disabled={isSubmitting}
                            error={fieldState.invalid}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <Controller
                  name="credit"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label={t('paymentMethods.new.controls.credit')}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Controller
                  name="creditClosingDateRule"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('paymentMethods.new.controls.creditClosingDateRule')}
                      variant="outlined"
                      disabled={!isCredit || isSubmitting}
                      required={isCredit}
                    />
                  )}
                />
                <Controller
                  name="creditDueDateRule"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('paymentMethods.new.controls.creditDueDateRule')}
                      variant="outlined"
                      disabled={!isCredit || isSubmitting}
                      required={isCredit}
                    />
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
                    <Button
                      color="primary"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      onClick={onReset}
                      disabled={isSubmitting}
                    >
                      <UndoIcon />
                      <span>{t('actions.reset')}</span>
                    </Button>
                    <Button
                      color="success"
                      type="submit"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      disabled={isSubmitting}
                    >
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

