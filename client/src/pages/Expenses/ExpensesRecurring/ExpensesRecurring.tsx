import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ExpensesRecurring() {
  const { t } = useTranslation();

  const expenses = [{ id: 1, name: 'Test' }];

  return (
    <Box sx={{ flexGrow: 1, px: 3, py: 5 }}>
      {expenses.map((expense) => (
        <Card key={expense.id} sx={{ width: 300 }}>
          <CardContent>
            <Typography variant="h6" component="div">
              {expense.name}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'end' }}>
            <Button size="small">{t('expenses.recurring.edit')}</Button>
            <Button size="small" color="error">
              {t('expenses.recurring.delete')}
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
