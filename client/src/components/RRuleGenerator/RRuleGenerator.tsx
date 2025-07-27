import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Tooltip, Typography, } from '@mui/material';
import { useState } from 'react';
import { RRule, Frequency, type WeekdayStr } from 'rrule';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DateTime } from 'luxon';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import timezones from 'timezones-list';
import { useTranslation } from 'react-i18next';

interface RRuleDto {
  freq: Frequency;
  dtstart?: DateTime;
  tzid?: string;
  until?: DateTime;
  count?: string;
  interval: string;
  wkst: number;
  byweekday?: WeekdayStr[];
  bymonth?: number[];
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
    freq: rrule?.options.freq ?? RRule.DAILY,
    interval: String(rrule?.options.interval ?? 1),
    wkst: rrule?.options.wkst ?? 0,
  });
  const [isCopying, setIsCopying] = useState(false);

  function handleChange(control: keyof RRuleDto): (event: any) => void {
    return (event: any) => {
      if (event) {
        switch (event.constructor) {
          case DateTime: {
            onValueChange(control, event, true);
            break;
          }
          case PointerEvent: {
            onValueChange(control, event.target.value);
            break;
          }
          default: {
            onValueChange(control, event.value ?? event.target.value);
          }
        }
      }
    };
  }

  function handleDateTimePickerAccept(control: keyof RRuleDto): (value: DateTime | null) => void {
    return (value: DateTime | null) => {
      handleChange(control)({ target: { value } });
    };
  }

  function onValueChange(control: string, value: any, skipOnChange: boolean = false) {
    const newFormState = { ...rruleForm, [control]: value };
    setRRuleForm(newFormState);
    if (!skipOnChange) {
      updateRRuleFromForm(newFormState);
    }
  }

  function parsePositiveInteger(value: string | undefined, required: boolean = false): number | undefined {
    if (!value || value.trim() === '') {
      if (required) {
        throw 'Required field';
      } else {
        return undefined;
      }
    }
    if (POSITIVE_INTEGER_REGEX.test(value)) {
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
        newFormState.interval.trim() === ''
      ) {
        throw '';
      }
      const newRRule = new RRule({
        ...newFormState,
        dtstart: newFormState.dtstart?.toJSDate(),
        until: newFormState.until?.toJSDate(),
        count: parsePositiveInteger(newFormState.count),
        interval: parsePositiveInteger(newFormState.interval),
        bysetpos: parseNumberArray(newFormState.bysetpos),
        bymonthday: parseNumberArray(newFormState.bymonthday),
        byyearday: parseNumberArray(newFormState.byyearday),
        byweekno: parseNumberArray(newFormState.byweekno),
        byhour: parseNumberArray(newFormState.byhour),
        byminute: parseNumberArray(newFormState.byminute),
        bysecond: parseNumberArray(newFormState.bysecond),
      });
      setRRule(newRRule);
    } catch (e) {}
  }

  function handleCopy() {
    if (rrule) {
      setIsCopying(true);
      navigator.clipboard
        .writeText(rrule.toString())
        .then(() => {
          setIsCopying(false);
        })
        .catch(() => {
          setIsCopying(false);
        });
    }
  }

  return (
    <>
      <Paper elevation={1} className="container">
        {rrule && (
          <>
            <div className="row mb-4">
              <div className="col-12">
                <Paper elevation={2} sx={{ padding: 2 }} className="d-flex align-items-center">
                  <Box className="flex-grow-1" sx={{ wordBreak: 'break-all' }}>
                    {rrule?.toString() ?? ''}
                  </Box>
                  <Tooltip title="Copy to clipboard">
                    <Button onClick={handleCopy} sx={{ minWidth: '30px' }} disabled={!rrule || isCopying}>
                      <ContentCopyIcon sx={{ height: '20px' }} />
                    </Button>
                  </Tooltip>
                </Paper>
              </div>
            </div>
            <div className="row my-4">
              <div className="col-12">
                <Typography>
                  {t('rrule.currentRule')}: {rrule?.toText() ?? ''}
                </Typography>
              </div>
            </div>
          </>
        )}
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <FormControl fullWidth>
              <InputLabel>{t('rrule.controls.freq')}</InputLabel>
              <Select value={rruleForm.freq ?? ''} label={t('rrule.controls.freq')} onChange={handleChange('freq')}>
                <MenuItem value={RRule.DAILY}>{t('rrule.frequency.daily')}</MenuItem>
                <MenuItem value={RRule.WEEKLY}>{t('rrule.frequency.weekly')}</MenuItem>
                <MenuItem value={RRule.MONTHLY}>{t('rrule.frequency.monthly')}</MenuItem>
                <MenuItem value={RRule.YEARLY}>{t('rrule.frequency.yearly')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <FormControl fullWidth>
              <InputLabel>{t('rrule.controls.tzid')}</InputLabel>
              <Select value={rruleForm.tzid ?? ''} label={t('rrule.controls.tzid')} onChange={handleChange('tzid')}>
                <MenuItem value={''}>None (UTC)</MenuItem>
                {timezones.map((tz) => (
                  <MenuItem value={tz.tzCode}>{tz.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <FormControl fullWidth>
              <DateTimePicker
                label={t('rrule.controls.dtstart')}
                value={rruleForm.dtstart ?? null}
                onChange={handleChange('dtstart')}
                onAccept={handleDateTimePickerAccept('dtstart')}
                closeOnSelect={true}
                slotProps={{
                  actionBar: {
                    actions: ['clear', 'accept'],
                  },
                }}
              />
            </FormControl>
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <FormControl fullWidth>
              <DateTimePicker
                label={t('rrule.controls.until')}
                value={rruleForm.until ?? null}
                onChange={handleChange('until')}
                onAccept={handleDateTimePickerAccept('until')}
                closeOnSelect={true}
                slotProps={{
                  actionBar: {
                    actions: ['clear', 'accept'],
                  },
                }}
              />
            </FormControl>
          </div>
        </div>
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              defaultValue={rruleForm.count ?? ''}
              label={t('rrule.controls.count')}
              onChange={handleChange('count')}
            />
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              required
              defaultValue={rruleForm.interval ?? ''}
              label={t('rrule.controls.interval')}
              onChange={handleChange('interval')}
            />
          </div>
        </div>
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <FormControl fullWidth>
              <InputLabel>{t('rrule.controls.wkst')}</InputLabel>
              <Select value={rruleForm.wkst ?? ''} label={t('rrule.controls.wkst')} onChange={handleChange('wkst')}>
                <MenuItem value={0}>{t('rrule.weekday.monday')}</MenuItem>
                <MenuItem value={1}>{t('rrule.weekday.tuesday')}</MenuItem>
                <MenuItem value={2}>{t('rrule.weekday.wednesday')}</MenuItem>
                <MenuItem value={3}>{t('rrule.weekday.thursday')}</MenuItem>
                <MenuItem value={4}>{t('rrule.weekday.friday')}</MenuItem>
                <MenuItem value={5}>{t('rrule.weekday.saturday')}</MenuItem>
                <MenuItem value={6}>{t('rrule.weekday.sunday')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <FormControl fullWidth>
              <InputLabel>{t('rrule.controls.byweekday')}</InputLabel>
              <Select
                multiple
                value={rruleForm.byweekday ?? []}
                label={t('rrule.controls.byweekday')}
                onChange={handleChange('byweekday')}
              >
                <MenuItem value={0}>{t('rrule.weekday.monday')}</MenuItem>
                <MenuItem value={1}>{t('rrule.weekday.tuesday')}</MenuItem>
                <MenuItem value={2}>{t('rrule.weekday.wednesday')}</MenuItem>
                <MenuItem value={3}>{t('rrule.weekday.thursday')}</MenuItem>
                <MenuItem value={4}>{t('rrule.weekday.friday')}</MenuItem>
                <MenuItem value={5}>{t('rrule.weekday.saturday')}</MenuItem>
                <MenuItem value={6}>{t('rrule.weekday.sunday')}</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <FormControl fullWidth>
              <InputLabel>{t('rrule.controls.bymonth')}</InputLabel>
              <Select
                multiple
                value={rruleForm.bymonth ?? []}
                label={t('rrule.controls.bymonth')}
                onChange={handleChange('bymonth')}
              >
                <MenuItem value={1}>{t('rrule.month.january')}</MenuItem>
                <MenuItem value={2}>{t('rrule.month.february')}</MenuItem>
                <MenuItem value={3}>{t('rrule.month.march')}</MenuItem>
                <MenuItem value={4}>{t('rrule.month.april')}</MenuItem>
                <MenuItem value={5}>{t('rrule.month.may')}</MenuItem>
                <MenuItem value={6}>{t('rrule.month.june')}</MenuItem>
                <MenuItem value={7}>{t('rrule.month.july')}</MenuItem>
                <MenuItem value={8}>{t('rrule.month.august')}</MenuItem>
                <MenuItem value={9}>{t('rrule.month.september')}</MenuItem>
                <MenuItem value={10}>{t('rrule.month.october')}</MenuItem>
                <MenuItem value={11}>{t('rrule.month.november')}</MenuItem>
                <MenuItem value={12}>{t('rrule.month.december')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              defaultValue={rruleForm.bysetpos ?? ''}
              label={t('rrule.controls.bysetpos')}
              onChange={handleChange('bysetpos')}
            />
          </div>
        </div>
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              defaultValue={rruleForm.bymonthday ?? ''}
              label={t('rrule.controls.bymonthday')}
              onChange={handleChange('bymonthday')}
            />
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              defaultValue={rruleForm.byyearday ?? ''}
              label={t('rrule.controls.byyearday')}
              onChange={handleChange('byyearday')}
            />
          </div>
        </div>
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              defaultValue={rruleForm.byweekno ?? ''}
              label={t('rrule.controls.byweekno')}
              onChange={handleChange('byweekno')}
            />
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              defaultValue={rruleForm.byhour ?? ''}
              label={t('rrule.controls.byhour')}
              onChange={handleChange('byhour')}
            />
          </div>
        </div>
        <div className="row mb-0 mb-md-4">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <TextField
              fullWidth
              defaultValue={rruleForm.byminute ?? ''}
              label={t('rrule.controls.byminute')}
              onChange={handleChange('byminute')}
            />
          </div>
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            {' '}
            <TextField
              fullWidth
              defaultValue={rruleForm.bysecond ?? ''}
              label={t('rrule.controls.bysecond')}
              onChange={handleChange('bysecond')}
            />
          </div>
        </div>
      </Paper>
    </>
  );
}

