import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../services/api/api.service';
import { parseError } from '../../utils/error-parser.utils';
import Layout from '../../components/Layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, NumberInput, Title } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCaretLeft, IconCaretRight, IconDeviceFloppy } from '@tabler/icons-react';
import { DateTime } from 'luxon';

export default function HistoricExchangeRates() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [date, setDate] = useState<string | null>(null);

  const [initialState, setInitialState] = useState<Record<string, number>>({});
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<Record<string, number>>({
    mode: 'uncontrolled',
    initialValues: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    error: exchangeRatesError,
    data: exchangeRatesResponse,
    refetch,
  } = useQuery({
    queryKey: ['historicExchangeRates'],
    queryFn: () => ApiService.getHistoricExchangeRates(date!),
    enabled: Boolean(date),
  });

  useEffect(() => {
    if (exchangeRatesResponse) {
      setInitialState(exchangeRatesResponse);
      setInitialValues(exchangeRatesResponse);
      reset();
      setIsLoading(false);
    }
  }, [exchangeRatesResponse]);

  useEffect(() => {
    if (exchangeRatesError) {
      enqueueSnackbar(t(parseError(exchangeRatesError) ?? 'Error'), { variant: 'error' });
    }
  }, [exchangeRatesError]);

  useEffect(() => {
    if (date) {
      refetch();
    } else {
      setInitialState({});
      setInitialValues({});
      reset();
    }
  }, [date]);

  function handleSubmit(values: Record<string, number>) {
    if (!isSubmitting && date) {
      setIsSubmitting(true);
      ApiService.updateHistoricExchangeRates(date, values)
        .then(() => {
          enqueueSnackbar(t('historicExchangeRates.update.success'), { variant: 'success' });
        })
        .catch((error) => {
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }

  function setPrevDate() {
    const prevDate = DateTime.fromISO(date!).minus({ days: 1 }).toFormat('yyyy-MM-dd');
    setDate(prevDate);
  }

  function setNextDate() {
    const nextDate = DateTime.fromISO(date!).plus({ days: 1 }).toFormat('yyyy-MM-dd');
    setDate(nextDate);
  }

  return (
    <>
      <Layout>
        <form className="container flex-grow-1" onSubmit={onSubmit(handleSubmit)}>
          <div className="row justify-content-center my-3">
            <div className="col-12">
              <Title order={1} style={{ textAlign: 'center' }}>
                {t('historicExchangeRates.title')}
              </Title>
            </div>
          </div>
          <div className="row justify-content-center mb-4">
            <div className="col d-flex align-items-end gap-3">
              <DatePickerInput
                className="flex-grow-1"
                label={t('historicExchangeRates.filter.date')}
                highlightToday
                value={date}
                maxDate={DateTime.now().toJSDate()}
                leftSection={
                  date ? (
                    <Button variant="subtle" p={0} color="dark" onClick={setPrevDate}>
                      <IconCaretLeft />
                    </Button>
                  ) : undefined
                }
                rightSection={
                  date && !DateTime.fromISO(date).hasSame(DateTime.now(), 'day') ? (
                    <Button variant="subtle" p={0} color="dark" onClick={setNextDate}>
                      <IconCaretRight />
                    </Button>
                  ) : undefined
                }
                onChange={setDate}
              />
              <Button variant="filled" color="green" type="submit" disabled={isSubmitting}>
                <Box className="d-flex align-items-center gap-2">
                  <IconDeviceFloppy />
                  <span>{t('actions.save')}</span>
                </Box>
              </Button>
            </div>
          </div>
          {!isLoading &&
            initialState &&
            Object.entries(initialState).map(([currencyCode, rate]) => (
              <div key={currencyCode} className="row mb-2">
                <div className="col-12">
                  <NumberInput
                    key={key(currencyCode)}
                    {...getInputProps(currencyCode)}
                    defaultValue={rate}
                    thousandSeparator
                    decimalScale={6}
                    valueIsNumericString
                    leftSection={<span className="mx-2">{currencyCode}</span>}
                    leftSectionWidth={50}
                    allowNegative={false}
                    hideControls
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}
        </form>
      </Layout>
    </>
  );
}

