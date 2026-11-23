import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Button, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';
import Layout from '../../../components/Layout/Layout';
import HolidayCalendarFields from '../../../components/HolidayCalendarFields/HolidayCalendarFields';
import type { HolidayCalendarForm } from '../../../model/holiday-calendars';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import { EMPTY_HOLIDAY_CALENDAR_FORM, toHolidayCalendarDto } from '../../../utils/holiday-calendar.utils';

export default function NewHolidayCalendar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const form = useForm<HolidayCalendarForm>({ mode: 'controlled', initialValues: EMPTY_HOLIDAY_CALENDAR_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(data: HolidayCalendarForm) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.saveNewHolidayCalendar(toHolidayCalendarDto(data))
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['holidayCalendars'] });
          navigate('..');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  return (
    <Layout>
      <div className="container pt-3">
        <div className="row">
          <div className="col">
            <div className="d-flex justify-content-start gap-3 pb-3">
              <Button variant="subtle" color="blue" className="px-2" onClick={() => navigate('..')} disabled={isSubmitting}>
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
              {t('holidayCalendars.new.title')}
            </Title>
          </div>
        </div>
      </div>
      <div className="container py-3">
        <div className="row">
          <div className="col">
            <form className="d-flex flex-column gap-3 my-3" onSubmit={form.onSubmit(handleSubmit)}>
              <HolidayCalendarFields form={form} disabled={isSubmitting} />
              <div className="d-flex justify-content-end gap-3 mt-5">
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
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
