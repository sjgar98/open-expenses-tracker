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
import EditCurrency from './pages/Currencies/EditCurrency.tsx/EditCurrency';
import type { AppState } from './model/state';

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
            <Route path="recurring">
              <Route index element={<ExpensesRecurring />} />
              <Route path="new" element={<ExpensesRecurring />} />
              <Route path="edit/:uuid" element={<ExpensesRecurring />} />
            </Route>
            <Route path="onetime">
              <Route index element={<></>} />
              <Route path="new" element={<></>} />
              <Route path="edit/:uuid" element={<></>} />
            </Route>
            <Route index element={<Navigate to="recurring" />}></Route>
          </Route>
          <Route path="income" element={<Income />}>
            <Route path="recurring" element={<IncomeRecurring />}>
              <Route index element={<IncomeRecurring />} />
              <Route path="new" element={<IncomeRecurring />} />
              <Route path="edit/:uuid" element={<IncomeRecurring />} />
            </Route>
            <Route path="onetime">
              <Route index element={<></>} />
              <Route path="new" element={<></>} />
              <Route path="edit/:uuid" element={<></>} />
            </Route>
            <Route index element={<Navigate to="recurring" />}></Route>
          </Route>
          <Route path="currencies">
            <Route index element={<Currencies />} />
            <Route path="new" element={<NewCurrency />} />
            <Route path="edit/:id" element={<EditCurrency />} />
          </Route>
          <Route path="payment-methods">
            <Route index element={<PaymentMethods />} />
            <Route path="new" element={<NewPaymentMethod />} />
            <Route path="edit/:uuid" element={<EditPaymentMethod />} />
          </Route>
        </Route>
        <Route index element={<Navigate to={credentials ? 'home' : 'login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

