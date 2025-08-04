import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { IncomeSourceDto } from '../../../model/income-source';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, ColorInput, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';

export default function NewIncomeSource() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onSubmit, key, getInputProps, reset } = useForm<IncomeSourceDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      color: '#FFFFFF',
    },
  });

  function handleSubmit(form: IncomeSourceDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.createIncomeSource(form)
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
    <>
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
                {t('incomeSources.new.title')}
              </Title>
            </div>
          </div>
        </div>
        <div className="container py-3">
          <div className="row">
            <div className="col">
              <form className="d-flex flex-column gap-3 my-2" onSubmit={onSubmit(handleSubmit)}>
                <div className="container px-0">
                  <div className="row mx-0 gap-3">
                    <div className="col-12 col-md px-0">
                      <TextInput
                        key={key('name')}
                        {...getInputProps('name')}
                        label={t('incomeSources.new.controls.name')}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="col-12 col-md px-0">
                      <ColorInput
                        key={key('color')}
                        {...getInputProps('color')}
                        label={t('incomeSources.new.controls.color')}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-3 mt-5">
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
    </>
  );
}

