export interface PaymentMethod {
  uuid: string;
  name: string;
  credit: boolean;
  creditClosingDateRule?: string | null;
  creditDueDateRule?: string | null;
  nextClosingOccurrence: Date | null;
  nextDueOccurrence: Date | null;
}

export interface PaymentMethodsState {
  paymentMethods: PaymentMethod[];
}

export interface PaymentMethodDto {
  name: string;
  credit: boolean;
  creditClosingDateRule?: string | null;
  creditDueDateRule?: string | null;
}
