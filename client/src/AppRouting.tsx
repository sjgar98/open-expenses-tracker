import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useSelector } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Expenses from './pages/Expenses/Expenses';
import ExpensesRecurring from './pages/Expenses/ExpensesRecurring/ExpensesRecurring';
import Income from './pages/Income/Income';
import Currencies from './pages/Currencies/Currencies';
import PaymentMethods from './pages/PaymentMethods/PaymentMethods';
import IncomeRecurring from './pages/Income/IncomeRecurring/IncomeRecurring';
import NewPaymentMethod from './pages/PaymentMethods/NewPaymentMethod/NewPaymentMethod';
import EditPaymentMethod from './pages/PaymentMethods/EditPaymentMethod/EditPaymentMethod';
import SignUp from './pages/SignUp/SignUp';
import NewCurrency from './pages/Currencies/NewCurrency/NewCurrency';
import EditCurrency from './pages/Currencies/EditCurrency/EditCurrency';
import type { AppState } from './model/state';
import ExchangeRates from './pages/ExchangeRates/ExchangeRates';
import Accounts from './pages/Accounts/Accounts';
import NewAccount from './pages/Accounts/NewAccount/NewAccount';
import EditAccount from './pages/Accounts/EditAccount/EditAccount';
import IncomeOneTime from './pages/Income/IncomeOneTime/IncomeOneTime';
import NewIncomeOneTime from './pages/Income/IncomeOneTime/NewIncomeOneTime/NewIncomeOneTime';
import EditIncomeOneTime from './pages/Income/IncomeOneTime/EditIncomeOneTime/EditIncomeOneTime';
import ExpensesOneTime from './pages/Expenses/ExpensesOneTime/ExpensesOneTime';
import Taxes from './pages/Taxes/Taxes';
import NewTax from './pages/Taxes/NewTax/NewTax';
import EditTax from './pages/Taxes/EditTax/EditTax';
import NewExpenseOneTime from './pages/Expenses/ExpensesOneTime/NewExpenseOneTime/NewExpenseOneTime';
import EditExpenseOneTime from './pages/Expenses/ExpensesOneTime/EditExpenseOneTime/EditExpenseOneTime';
import NewIncomeRecurring from './pages/Income/IncomeRecurring/NewIncomeRecurring/NewIncomeRecurring';
import EditIncomeRecurring from './pages/Income/IncomeRecurring/EditIncomeRecurring/EditIncomeRecurring';
import NewExpenseRecurring from './pages/Expenses/ExpensesRecurring/NewExpenseRecurring/NewExpenseRecurring';
import EditExpenseRecurring from './pages/Expenses/ExpensesRecurring/EditExpenseRecurring/EditExpenseRecurring';
import ExpenseCategories from './pages/ExpenseCategories/ExpenseCategories';
import NewExpenseCategory from './pages/ExpenseCategories/NewExpenseCategory/NewExpenseCategory';
import EditExpenseCategory from './pages/ExpenseCategories/EditExpenseCategory/EditExpenseCategory';
import IncomeSources from './pages/IncomeSources/IncomeSources';
import NewIncomeSource from './pages/IncomeSources/NewIncomeSource/NewIncomeSource';
import EditIncomeSource from './pages/IncomeSources/EditIncomeSource/EditIncomeSource';

export default function AppRouting() {
  const credentials = useSelector(({ auth }: AppState) => auth.credentials);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="home" element={<Home />} />
          <Route path="expenses" element={<Expenses />}>
            <Route path="onetime">
              <Route index element={<ExpensesOneTime />} />
              <Route path="new" element={<NewExpenseOneTime />} />
              <Route path="edit/:uuid" element={<EditExpenseOneTime />} />
            </Route>
            <Route path="recurring">
              <Route index element={<ExpensesRecurring />} />
              <Route path="new" element={<NewExpenseRecurring />} />
              <Route path="edit/:uuid" element={<EditExpenseRecurring />} />
            </Route>
            <Route index element={<Navigate to="onetime" />}></Route>
          </Route>
          <Route path="income" element={<Income />}>
            <Route path="onetime">
              <Route index element={<IncomeOneTime />} />
              <Route path="new" element={<NewIncomeOneTime />} />
              <Route path="edit/:uuid" element={<EditIncomeOneTime />} />
            </Route>
            <Route path="recurring">
              <Route index element={<IncomeRecurring />} />
              <Route path="new" element={<NewIncomeRecurring />} />
              <Route path="edit/:uuid" element={<EditIncomeRecurring />} />
            </Route>
            <Route index element={<Navigate to="onetime" />}></Route>
          </Route>
          <Route path="currencies">
            <Route index element={<Currencies />} />
            <Route path="new" element={<NewCurrency />} />
            <Route path="edit/:id" element={<EditCurrency />} />
          </Route>
          <Route path="exchange-rates">
            <Route index element={<ExchangeRates />} />
          </Route>
          <Route path="payment-methods">
            <Route index element={<PaymentMethods />} />
            <Route path="new" element={<NewPaymentMethod />} />
            <Route path="edit/:uuid" element={<EditPaymentMethod />} />
          </Route>
          <Route path="accounts">
            <Route index element={<Accounts />} />
            <Route path="new" element={<NewAccount />} />
            <Route path="edit/:uuid" element={<EditAccount />} />
          </Route>
          <Route path="taxes">
            <Route index element={<Taxes />} />
            <Route path="new" element={<NewTax />} />
            <Route path="edit/:uuid" element={<EditTax />} />
          </Route>
          <Route path="expense-categories">
            <Route index element={<ExpenseCategories />} />
            <Route path="new" element={<NewExpenseCategory />} />
            <Route path="edit/:uuid" element={<EditExpenseCategory />} />
          </Route>
          <Route path="income-sources">
            <Route index element={<IncomeSources />} />
            <Route path="new" element={<NewIncomeSource />} />
            <Route path="edit/:uuid" element={<EditIncomeSource />} />
          </Route>
        </Route>
        <Route index element={<Navigate to={credentials ? 'home' : 'login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

