import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, LoadingOverlay, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import Layout from '../../../components/Layout/Layout';
import HolidayCalendarFields from '../../../components/HolidayCalendarFields/HolidayCalendarFields';
import type { HolidayCalendarForm } from '../../../model/holiday-calendars';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import { EMPTY_HOLIDAY_CALENDAR_FORM, toHolidayCalendarDto, toHolidayCalendarForm, } from '../../../utils/holiday-calendar.utils';

export default function EditHolidayCalendar() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const form = useForm<HolidayCalendarForm>({ mode: 'controlled', initialValues: EMPTY_HOLIDAY_CALENDAR_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { error: calendarError, data: calendar } = useQuery({
    queryKey: ['holidayCalendar', uuid],
    queryFn: () => ApiService.getUserHolidayCalendarByUuid(uuid!),
  });

  const isLoading = !calendar;

  useLayoutEffect(() => {
    if (calendar) {
      form.setInitialValues(toHolidayCalendarForm(calendar));
      form.reset();
    }
  }, [calendar]);

  useEffect(() => {
    if (calendarError) {
      enqueueSnackbar(t(parseError(calendarError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [calendarError]);

  function runAndReturn(action: Promise<unknown>) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    action
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['holidayCalendars'] });
        queryClient.invalidateQueries({ queryKey: ['holidayCalendar', uuid] });
        queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
        navigate('..');
      })
      .catch((error) => {
        setIsSubmitting(false);
        enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
      });
  }

  return (
    <Layout>
      {!isLoading && (
        <>
          <div className="container pt-3">
            <div className="row">
              <div className="col">
                <div className="d-flex justify-content-start gap-3 pb-3">
                  <Button
                    variant="subtle"
                    color="blue"
                    className="px-2"
                    onClick={() => navigate('..')}
                    disabled={isSubmitting}
                  >
                    <Box className="d-flex align-items-center gap-2">
                      <IconArrowBack />
                      <span>{t('actions.return')}</span>
                    </Box>
                  </Button>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Title order={1} style={{ textAlign: 'center' }}>
                  {t('holidayCalendars.edit.title')}
                </Title>
              </div>
            </div>
          </div>
          <div className="container py-3">
            <div className="row">
              <div className="col">
                <form
                  className="d-flex flex-column gap-3 my-3"
                  onSubmit={form.onSubmit((data) =>
                    runAndReturn(ApiService.updateHolidayCalendar(uuid!, toHolidayCalendarDto(data)))
                  )}
                >
                  <HolidayCalendarFields form={form} disabled={isSubmitting} />
                  <div className="d-flex justify-content-between gap-3 mt-5">
                    {calendar?.isDeleted ? (
                      <Button
                        variant="subtle"
                        color="yellow"
                        className="px-2"
                        onClick={() => runAndReturn(ApiService.restoreHolidayCalendar(uuid!))}
                        disabled={isSubmitting}
                      >
                        <Tooltip label={t('actions.restore')} withArrow>
                          <IconRestore />
                        </Tooltip>
                      </Button>
                    ) : (
                      <Button
                        variant="subtle"
                        color="red"
                        className="px-2"
                        onClick={() => runAndReturn(ApiService.deleteHolidayCalendar(uuid!))}
                        disabled={isSubmitting}
                      >
                        <Tooltip label={t('actions.delete')} withArrow>
                          <IconTrash />
                        </Tooltip>
                      </Button>
                    )}
                    <div className="d-flex gap-3">
                      <Button variant="outline" color="blue" onClick={form.reset} disabled={isSubmitting}>
                        <Box className="d-flex align-items-center gap-2">
                          <IconRestore />
                          <span>{t('actions.reset')}</span>
                        </Box>
                      </Button>
                      <Button variant="filled" color="green" type="submit" disabled={isSubmitting}>
                        <Box className="d-flex align-items-center gap-2">
                          <IconDeviceFloppy />
                          <span>{t('actions.save')}</span>
                        </Box>
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}
