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

export default function AppRouting() {
  const credentials = useSelector((state: any) => state.auth.credentials);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="home" element={<Home />} />
          <Route path="expenses" element={<Expenses />}>
            <Route path="recurring" element={<ExpensesRecurring />} />
            <Route path="onetime" element={<></>} />
            <Route index element={<Navigate to="recurring"></Navigate>}></Route>
          </Route>
          <Route path="income" element={<Income />}>
            <Route path="recurring" element={<IncomeRecurring />} />
            <Route path="onetime" element={<></>} />
            <Route index element={<Navigate to="recurring"></Navigate>}></Route>
          </Route>
          <Route path="currencies" element={<Currencies />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
        </Route>
        <Route index element={<Navigate to={credentials ? 'home' : 'login'}></Navigate>} />
      </Routes>
    </BrowserRouter>
  );
}
