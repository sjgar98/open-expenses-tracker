import Layout from '../../components/Layout/Layout';
import { Box, Button, Checkbox, Flex, Modal, Stack, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useListState } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp, IconDeviceFloppy, IconEdit } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../model/state';
import { useForm } from '@mantine/form';
import { widgets } from '../../model/home';
import { reorderWidgets, setWidgets } from '../../services/store/slices/homeSlice';

export default function Home() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const enabledWidgets = useSelector(({ home }: AppState) => home.enabledWidgets);
  const [state, handlers] = useListState(enabledWidgets);
  const { onSubmit, key, getInputProps } = useForm<{ widgets: string[] }>({
    mode: 'uncontrolled',
    initialValues: {
      widgets: enabledWidgets.filter((widget) => widget.visible).map((widget) => widget.id),
    },
  });
  const [opened, { open, close }] = useDisclosure(false);
  const moveWidget = useCallback((dragIndex: number, hoverIndex: number) => {
    handlers.reorder({ from: dragIndex, to: hoverIndex });
    dispatch(reorderWidgets({ fromIndex: dragIndex, toIndex: hoverIndex }));
  }, []);
  useEffect(() => {
    handlers.setState(enabledWidgets);
  }, [enabledWidgets]);
  function handleSubmit(form: { widgets: string[] }) {
    dispatch(setWidgets(enabledWidgets.map(({ id }) => ({ id, visible: form.widgets.includes(id) }))));
    close();
  }

  return (
    <Layout>
      <Flex justify="end" p={8}>
        <Tooltip label={t('actions.edit')} withArrow>
          <Button variant="subtle" color="yellow" className="px-2" onClick={open}>
            <Box className="d-flex align-items-center gap-2">
              <IconEdit />
            </Box>
          </Button>
        </Tooltip>
      </Flex>
      <Flex
        className="flex-grow-1 py-3"
        align={'center'}
        justify={'center'}
        gap="lg"
        wrap={'wrap'}
        style={{ alignContent: 'center' }}
      >
        {state
          .filter((w) => w.visible)
          .map((widget) => widgets.find((w) => w.id === widget.id))
          .filter(Boolean)
          .map((widget) => widget && <widget.Widget key={widget.id} height={400} width={550} />)}
      </Flex>
      <Modal opened={opened} onClose={close} centered>
        <form onSubmit={onSubmit(handleSubmit)}>
          <Stack>
            <Checkbox.Group key={key('widgets')} {...getInputProps('widgets')}>
              <Stack gap={4}>
                {state.map((widget, index) => (
                  <Flex
                    align={'center'}
                    key={widget.id}
                    style={{ border: '1px solid var(--mantine-color-gray-7)', borderRadius: 4 }}
                  >
                    <Stack gap={0} pe={12}>
                      <Button
                        size="compact-xs"
                        variant="transparent"
                        color="gray"
                        className="px-1"
                        disabled={index === 0}
                        onClick={() => moveWidget(index, index - 1)}
                      >
                        <Box className="d-flex align-items-center gap-2">
                          <IconChevronUp size={16} />
                        </Box>
                      </Button>
                      <Button
                        size="compact-xs"
                        variant="transparent"
                        color="gray"
                        className="px-1"
                        disabled={index === state.length - 1}
                        onClick={() => moveWidget(index, index + 1)}
                      >
                        <Box className="d-flex align-items-center gap-2">
                          <IconChevronDown size={16} />
                        </Box>
                      </Button>
                    </Stack>
                    <Box style={{ flexGrow: 1 }}>{t(widgets.find((w) => w.id === widget.id)?.title ?? widget.id)}</Box>
                    <Box px={12}>
                      <Checkbox value={widget.id} />
                    </Box>
                  </Flex>
                ))}
              </Stack>
            </Checkbox.Group>
            <Flex justify="end">
              <Button variant="filled" color="green" type="submit">
                <Box className="d-flex align-items-center gap-2">
                  <IconDeviceFloppy />
                  <span>{t('actions.save')}</span>
                </Box>
              </Button>
            </Flex>
          </Stack>
        </form>
      </Modal>
    </Layout>
  );
}

