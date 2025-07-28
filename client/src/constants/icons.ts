export interface IconOption {
  label: string;
  icon: string;
}

export const ACCOUNT_ICONS: Readonly<IconOption[]> = [
  { label: 'Account Balance', icon: 'account_balance' },
  { label: 'Credit Card', icon: 'credit_card' },
  { label: 'Cash', icon: 'attach_money' },
];

export const PAYMENT_METHOD_ICONS: Readonly<IconOption[]> = [
  { label: 'Cash', icon: 'attach_money' },
  { label: 'Bank Transfer', icon: 'account_balance' },
  { label: 'Credit Card', icon: 'credit_card' },
];

