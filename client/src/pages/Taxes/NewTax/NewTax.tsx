import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { TaxDto } from '../../../model/taxes';
import { useState } from 'react';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, NumberInput, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';

export default function NewTax() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { onSubmit, key, getInputProps, reset } = useForm<TaxDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      rate: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(data: TaxDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.createUserTax(data)
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

  return (
    <Layout>
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
              {t('taxes.new.title')}
            </Title>
          </div>
        </div>
      </div>
      <div className="container py-3">
        <div className="row">
          <div className="col">
            <form className="d-flex flex-column gap-3 my-3" onSubmit={onSubmit(handleSubmit)}>
              <TextInput
                key={key('name')}
                {...getInputProps('name')}
                label={t('taxes.new.controls.name')}
                required
                disabled={isSubmitting}
              />
              <NumberInput
                key={key('rate')}
                {...getInputProps('rate')}
                min={0.01}
                max={100}
                decimalScale={2}
                valueIsNumericString
                label={t('taxes.new.controls.rate')}
                allowNegative={false}
                suffix=" %"
                hideControls
                required
                disabled={isSubmitting}
              />
              <div className="d-flex justify-content-end gap-3">
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
    </Layout>
  );
}

