import { Anchor, Badge, NumberInput, Paper, SegmentedControl, Select, Stack, Table, Text, Textarea, Title, } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { CreditRulesDto, PaymentMethodForm } from '../../model/payment-methods';
import { ApiService } from '../../services/api/api.service';
import { toCreditRulesDto } from '../../utils/credit-rules.utils';
import { formatIsoDate } from '../../utils/datetime.utils';
import RRuleGenerator from '../RRuleGenerator/RRuleGenerator';

const PREVIEW_DEBOUNCE_MS = 400;
const ROLLS = ['none', 'following', 'preceding'] as const;
const DIRECTIONS = ['onOrAfter', 'onOrBefore', 'nearest'] as const;
const UNITS = ['calendarDays', 'businessDays'] as const;

interface CreditRulesFieldsProps {
  form: UseFormReturnType<PaymentMethodForm>;
  disabled: boolean;
}

export default function CreditRulesFields({ form, disabled }: CreditRulesFieldsProps) {
  const { t, i18n } = useTranslation();
  const values = form.getValues();
  const closingRule = values.creditClosingDateRule;
  const dueRule = values.creditDueDateRule;

  const { data: holidayCalendars } = useQuery({
    queryKey: ['holidayCalendars'],
    queryFn: () => ApiService.getUserHolidayCalendars(),
  });

  const [debouncedRules] = useDebouncedValue(JSON.stringify(toCreditRulesDto(values)), PREVIEW_DEBOUNCE_MS);
  const { data: preview, isError: isPreviewError } = useQuery({
    queryKey: ['creditCyclesPreview', debouncedRules],
    queryFn: () => ApiService.previewCreditCycles(JSON.parse(debouncedRules) as CreditRulesDto),
    retry: false,
  });

  const rollOptions = ROLLS.map((roll) => ({ value: roll, label: t(`paymentMethods.rules.rolls.${roll}`) }));
  const weekdayOptions = Info.weekdays('long', { locale: i18n.language }).map((label, index) => ({
    value: String(index + 1),
    label,
  }));

  return (
    <Stack gap="md">
      <Select
        clearable
        {...form.getInputProps('holidayCalendar')}
        label={t('paymentMethods.rules.holidayCalendar')}
        description={
          <Anchor component={Link} to="/holiday-calendars" size="xs">
            {t('paymentMethods.rules.manageHolidayCalendars')}
          </Anchor>
        }
        placeholder={t('paymentMethods.rules.noHolidayCalendar')}
        disabled={disabled}
        data={holidayCalendars?.map((calendar) => ({ value: calendar.uuid, label: calendar.name })) ?? []}
      />

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={5}>{t('paymentMethods.rules.closing.title')}</Title>
          <SegmentedControl
            {...form.getInputProps('creditClosingDateRule.kind')}
            disabled={disabled}
            data={[
              { value: 'weekdayFromAnchor', label: t('paymentMethods.rules.closing.kinds.weekdayFromAnchor') },
              { value: 'rrule', label: t('paymentMethods.rules.closing.kinds.rrule') },
            ]}
          />
          {closingRule.kind === 'weekdayFromAnchor' ? (
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Select
                  {...form.getInputProps('creditClosingDateRule.weekday')}
                  label={t('paymentMethods.rules.closing.weekday')}
                  allowDeselect={false}
                  disabled={disabled}
                  data={weekdayOptions}
                />
              </div>
              <div className="col-12 col-md-4">
                <Select
                  {...form.getInputProps('creditClosingDateRule.direction')}
                  label={t('paymentMethods.rules.closing.direction')}
                  allowDeselect={false}
                  disabled={disabled}
                  data={DIRECTIONS.map((direction) => ({
                    value: direction,
                    label: t(`paymentMethods.rules.closing.directions.${direction}`),
                  }))}
                />
              </div>
              <div className="col-12 col-md-4">
                <NumberInput
                  {...form.getInputProps('creditClosingDateRule.anchorDay')}
                  label={t('paymentMethods.rules.closing.anchorDay')}
                  description={t('paymentMethods.rules.closing.anchorDayHint')}
                  inputWrapperOrder={['label', 'input', 'description', 'error']}
                  min={1}
                  max={31}
                  allowDecimal={false}
                  disabled={disabled}
                />
              </div>
            </div>
          ) : (
            <>
              <Textarea
                {...form.getInputProps('creditClosingDateRule.rrule')}
                label={t('paymentMethods.rules.rrule')}
                required
                maxRows={2}
                disabled={disabled}
              />
              <RRuleGenerator />
            </>
          )}
          <Select
            {...form.getInputProps('creditClosingDateRule.roll')}
            label={t('paymentMethods.rules.roll')}
            description={t('paymentMethods.rules.rollHint')}
            allowDeselect={false}
            disabled={disabled}
            data={rollOptions}
          />
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={5}>{t('paymentMethods.rules.due.title')}</Title>
          <SegmentedControl
            {...form.getInputProps('creditDueDateRule.kind')}
            disabled={disabled}
            data={[
              { value: 'offset', label: t('paymentMethods.rules.due.kinds.offset') },
              { value: 'rrule', label: t('paymentMethods.rules.due.kinds.rrule') },
            ]}
          />
          {dueRule.kind === 'offset' ? (
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <NumberInput
                  {...form.getInputProps('creditDueDateRule.amount')}
                  label={t('paymentMethods.rules.due.amount')}
                  min={1}
                  max={120}
                  allowDecimal={false}
                  disabled={disabled}
                />
              </div>
              <div className="col-12 col-md-4">
                <Select
                  {...form.getInputProps('creditDueDateRule.unit')}
                  label={t('paymentMethods.rules.due.unit')}
                  allowDeselect={false}
                  disabled={disabled}
                  data={UNITS.map((unit) => ({ value: unit, label: t(`paymentMethods.rules.due.units.${unit}`) }))}
                />
              </div>
              {dueRule.unit === 'calendarDays' && (
                <div className="col-12 col-md-4">
                  <Select
                    {...form.getInputProps('creditDueDateRule.roll')}
                    label={t('paymentMethods.rules.roll')}
                    allowDeselect={false}
                    disabled={disabled}
                    data={rollOptions}
                  />
                </div>
              )}
            </div>
          ) : (
            <Textarea
              {...form.getInputProps('creditDueDateRule.rrule')}
              label={t('paymentMethods.rules.rrule')}
              description={t('paymentMethods.rules.due.rruleHint')}
              required
              maxRows={2}
              disabled={disabled}
            />
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={5}>{t('paymentMethods.rules.preview.title')}</Title>
          {isPreviewError ? (
            <Text c="dimmed" size="sm">
              {t('paymentMethods.rules.preview.invalid')}
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('paymentMethods.rules.preview.closing')}</Table.Th>
                  <Table.Th>{t('paymentMethods.rules.preview.due')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {preview?.map((cycle) => (
                  <Table.Tr key={cycle.closingDate}>
                    <Table.Td>{formatIsoDate(cycle.closingDate, i18n.language)}</Table.Td>
                    <Table.Td>
                      {cycle.dueDate ? (
                        formatIsoDate(cycle.dueDate, i18n.language)
                      ) : (
                        <Badge color="gray" variant="light">
                          {t('paymentMethods.rules.preview.noDue')}
                        </Badge>
                      )}
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
