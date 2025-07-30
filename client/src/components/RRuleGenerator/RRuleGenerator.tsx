import { useState } from 'react';
import { RRule, Frequency, type Options as RRuleOptions } from 'rrule';
import { DateTime } from 'luxon';
import timezones from 'timezones-list';
import { useTranslation } from 'react-i18next';
import { Accordion, Box, Button, CopyButton, MultiSelect, NumberInput, Paper, Select, Text, TextInput, Title, Tooltip, } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { DateTimePicker } from '@mantine/dates';

interface RRuleDto {
  freq: string;
  dtstart?: string;
  tzid?: string;
  until?: string;
  count?: string | number;
  interval: string | number;
  wkst: string;
  byweekday?: string[];
  bymonth?: string[];
  bysetpos?: string;
  bymonthday?: string;
  byyearday?: string;
  byweekno?: string;
  byhour?: string;
  byminute?: string;
  bysecond?: string;
}

const POSITIVE_INTEGER_REGEX = /^[0-9]+$/;
const NUMBER_LIST_REGEX = /^(-?[0-9]+,)*-?[0-9]+$/;

export default function RRuleGenerator() {
  const { t } = useTranslation();
  const [rrule, setRRule] = useState<RRule | null>(null);
  const [rruleForm, setRRuleForm] = useState<RRuleDto>({
    freq: String(rrule?.options.freq ?? RRule.DAILY),
    interval: rrule?.options.interval ?? 1,
    wkst: String(rrule?.options.wkst ?? 0),
  });

  function handleChange(control: keyof RRuleDto): (event: any) => void {
    return (event: any) => {
      if (event !== null && event !== undefined) {
        switch (event.constructor) {
          case DateTime: {
            onValueChange(control, event, true);
            break;
          }
          case PointerEvent: {
            onValueChange(control, event.target.value);
            break;
          }
          case Number:
          case String:
            onValueChange(control, event);
            break;
          default: {
            if (Array.isArray(event)) {
              onValueChange(control, event);
            } else {
              onValueChange(control, event.value ?? event.target.value);
            }
          }
        }
      } else {
        onValueChange(control, event);
      }
    };
  }

  function onValueChange(control: string, value: any, skipOnChange: boolean = false) {
    const newFormState = { ...rruleForm, [control]: value };
    setRRuleForm(newFormState);
    if (!skipOnChange) {
      updateRRuleFromForm(newFormState);
    }
  }

  function parsePositiveInteger(value: number | string | undefined, required: boolean = false): number | undefined {
    if (!value || String(value).trim() === '') {
      if (required) {
        throw 'Required field';
      } else {
        return undefined;
      }
    }
    if (POSITIVE_INTEGER_REGEX.test(String(value))) {
      return Number(value);
    } else {
      throw '';
    }
  }

  function parseNumberArray(value: string | undefined): number[] {
    if (!value || value.trim() === '') {
      return [];
    }
    if (NUMBER_LIST_REGEX.test(value ?? '')) {
      return value!.split(',').map((num) => Number(num));
    } else {
      throw '';
    }
  }

  function updateRRuleFromForm(newFormState: RRuleDto) {
    try {
      if (
        newFormState.interval === undefined ||
        newFormState.interval === null ||
        String(newFormState.interval).trim() === ''
      ) {
        throw '';
      }
      const newRRuleOptions: Partial<RRuleOptions> = {
        ...newFormState,
        dtstart: newFormState.dtstart
          ? DateTime.fromFormat(newFormState.dtstart, 'yyyy-MM-dd HH:mm:ss').toJSDate()
          : undefined,
        until: newFormState.until
          ? DateTime.fromFormat(newFormState.until, 'yyyy-MM-dd HH:mm:ss').toJSDate()
          : undefined,
        wkst: parsePositiveInteger(newFormState.wkst, true),
        byweekday: parseNumberArray(newFormState.byweekday?.join(',')),
        bymonth: parseNumberArray(newFormState.bymonth?.join(',')),
        freq: parsePositiveInteger(newFormState.freq) as Frequency,
        count: parsePositiveInteger(newFormState.count),
        interval: parsePositiveInteger(newFormState.interval),
        bysetpos: parseNumberArray(newFormState.bysetpos),
        bymonthday: parseNumberArray(newFormState.bymonthday),
        byyearday: parseNumberArray(newFormState.byyearday),
        byweekno: parseNumberArray(newFormState.byweekno),
        byhour: parseNumberArray(newFormState.byhour),
        byminute: parseNumberArray(newFormState.byminute),
        bysecond: parseNumberArray(newFormState.bysecond),
      };
      const newRRule = new RRule(newRRuleOptions);
      setRRule(newRRule);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Accordion>
      <Accordion.Item value="rrule-generator">
        <Accordion.Control bg="dark">
          <Text>{t('rrule.title')}</Text>
        </Accordion.Control>
        <Accordion.Panel color="red" bg="dark">
          {rrule && (
            <div className="container">
              <div className="row mb-4">
                <div className="col-12">
                  <Paper className="d-flex align-items-center p-3">
                    <Box className="flex-grow-1" style={{ wordBreak: 'break-all' }}>
                      {rrule?.toString() ?? ''}
                    </Box>
                    <Tooltip label="Copy to clipboard">
                      <CopyButton value={rrule.toString()}>
                        {({ copied, copy }) => (
                          <Button color={copied ? 'green' : 'blue'} onClick={copy} style={{ minWidth: '30px' }}>
                            <IconCopy size={20} />
                          </Button>
                        )}
                      </CopyButton>
                    </Tooltip>
                  </Paper>
                </div>
              </div>
              <div className="row my-4">
                <div className="col-12">
                  <Title order={4}>
                    {t('rrule.currentRule')}: {rrule?.toText() ?? ''}
                  </Title>
                </div>
              </div>
            </div>
          )}
          <Box className="container">
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <Select
                  label={t('rrule.controls.freq')}
                  onChange={handleChange('freq')}
                  value={String(rruleForm.freq)}
                  data={[
                    { value: String(RRule.DAILY), label: t('rrule.frequency.daily') },
                    { value: String(RRule.WEEKLY), label: t('rrule.frequency.weekly') },
                    { value: String(RRule.MONTHLY), label: t('rrule.frequency.monthly') },
                    { value: String(RRule.YEARLY), label: t('rrule.frequency.yearly') },
                  ]}
                  allowDeselect={false}
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <Select
                  label={t('rrule.controls.tzid')}
                  onChange={handleChange('tzid')}
                  value={rruleForm.tzid ?? ''}
                  data={timezones.map((tz) => ({
                    value: tz.tzCode,
                    label: tz.label,
                  }))}
                  clearable
                  searchable
                />
              </div>
            </div>
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <DateTimePicker
                  label={t('rrule.controls.dtstart')}
                  value={rruleForm.dtstart ?? undefined}
                  onChange={handleChange('dtstart')}
                  valueFormat="YYYY-MM-DD HH:mm"
                  highlightToday
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <DateTimePicker
                  label={t('rrule.controls.until')}
                  value={rruleForm.until ?? undefined}
                  onChange={handleChange('until')}
                  valueFormat="YYYY-MM-DD HH:mm"
                  highlightToday
                />
              </div>
            </div>
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <NumberInput
                  defaultValue={rruleForm.count ?? ''}
                  label={t('rrule.controls.count')}
                  onChange={handleChange('count')}
                  thousandSeparator
                  allowDecimal={false}
                  allowNegative={false}
                  min={0}
                  step={1}
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <NumberInput
                  defaultValue={rruleForm.interval ?? ''}
                  label={t('rrule.controls.interval')}
                  onChange={handleChange('interval')}
                  thousandSeparator
                  allowDecimal={false}
                  allowNegative={false}
                  min={1}
                  step={1}
                  required
                />
              </div>
            </div>
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <Select
                  label={t('rrule.controls.wkst')}
                  onChange={handleChange('wkst')}
                  value={String(rruleForm.wkst ?? '')}
                  data={[
                    { value: '0', label: t('rrule.weekday.monday') },
                    { value: '1', label: t('rrule.weekday.tuesday') },
                    { value: '2', label: t('rrule.weekday.wednesday') },
                    { value: '3', label: t('rrule.weekday.thursday') },
                    { value: '4', label: t('rrule.weekday.friday') },
                    { value: '5', label: t('rrule.weekday.saturday') },
                    { value: '6', label: t('rrule.weekday.sunday') },
                  ]}
                  allowDeselect={false}
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <MultiSelect
                  label={t('rrule.controls.byweekday')}
                  onChange={handleChange('byweekday')}
                  value={rruleForm.byweekday}
                  data={[
                    { value: '0', label: t('rrule.weekday.monday') },
                    { value: '1', label: t('rrule.weekday.tuesday') },
                    { value: '2', label: t('rrule.weekday.wednesday') },
                    { value: '3', label: t('rrule.weekday.thursday') },
                    { value: '4', label: t('rrule.weekday.friday') },
                    { value: '5', label: t('rrule.weekday.saturday') },
                    { value: '6', label: t('rrule.weekday.sunday') },
                  ]}
                />
              </div>
            </div>
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <MultiSelect
                  label={t('rrule.controls.bymonth')}
                  onChange={handleChange('bymonth')}
                  value={rruleForm.bymonth}
                  data={[
                    { value: '1', label: t('rrule.month.january') },
                    { value: '2', label: t('rrule.month.february') },
                    { value: '3', label: t('rrule.month.march') },
                    { value: '4', label: t('rrule.month.april') },
                    { value: '5', label: t('rrule.month.may') },
                    { value: '6', label: t('rrule.month.june') },
                    { value: '7', label: t('rrule.month.july') },
                    { value: '8', label: t('rrule.month.august') },
                    { value: '9', label: t('rrule.month.september') },
                    { value: '10', label: t('rrule.month.october') },
                    { value: '11', label: t('rrule.month.november') },
                    { value: '12', label: t('rrule.month.december') },
                  ]}
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <TextInput
                  defaultValue={rruleForm.bysetpos ?? ''}
                  label={t('rrule.controls.bysetpos')}
                  onChange={handleChange('bysetpos')}
                />
              </div>
            </div>
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <TextInput
                  defaultValue={rruleForm.bymonthday ?? ''}
                  label={t('rrule.controls.bymonthday')}
                  onChange={handleChange('bymonthday')}
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <TextInput
                  defaultValue={rruleForm.byyearday ?? ''}
                  label={t('rrule.controls.byyearday')}
                  onChange={handleChange('byyearday')}
                />
              </div>
            </div>
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <TextInput
                  defaultValue={rruleForm.byweekno ?? ''}
                  label={t('rrule.controls.byweekno')}
                  onChange={handleChange('byweekno')}
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <TextInput
                  defaultValue={rruleForm.byhour ?? ''}
                  label={t('rrule.controls.byhour')}
                  onChange={handleChange('byhour')}
                />
              </div>
            </div>
            <div className="row mb-0 mb-md-4">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <TextInput
                  defaultValue={rruleForm.byminute ?? ''}
                  label={t('rrule.controls.byminute')}
                  onChange={handleChange('byminute')}
                />
              </div>
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <TextInput
                  defaultValue={rruleForm.bysecond ?? ''}
                  label={t('rrule.controls.bysecond')}
                  onChange={handleChange('bysecond')}
                />
              </div>
            </div>
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

