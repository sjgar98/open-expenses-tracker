import { ActionIcon, Badge, Button, Group, Paper, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Cycle, CycleSource } from '../../model/payment-methods';
import { ApiService } from '../../services/api/api.service';
import { formatIsoDate } from '../../utils/datetime.utils';
import { parseError } from '../../utils/error-parser.utils';

const VISIBLE_PAST_CYCLES = 3;
const VISIBLE_UPCOMING_CYCLES = 3;

interface StatementDatesProps {
  paymentMethodUuid: string;
}

function SourceBadge({ source }: { source: CycleSource }) {
  const { t } = useTranslation();
  return (
    <Badge size="xs" variant="light" color={source === 'manual' ? 'green' : 'gray'}>
      {t(`paymentMethods.statements.sources.${source}`)}
    </Badge>
  );
}

function visibleCycles(cycles: Cycle[]): Cycle[] {
  const today = DateTime.now().toISODate();
  const past = cycles.filter((cycle) => cycle.closingDate <= today).slice(-VISIBLE_PAST_CYCLES);
  const upcoming = cycles.filter((cycle) => cycle.closingDate > today).slice(0, VISIBLE_UPCOMING_CYCLES);
  return [...past, ...upcoming];
}

export default function StatementDates({ paymentMethodUuid }: StatementDatesProps) {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [closingDate, setClosingDate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = ['paymentMethodCycles', paymentMethodUuid];
  const { data: cycles } = useQuery({
    queryKey,
    queryFn: () => ApiService.getPaymentMethodCycles(paymentMethodUuid),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    queryClient.invalidateQueries({ queryKey: ['homeUpcomingDueDates'] });
  }

  function runMutation(mutation: Promise<void>, onSuccess?: () => void) {
    setIsSubmitting(true);
    mutation
      .then(() => {
        onSuccess?.();
        refresh();
      })
      .catch((error) => enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' }))
      .finally(() => setIsSubmitting(false));
  }

  function handleAdd() {
    if (!closingDate || isSubmitting) return;
    runMutation(ApiService.createCreditCycleOverride(paymentMethodUuid, { closingDate, dueDate }), () => {
      setClosingDate(null);
      setDueDate(null);
    });
  }

  function handleDelete(overrideUuid: string) {
    if (isSubmitting) return;
    runMutation(ApiService.deleteCreditCycleOverride(paymentMethodUuid, overrideUuid));
  }

  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <Title order={5}>{t('paymentMethods.statements.title')}</Title>
        <Text size="sm" c="dimmed">
          {t('paymentMethods.statements.description')}
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('paymentMethods.statements.closing')}</Table.Th>
              <Table.Th>{t('paymentMethods.statements.due')}</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visibleCycles(cycles ?? []).map((cycle) => (
              <Table.Tr key={cycle.overrideUuid ?? cycle.closingDate}>
                <Table.Td>
                  <Group gap="xs">
                    {formatIsoDate(cycle.closingDate, i18n.language)}
                    <SourceBadge source={cycle.closingSource} />
                  </Group>
                </Table.Td>
                <Table.Td>
                  {cycle.dueDate && (
                    <Group gap="xs">
                      {formatIsoDate(cycle.dueDate, i18n.language)}
                      <SourceBadge source={cycle.dueSource} />
                    </Group>
                  )}
                </Table.Td>
                <Table.Td>
                  {cycle.overrideUuid && (
                    <Group justify="right">
                      <Tooltip label={t('paymentMethods.statements.remove')}>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          disabled={isSubmitting}
                          onClick={() => handleDelete(cycle.overrideUuid!)}
                        >
                          <IconTrash />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md">
            <DateInput
              value={closingDate}
              onChange={setClosingDate}
              label={t('paymentMethods.statements.closing')}
              valueFormat="YYYY-MM-DD"
              disabled={isSubmitting}
              clearable
            />
          </div>
          <div className="col-12 col-md">
            <DateInput
              value={dueDate}
              onChange={setDueDate}
              label={t('paymentMethods.statements.dueOptional')}
              valueFormat="YYYY-MM-DD"
              minDate={closingDate ?? undefined}
              disabled={isSubmitting}
              clearable
            />
          </div>
          <div className="col-12 col-md-auto">
            <Button
              variant="light"
              color="green"
              leftSection={<IconPlus size={16} />}
              onClick={handleAdd}
              disabled={!closingDate || isSubmitting}
            >
              {t('paymentMethods.statements.add')}
            </Button>
          </div>
        </div>
      </Stack>
    </Paper>
  );
}
