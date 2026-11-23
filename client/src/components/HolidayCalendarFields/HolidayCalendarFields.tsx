import { ActionIcon, Button, FileButton, Group, Paper, Stack, Table, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import { IconFileImport, IconLink, IconPlus, IconTrash } from '@tabler/icons-react';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HolidayCalendarForm, HolidayDate } from '../../model/holiday-calendars';
import { ApiService } from '../../services/api/api.service';
import { parseError } from '../../utils/error-parser.utils';
import { mergeHolidayDates } from '../../utils/holiday-calendar.utils';

interface HolidayCalendarFieldsProps {
  form: UseFormReturnType<HolidayCalendarForm>;
  disabled: boolean;
}

export default function HolidayCalendarFields({ form, disabled }: HolidayCalendarFieldsProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [icsUrl, setIcsUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const dates = form.getValues().dates;
  const isBusy = disabled || isImporting;

  function runImport(load: Promise<HolidayDate[]>) {
    setIsImporting(true);
    load
      .then((imported) => {
        const merged = mergeHolidayDates(form.getValues().dates, imported);
        form.setFieldValue('dates', merged.dates);
        enqueueSnackbar(t('holidayCalendars.import.added', { count: merged.added }), { variant: 'success' });
      })
      .catch((error) => enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' }))
      .finally(() => setIsImporting(false));
  }

  function handleFile(file: File | null) {
    if (file) runImport(file.text().then((ics) => ApiService.parseIcs(ics)));
  }

  function handleUrl() {
    if (icsUrl.trim()) runImport(ApiService.fetchIcs(icsUrl.trim()));
  }

  return (
    <Stack gap="md">
      <TextInput
        key={form.key('name')}
        {...form.getInputProps('name')}
        label={t('holidayCalendars.controls.name')}
        required
        disabled={disabled}
      />

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={5}>{t('holidayCalendars.import.title')}</Title>
          <Text size="sm" c="dimmed">
            {t('holidayCalendars.import.description')}
          </Text>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-auto">
              <FileButton onChange={handleFile} accept=".ics,text/calendar" disabled={isBusy}>
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IconFileImport size={16} />} disabled={isBusy}>
                    {t('holidayCalendars.import.file')}
                  </Button>
                )}
              </FileButton>
            </div>
            <div className="col-12 col-md">
              <TextInput
                value={icsUrl}
                onChange={(event) => setIcsUrl(event.currentTarget.value)}
                label={t('holidayCalendars.import.url')}
                placeholder="https://"
                disabled={isBusy}
              />
            </div>
            <div className="col-12 col-md-auto">
              <Button
                variant="light"
                leftSection={<IconLink size={16} />}
                onClick={handleUrl}
                loading={isImporting}
                disabled={isBusy || !icsUrl.trim()}
              >
                {t('holidayCalendars.import.fetch')}
              </Button>
            </div>
          </div>
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={5}>{t('holidayCalendars.dates.title', { count: dates.length })}</Title>
            <Button
              variant="subtle"
              color="green"
              leftSection={<IconPlus size={16} />}
              onClick={() => form.insertListItem('dates', { date: null, label: '' })}
              disabled={isBusy}
            >
              {t('holidayCalendars.dates.add')}
            </Button>
          </Group>
          {dates.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('holidayCalendars.dates.empty')}
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('holidayCalendars.dates.date')}</Table.Th>
                  <Table.Th>{t('holidayCalendars.dates.label')}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {dates.map((_, index) => (
                  <Table.Tr key={form.key(`dates.${index}`)}>
                    <Table.Td>
                      <DateInput
                        {...form.getInputProps(`dates.${index}.date`)}
                        valueFormat="YYYY-MM-DD"
                        disabled={isBusy}
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput {...form.getInputProps(`dates.${index}.label`)} disabled={isBusy} />
                    </Table.Td>
                    <Table.Td>
                      <Group justify="right">
                        <Tooltip label={t('actions.delete')}>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => form.removeListItem('dates', index)}
                            disabled={isBusy}
                          >
                            <IconTrash />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
