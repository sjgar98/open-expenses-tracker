import { Anchor, Badge, NumberInput, Paper, SegmentedControl, Select, Stack, Table, Text, Textarea, Title, } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { CreditRulesDto, PaymentMethodForm } from '../../model/payment-methods';
import { ApiService } from '../../services/api/api.service';
import { toCreditRulesDto, usesRoll } from '../../utils/credit-rules.utils';
import { formatIsoDate } from '../../utils/datetime.utils';
import RRuleGenerator from '../RRuleGenerator/RRuleGenerator';

const PREVIEW_DEBOUNCE_MS = 400;
const ROLLS = ['none', 'following', 'preceding'] as const;
const DIRECTIONS = ['onOrAfter', 'onOrBefore', 'nearest'] as const;
const UNITS = ['calendarDays', 'businessDays'] as const;
const MAX_OFFSET_AMOUNT = 120;

interface CreditRulesFieldsProps {
  form: UseFormReturnType<PaymentMethodForm>;
  disabled: boolean;
}

interface RuleFieldsProps extends CreditRulesFieldsProps {
  path: 'creditClosingDateRule' | 'creditDueDateRule';
}

function RollSelect({ form, path, disabled }: RuleFieldsProps) {
  const { t } = useTranslation();
  return (
    <Select
      {...form.getInputProps(`${path}.roll`)}
      label={t('paymentMethods.rules.roll')}
      withAsterisk
      description={t('paymentMethods.rules.rollHint')}
      allowDeselect={false}
      disabled={disabled}
      data={ROLLS.map((roll) => ({ value: roll, label: t(`paymentMethods.rules.rolls.${roll}`) }))}
    />
  );
}

function WeekdayFromAnchorFields({ form, path, disabled }: RuleFieldsProps) {
  const { t, i18n } = useTranslation();
  const weekdayOptions = Info.weekdays('long', { locale: i18n.language }).map((label, index) => ({
    value: String(index + 1),
    label,
  }));
  return (
    <div className="row g-3">
      <div className="col-12 col-md-4">
        <Select
          {...form.getInputProps(`${path}.weekday`)}
          label={t('paymentMethods.rules.weekday')}
          withAsterisk
          allowDeselect={false}
          disabled={disabled}
          data={weekdayOptions}
        />
      </div>
      <div className="col-12 col-md-4">
        <Select
          {...form.getInputProps(`${path}.direction`)}
          label={t('paymentMethods.rules.direction')}
          withAsterisk
          allowDeselect={false}
          disabled={disabled}
          data={DIRECTIONS.map((direction) => ({
            value: direction,
            label: t(`paymentMethods.rules.directions.${direction}`),
          }))}
        />
      </div>
      <div className="col-12 col-md-4">
        <NumberInput
          {...form.getInputProps(`${path}.anchorDay`)}
          label={t('paymentMethods.rules.anchorDay')}
          withAsterisk
          description={t('paymentMethods.rules.anchorDayHint')}
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          min={1}
          max={31}
          allowDecimal={false}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function OffsetFields({ form, path, disabled }: RuleFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        <NumberInput
          {...form.getInputProps(`${path}.amount`)}
          label={t('paymentMethods.rules.amount')}
          withAsterisk
          min={1}
          max={MAX_OFFSET_AMOUNT}
          allowDecimal={false}
          disabled={disabled}
        />
      </div>
      <div className="col-12 col-md-6">
        <Select
          {...form.getInputProps(`${path}.unit`)}
          label={t('paymentMethods.rules.unit')}
          withAsterisk
          allowDeselect={false}
          disabled={disabled}
          data={UNITS.map((unit) => ({ value: unit, label: t(`paymentMethods.rules.units.${unit}`) }))}
        />
      </div>
    </div>
  );
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
  const previewRules = JSON.parse(debouncedRules) as CreditRulesDto | null;
  const { data: preview, isError: isPreviewError } = useQuery({
    queryKey: ['creditCyclesPreview', debouncedRules],
    queryFn: () => ApiService.previewCreditCycles(previewRules!),
    enabled: previewRules !== null,
    retry: false,
  });

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
              {
                value: 'offset',
                label: t('paymentMethods.rules.closing.kinds.offset'),
                disabled: dueRule.kind === 'offset',
              },
              { value: 'rrule', label: t('paymentMethods.rules.closing.kinds.rrule') },
            ]}
          />
          {closingRule.kind === 'weekdayFromAnchor' && (
            <WeekdayFromAnchorFields form={form} path="creditClosingDateRule" disabled={disabled} />
          )}
          {closingRule.kind === 'offset' && (
            <OffsetFields form={form} path="creditClosingDateRule" disabled={disabled} />
          )}
          {closingRule.kind === 'rrule' && (
            <>
              <Textarea
                {...form.getInputProps('creditClosingDateRule.rrule')}
                label={t('paymentMethods.rules.rrule')}
                withAsterisk
                maxRows={2}
                disabled={disabled}
              />
              <RRuleGenerator />
            </>
          )}
          {usesRoll(closingRule) && (
            <RollSelect form={form} path="creditClosingDateRule" disabled={disabled} />
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={5}>{t('paymentMethods.rules.due.title')}</Title>
          <SegmentedControl
            {...form.getInputProps('creditDueDateRule.kind')}
            disabled={disabled}
            data={[
              { value: 'weekdayFromAnchor', label: t('paymentMethods.rules.due.kinds.weekdayFromAnchor') },
              {
                value: 'offset',
                label: t('paymentMethods.rules.due.kinds.offset'),
                disabled: closingRule.kind === 'offset',
              },
              { value: 'rrule', label: t('paymentMethods.rules.due.kinds.rrule') },
            ]}
          />
          {dueRule.kind === 'offset' && <OffsetFields form={form} path="creditDueDateRule" disabled={disabled} />}
          {dueRule.kind === 'weekdayFromAnchor' && (
            <WeekdayFromAnchorFields form={form} path="creditDueDateRule" disabled={disabled} />
          )}
          {dueRule.kind === 'rrule' && (
            <Textarea
              {...form.getInputProps('creditDueDateRule.rrule')}
              label={t('paymentMethods.rules.rrule')}
              withAsterisk
              maxRows={2}
              disabled={disabled}
            />
          )}
          {usesRoll(dueRule) && <RollSelect form={form} path="creditDueDateRule" disabled={disabled} />}
          {dueRule.kind !== 'offset' && (
            <Text c="dimmed" size="xs">
              {t('paymentMethods.rules.due.independentHint')}
            </Text>
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Title order={5}>{t('paymentMethods.rules.preview.title')}</Title>
          {isPreviewError || !previewRules ? (
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
