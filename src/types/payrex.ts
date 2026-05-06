export interface PaymentIntentCreateParams {
  amount: number
  currency: string
  payment_methods?: string[]
  description?: string
  metadata?: Record<string, string>
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  attributes?: {
    checkout_url?: string
    [key: string]: unknown
  }
}

export interface PayRexWebhookEvent {
  id?: string
  type: string
  data: {
    resource: {
      id?: string
      amount?: number
      metadata?: Record<string, string>
    }
  }
}

export interface PayRexClient {
  paymentIntents: {
    create(params: PaymentIntentCreateParams): Promise<PaymentIntent>
    retrieve(id: string): Promise<PaymentIntent>
  }
  webhooks: {
    parseEvent(body: string, signature: string, secret: string): Promise<PayRexWebhookEvent>
  }
}
