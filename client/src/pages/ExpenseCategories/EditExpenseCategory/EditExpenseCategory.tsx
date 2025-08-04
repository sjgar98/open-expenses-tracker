import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { ExpenseCategory, ExpenseCategoryDto } from '../../../model/expense-categories';
import { useForm } from '@mantine/form';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../../utils/error-parser.utils';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, ColorInput, LoadingOverlay, Select, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import { EXPENSE_CATEGORY_ICONS } from '../../../constants/icons';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';

export default function EditExpenseCategory() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<ExpenseCategory | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<ExpenseCategoryDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialState?.name ?? '',
      icon: initialState?.icon ?? '',
      iconColor: initialState?.iconColor ?? '#FFFFFF',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: categoryError, data: categoryResponse } = useQuery({
    queryKey: ['expenseCategoryByUuid', uuid],
    queryFn: () => ApiService.getExpenseCategoryByUuid(uuid!),
  });

  useEffect(() => {
    if (categoryResponse) {
      setInitialState(categoryResponse);
      setInitialValues({
        name: categoryResponse.name,
        icon: categoryResponse.icon,
        iconColor: categoryResponse.iconColor,
      });
      reset();
      setIsLoading(false);
    }
  }, [categoryResponse]);

  useEffect(() => {
    if (categoryError) {
      enqueueSnackbar(t(parseError(categoryError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [categoryError]);

  function handleSubmit(form: ExpenseCategoryDto) {
    if (!isSubmitting) {
      const data: ExpenseCategoryDto = {
        name: form.name,
        icon: form.icon,
        iconColor: form.iconColor,
      };
      setIsSubmitting(true);
      ApiService.updateExpenseCategory(uuid!, data)
        .then(() => {
          navigate('..');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReturn() {
    navigate('..');
  }

  function onDelete() {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.deleteExpenseCategory(uuid!)
        .then(() => {
          navigate('..');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  return (
    <>
      <Layout>
        {!isLoading && (
          <>
            <div className="container pt-3">
              <div className="row">
                <div className="col">
                  <div className="d-flex justify-content-start gap-3 pb-3">
                    <div className="d-flex gap-3">
                      <Button variant="subtle" color="blue" className="px-2" onClick={onReturn} disabled={isSubmitting}>
                        <Box className="d-flex align-items-center gap-2">
                          <IconArrowBack />
                          <span>{t('actions.return')}</span>
                        </Box>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <Title order={1} style={{ textAlign: 'center' }}>
                    {t('expenseCategories.edit.title')}
                  </Title>
                </div>
              </div>
            </div>
            <div className="container py-3">
              <div className="row">
                <div className="col">
                  <form className="d-flex flex-column gap-3 my-2" onSubmit={onSubmit(handleSubmit)}>
                    <TextInput
                      key={key('name')}
                      {...getInputProps('name')}
                      label={t('expenseCategories.edit.controls.name')}
                      required
                      disabled={isSubmitting}
                    />
                    <div className="container px-0">
                      <div className="row mx-0 gap-3">
                        <div className="col-12 col-md px-0">
                          <Select
                            key={key('icon')}
                            {...getInputProps('icon')}
                            label={t('expenseCategories.edit.controls.icon')}
                            required
                            data={EXPENSE_CATEGORY_ICONS.map((icon) => ({ value: icon.icon, label: icon.label }))}
                            renderOption={(item) => (
                              <Box className="d-flex gap-2 align-items-center">
                                <MaterialIcon size={20}>{item.option.value}</MaterialIcon>
                                <span>{item.option.label}</span>
                              </Box>
                            )}
                          />
                        </div>
                        <div className="col-12 col-md px-0">
                          <ColorInput
                            key={key('iconColor')}
                            {...getInputProps('iconColor')}
                            label={t('expenseCategories.edit.controls.iconColor')}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between gap-3 mt-5">
                      <div className="d-flex gap-3">
                        <Button
                          variant="subtle"
                          color="red"
                          className="px-2"
                          onClick={onDelete}
                          disabled={isSubmitting}
                        >
                          <Tooltip label={t('actions.delete')} withArrow>
                            <Box className="d-flex align-items-center gap-2">
                              <IconTrash />
                            </Box>
                          </Tooltip>
                        </Button>
                      </div>
                      <div className="d-flex gap-3">
                        <Button variant="outline" color="blue" onClick={reset} disabled={isSubmitting}>
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
      </Layout>
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

