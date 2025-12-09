declare module 'iyzipay' {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface IyzipayCallback {
    (err: any, result: any): void;
  }

  class Iyzipay {
    constructor(config: IyzipayConfig);
    checkoutFormInitialize: {
      create(request: any, callback: IyzipayCallback): void;
    };
    checkoutForm: {
      retrieve(request: any, callback: IyzipayCallback): void;
    };
  }

  export = Iyzipay;
}

