export interface AppPaymentMethod {
  id: number;
  name: string;
  credit: boolean;
  creditLimit: number | null;
  status: boolean;
}

export interface PaymentMethodsState {
  paymentMethods: AppPaymentMethod[];
}
