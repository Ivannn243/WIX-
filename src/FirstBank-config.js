// src/FirstBank-config.js
// Wix Payment Provider configuration for First Bank / FOCAS
// Public example version. Replace logo URLs before production use.

export function getConfig() {
  return {
    title: "Credit Card Payment - First Bank",

    paymentMethods: [
      {
        hostedPage: {
          title: "Credit Card Payment",

          // Wix payment method logo example.
          // Replace these URLs with your own publicly accessible logo URLs.
          logos: {
            white: {
              svg: "https://your-domain.com/assets/logos/payment-logo-white.svg"
            },
            colored: {
              svg: "https://your-domain.com/assets/logos/payment-logo-colored.svg"
            }
          }
        }
      }
    ],

    credentialsFields: [
      {
        simpleField: {
          name: "MerchantID",
          label: "MerchantID"
        }
      },
      {
        simpleField: {
          name: "TerminalID",
          label: "TerminalID"
        }
      },
      {
        simpleField: {
          name: "merID",
          label: "merID"
        }
      },
      {
        simpleField: {
          name: "MerchantName",
          label: "Merchant Name"
        }
      }
    ]
  };
}
