// src/FirstBank.example.js
// First Bank / FOCAS × Wix Payment Provider Service Plugin
// Sanitized public example. Replace all placeholders before use.

import wixData from "wix-data";

function createLidm() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

  // FOCAS credit card lidm max length: 19
  return "WX" + timestamp + random;
}

function getSiteUrl() {
  // Replace with your own Wix site domain.
  // Do not include trailing slash.
  return "YOUR_SITE_URL";
}

function getAmountFromOrder(order) {
  console.log("[FirstBank order object]", JSON.stringify(order));

  const possibleAmounts = [
    order?.description?.totalAmount,
    order?.description?.total,
    order?.description?.amount,
    order?.totalAmount,
    order?.amount,
    order?.priceSummary?.total?.amount,
    order?.priceSummary?.total?.value,
    order?.payment?.amount
  ];

  for (const rawAmount of possibleAmounts) {
    if (rawAmount !== undefined && rawAmount !== null && rawAmount !== "") {
      const numberValue = Number(rawAmount);

      if (Number.isFinite(numberValue) && numberValue > 0) {
        const finalAmount =
          numberValue > 1000
            ? Math.round(numberValue / 100)
            : Math.round(numberValue);

        return String(finalAmount);
      }
    }
  }

  console.warn("[FirstBank] Unable to detect order amount. Using test amount 101.");
  return "101";
}

function getWixTransactionId(options) {
  return (
    options?.wixTransactionId ||
    options?.transaction?.wixTransactionId ||
    options?.payment?.wixTransactionId ||
    options?.transactionId ||
    ""
  );
}

export async function connectAccount(options) {
  console.log("[FirstBank connectAccount options]", JSON.stringify(options));

  const credentials = options.credentials || {};

  const MerchantID = String(credentials.MerchantID || "").trim();
  const TerminalID = String(credentials.TerminalID || "").trim();
  const merID = String(credentials.merID || "").trim();
  const MerchantName = String(credentials.MerchantName || "").trim();

  if (!MerchantID) {
    throw new Error("Missing MerchantID");
  }

  if (!TerminalID) {
    throw new Error("Missing TerminalID");
  }

  if (!merID) {
    throw new Error("Missing merID");
  }

  if (!MerchantName) {
    throw new Error("Missing MerchantName");
  }

  return {
    accountId: MerchantID,
    accountName: MerchantName,
    credentials: {
      MerchantID,
      TerminalID,
      merID,
      MerchantName
    }
  };
}

export async function createTransaction(options) {
  try {
    console.log("[FirstBank createTransaction options]", JSON.stringify(options));

    const merchantCredentials = options.merchantCredentials || {};
    const order = options.order || {};
    const wixTransactionId = getWixTransactionId(options);

    console.log("[FirstBank wixTransactionId]", wixTransactionId);

    const MerchantID = merchantCredentials.MerchantID || "YOUR_MERCHANT_ID";
    const TerminalID = merchantCredentials.TerminalID || "YOUR_TERMINAL_ID";
    const merID = merchantCredentials.merID || "YOUR_MER_ID";
    const MerchantName = merchantCredentials.MerchantName || "YOUR_STORE_NAME";

    if (!MerchantID || !TerminalID || !merID || !MerchantName) {
      throw new Error("Missing First Bank / FOCAS merchant credentials.");
    }

    const lidm = createLidm();
    const purchAmt = getAmountFromOrder(order);

    const siteUrl = getSiteUrl();

    const callbackUrl = siteUrl + "/_functions/focasCallback";
    const redirectPageUrl = siteUrl + "/_functions/focasRedirect";

    const focasParams = {
      MerchantID: MerchantID,
      TerminalID: TerminalID,
      merID: merID,
      MerchantName: MerchantName,
      purchAmt: purchAmt,
      lidm: lidm,
      AutoCap: "1",
      AuthResURL: callbackUrl,
      enCodeType: "UTF-8",
      customize: "0",
      PayType: "0"
    };

    console.log("[FirstBank FOCAS params]", JSON.stringify(focasParams));

    try {
      await wixData.save("FocasPendingOrders", {
        title: lidm,
        lidm: lidm,
        wixTransactionId: wixTransactionId,
        focasParams: JSON.stringify(focasParams),
        status: "CREATED",
        createdAt: new Date().toISOString()
      }, {
        suppressAuth: true
      });

      console.log("[FirstBank] FocasPendingOrders created:", lidm);

    } catch (saveError) {
      console.error(
        "[FirstBank] Failed to save FocasPendingOrders:",
        saveError.message,
        saveError.stack
      );

      throw new Error("Failed to save pending payment data: " + saveError.message);
    }

    const redirectUrl = redirectPageUrl + "?lidm=" + encodeURIComponent(lidm);

    console.log("[FirstBank redirectUrl]", redirectUrl);

    return {
      pluginTransactionId: lidm,
      redirectUrl: redirectUrl
    };

  } catch (error) {
    console.error("[FirstBank createTransaction error]", error.message, error.stack);

    return {
      reasonCode: "CREATE_TRANSACTION_FAILED",
      errorCode: "FIRSTBANK_CREATE_TRANSACTION_ERROR",
      errorMessage: error.message || "Failed to create First Bank transaction."
    };
  }
}

export async function refundTransaction(options) {
  console.log("[FirstBank refundTransaction options]", JSON.stringify(options));

  return {
    reasonCode: "REFUND_NOT_SUPPORTED",
    errorCode: "REFUND_NOT_IMPLEMENTED",
    errorMessage: "Refund is not implemented. Please process refunds through the bank or FOCAS backend."
  };
}
