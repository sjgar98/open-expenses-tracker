import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function IncomeRecurring() {
  const { t } = useTranslation();

  const income = [{ id: 1, name: 'Test' }];

  return (
    <Box sx={{ flexGrow: 1, px: 3, py: 5 }}>
      {income.map((income) => (
        <Card key={income.id} sx={{ width: 300 }}>
          <CardContent>
            <Typography variant="h6" component="div">
              {income.name}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'end' }}>
            <Button size="small">{t('income.recurring.edit')}</Button>
            <Button size="small" color="error">
              {t('income.recurring.delete')}
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
