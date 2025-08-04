export interface IconOption {
  label: string;
  icon: string;
}

export const ACCOUNT_ICONS: Readonly<IconOption[]> = [
  { label: 'Account Balance', icon: 'account_balance' },
  { label: 'Credit Card', icon: 'credit_card' },
  { label: 'Cash', icon: 'attach_money' },
  { label: 'Wallet', icon: 'wallet' },
  { label: 'Payment Card', icon: 'payment_card' },
  { label: 'Contactless', icon: 'contactless' },
].sort((a, b) => a.label.localeCompare(b.label));

export const PAYMENT_METHOD_ICONS: Readonly<IconOption[]> = [
  { label: 'Account Balance', icon: 'account_balance' },
  { label: 'Credit Card', icon: 'credit_card' },
  { label: 'Cash', icon: 'attach_money' },
  { label: 'Wallet', icon: 'wallet' },
  { label: 'Payment Card', icon: 'payment_card' },
  { label: 'Contactless', icon: 'contactless' },
].sort((a, b) => a.label.localeCompare(b.label));

export const EXPENSE_CATEGORY_ICONS: Readonly<IconOption[]> = [
  { label: 'Cottage', icon: 'cottage' },
  { label: 'Room Service', icon: 'room_service' },
  { label: 'Api', icon: 'api' },
  { label: 'Build', icon: 'build' },
  { label: 'Checkroom', icon: 'checkroom' },
  { label: 'Handyman', icon: 'handyman' },
  { label: 'Commute', icon: 'commute' },
  { label: 'Flight', icon: 'flight' },
  { label: 'Fastfood', icon: 'fastfood' },
  { label: 'Fork Spoon', icon: 'fork_spoon' },
  { label: 'Lunch Dining', icon: 'lunch_dining' },
  { label: 'Coffee', icon: 'coffee' },
  { label: 'Storefront', icon: 'storefront' },
  { label: 'Apparel', icon: 'apparel' },
  { label: 'Grocery', icon: 'grocery' },
  { label: 'Local Mall', icon: 'local_mall' },
  { label: 'Gavel', icon: 'gavel' },
  { label: 'Theater Comedy', icon: 'theater_comedy' },
  { label: 'Cast', icon: 'cast' },
  { label: 'Stadia Controller', icon: 'stadia_controller' },
  { label: 'Joystick', icon: 'joystick' },
  { label: 'Database', icon: 'database' },
  { label: 'Dns', icon: 'dns' },
  { label: 'Lan', icon: 'lan' },
  { label: 'Terminal', icon: 'terminal' },
  { label: 'Storage', icon: 'storage' },
  { label: 'School', icon: 'school' },
].sort((a, b) => a.label.localeCompare(b.label));

