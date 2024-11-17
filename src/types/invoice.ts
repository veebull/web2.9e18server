export interface InvoicePrice {
  label: string;
  amount: number;
}

export interface InvoiceParams {
  title: string;
  description: string;
  currency: string;
  prices: InvoicePrice[];
  payload: string;
  provider_token: string;
  start_parameter: string;
  need_name: boolean;
  need_phone_number: boolean;
  need_email: boolean;
  need_shipping_address: boolean;
  is_flexible: boolean;
  photo_url?: string;
  max_tip_amount: number;
  suggested_tip_amounts: number[];
  send_email_to_provider: boolean;
  send_phone_to_provider: boolean;
} 