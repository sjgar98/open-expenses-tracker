import { useTranslation } from 'react-i18next';
import type { PaymentMethod } from '../../model/payment-methods';
import { useDispatch, useSelector } from 'react-redux';
import { rrulestr } from 'rrule';
import { ApiService } from '../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setPaymentMethods } from '../../services/store/features/paymentMethodsSlice/paymentMethodsSlice';
import { useNavigate } from 'react-router';
import type { AppState } from '../../model/state';
import { useSnackbar } from 'notistack';
import { parseError } from '../../utils/error-parser.utils';
import Layout from '../../components/Layout/Layout';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Box, Group, LoadingOverlay, Tooltip } from '@mantine/core';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';

export default function PaymentMethods() {
  const { t } = useTranslation();
  const paymentMethods: PaymentMethod[] = useSelector(({ paymentMethods }: AppState) => paymentMethods.paymentMethods);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const { error: paymentMethodsError, data: paymentMethodsResponse } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => ApiService.getUserPaymentMethods(),
  });

  useEffect(() => {
    dispatch(setPaymentMethods(paymentMethodsResponse ?? []));
    setIsLoading(false);
  }, [paymentMethodsResponse]);

  useEffect(() => {
    if (paymentMethodsError) {
      enqueueSnackbar(t(parseError(paymentMethodsError) ?? 'Error'), { variant: 'error' });
    }
  }, [paymentMethodsError]);

  const handleAdd = () => {
    navigate('./new');
  };

  const handleEdit = (paymentMethod: PaymentMethod) => {
    navigate(`./edit/${paymentMethod.uuid}`);
  };

  const columns: DataTableColumn<PaymentMethod>[] = [
    {
      accessor: 'name',
      title: t('paymentMethods.table.header.name'),
      render: (paymentMethod) => (
        <Box className="d-flex align-items-center gap-2">
          <MaterialIcon color={paymentMethod.iconColor} size={20}>
            {paymentMethod.icon}
          </MaterialIcon>
          <span>{paymentMethod.name}</span>
        </Box>
      ),
    },
    {
      accessor: 'credit',
      title: t('paymentMethods.table.header.credit'),
      render: (paymentMethod) => (paymentMethod.credit ? t('yesno.yes') : t('yesno.no')),
    },
    {
      accessor: 'creditClosingDateRule',
      title: t('paymentMethods.table.header.creditClosingDateRule'),
      render: (paymentMethod) =>
        paymentMethod.credit ? rrulestr(paymentMethod.creditClosingDateRule!).after(new Date())?.toDateString() : '',
    },
    {
      accessor: 'creditDueDateRule',
      title: t('paymentMethods.table.header.creditDueDateRule'),
      render: (paymentMethod) =>
        paymentMethod.credit
          ? rrulestr(paymentMethod.creditDueDateRule!)
              .after(rrulestr(paymentMethod.creditClosingDateRule!).after(new Date())!)
              ?.toDateString()
          : '',
    },
    {
      accessor: 'actions',
      title: (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.new')}>
            <ActionIcon variant="subtle" color="green" onClick={() => handleAdd()}>
              <IconTablePlus />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
      render: (account) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(account)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Layout>
        <DataTable withTableBorder highlightOnHover records={paymentMethods} columns={columns} idAccessor="uuid" />
        <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
      </Layout>
    </>
  );
}

