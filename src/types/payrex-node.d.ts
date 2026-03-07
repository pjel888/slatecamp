declare module "payrex-node" {
  interface PaymentIntentCreateParams {
    amount: number;
    currency: string;
    payment_methods?: string[];
    description?: string;
    metadata?: Record<string, string>;
    statement_descriptor?: string;
  }

  interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: string;
    metadata?: Record<string, string>;
    attributes?: Record<string, unknown>;
  }

  interface WebhookEvent {
    id: string;
    type: string;
    data: {
      resource: Record<string, unknown>;
      previous_attributes?: Record<string, unknown>;
    };
  }

  interface PayRexClient {
    paymentIntents: {
      create(params: PaymentIntentCreateParams): Promise<PaymentIntent>;
      retrieve(id: string): Promise<PaymentIntent>;
    };
    webhooks: {
      parseEvent(
        payload: string,
        signature: string,
        secret: string
      ): Promise<WebhookEvent>;
      create(params: {
        url: string;
        events: string[];
        description?: string;
      }): Promise<unknown>;
    };
  }

  function PayRex(secretKey: string): PayRexClient;
  export = PayRex;
}
