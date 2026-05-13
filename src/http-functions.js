// src/http-functions.example.js
// First Bank / FOCAS × Wix HTTP Functions
// Sanitized public example. Replace all placeholders before use.

import { ok } from "wix-http-functions";
import wixData from "wix-data";
import { submitEvent } from "wix-payment-provider-backend";

const FOCAS_PENDING_COLLECTION = "FocasPendingOrders";
const FOCAS_ORDERS_COLLECTION = "FocasOrders";

const RETURN_URL_SUCCESS = "YOUR_SITE_URL/payment-success";
const RETURN_URL_FAILED = "YOUR_SITE_URL/payment-failed";

export async function get_focasRedirect(request) {
  try {
    const lidm = request.query.lidm;

    if (!lidm) {
      return htmlResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Parameter Error</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <p>Missing order ID. Please return to the store and try again.</p>
        </body>
        </html>
      `);
    }

    console.log("[FOCAS Redirect] lidm:", lidm);

    const result = await wixData
      .query(FOCAS_PENDING_COLLECTION)
      .eq("lidm", lidm)
      .limit(1)
      .find({
        suppressAuth: true
      });

    if (!result.items.length) {
      console.error("[FOCAS Redirect] Pending order not found:", lidm);

      return htmlResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Data Not Found</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <p>Payment data not found. Please return to the store and try again.</p>
        </body>
        </html>
      `);
    }

    const pendingOrder = result.items[0];

    if (!pendingOrder.focasParams) {
      console.error("[FOCAS Redirect] focasParams is empty:", lidm);

      return htmlResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Data Error</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <p>Payment data is incomplete. Please return to the store and try again.</p>
        </body>
        </html>
      `);
    }

    let focasParams;

    try {
      focasParams = JSON.parse(pendingOrder.focasParams);
    } catch (parseError) {
      console.error("[FOCAS Redirect] Failed to parse focasParams:", parseError.message);

      return htmlResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Data Format Error</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <p>Payment data format error. Please return to the store and try again.</p>
        </body>
        </html>
      `);
    }

    console.log("[FOCAS Redirect] FOCAS params:", JSON.stringify(focasParams));

    const requiredFields = [
      "MerchantID",
      "TerminalID",
      "merID",
      "MerchantName",
      "purchAmt",
      "lidm",
      "AutoCap"
    ];

    const missingFields = requiredFields.filter((field) => {
      return (
        focasParams[field] === undefined ||
        focasParams[field] === null ||
        String(focasParams[field]).trim() === ""
      );
    });

    if (missingFields.length) {
      console.error("[FOCAS Redirect] Missing required fields:", missingFields.join(", "));

      return htmlResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Missing Payment Parameters</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <p>Missing required payment parameters: ${escapeHtml(missingFields.join(", "))}</p>
        </body>
        </html>
      `);
    }

    const FOCAS_URL = "https://www.focas-test.fisc.com.tw/FOCAS_WEBPOS/online/";

    // Production URL:
    // const FOCAS_URL = "https://www.focas.fisc.com.tw/FOCAS_WEBPOS/online/";

    const inputs = Object.entries(focasParams)
      .map(([name, value]) => {
        return `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(String(value ?? ""))}">`;
      })
      .join("\n");

    await wixData.update(FOCAS_PENDING_COLLECTION, {
      ...pendingOrder,
      status: "REDIRECTED",
      redirectedAt: new Date().toISOString()
    }, {
      suppressAuth: true
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Redirecting to Payment Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>

      <body style="
        font-family: Arial, sans-serif;
        padding: 24px;
        background: #f7f7f7;
        color: #111;
      ">
        <div style="
          max-width: 520px;
          margin: 40px auto;
          padding: 28px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          text-align: center;
        ">
          <h2 style="font-size: 22px; margin-bottom: 12px;">
            Redirecting to Credit Card Authorization Page
          </h2>

          <p style="font-size: 15px; color: #555; line-height: 1.7;">
            You are being redirected to the credit card authorization page.<br>
            If you are not redirected within 3 seconds, please click the button below.
          </p>

          <p id="autoStatus" style="font-size: 13px; color: #777; margin-top: 16px;">
            Attempting automatic redirect...
          </p>

          <form id="focasForm" name="focasForm" method="POST" action="${FOCAS_URL}">
            ${inputs}

            <button
              id="submitBtn"
              type="submit"
              style="
                margin-top: 24px;
                padding: 13px 22px;
                font-size: 16px;
                cursor: pointer;
                border: none;
                border-radius: 8px;
                background: #111;
                color: #fff;
                width: 100%;
                max-width: 320px;
              "
            >
              Continue to Payment Page
            </button>
          </form>

          <p style="font-size: 12px; color: #999; margin-top: 20px; line-height: 1.6;">
            Please do not close this page.
          </p>
        </div>

        <script>
          (function() {
            var hasSubmittedByForm = false;

            function updateStatus(text) {
              var el = document.getElementById("autoStatus");
              if (el) {
                el.innerText = text;
              }
            }

            function submitByButtonClick() {
              var button = document.getElementById("submitBtn");
              var form = document.getElementById("focasForm");

              if (!button || !form) {
                updateStatus("Payment button not found. Please return to the store.");
                return;
              }

              updateStatus("Attempting automatic redirect...");

              try {
                button.click();
              } catch (e) {
                updateStatus("Auto-click failed. Trying form submit.");
              }
            }

            function submitByFormSubmit() {
              if (hasSubmittedByForm) {
                return;
              }

              var form = document.getElementById("focasForm");

              if (!form) {
                updateStatus("Payment form not found. Please return to the store.");
                return;
              }

              hasSubmittedByForm = true;
              updateStatus("Redirecting to payment page...");

              try {
                form.submit();
              } catch (e) {
                hasSubmittedByForm = false;
                updateStatus("Automatic redirect failed. Please click the button below.");
              }
            }

            setTimeout(submitByButtonClick, 500);
            setTimeout(submitByFormSubmit, 1200);
            setTimeout(submitByButtonClick, 2000);
            setTimeout(submitByFormSubmit, 2600);

            setTimeout(function() {
              updateStatus("If you are not redirected, please click the button below.");
            }, 3000);
          })();
        </script>

        <noscript>
          <div style="
            max-width: 520px;
            margin: 20px auto;
            padding: 16px;
            background: #fff3f3;
            color: #a00;
            border-radius: 8px;
            font-family: Arial, sans-serif;
          ">
            JavaScript is disabled. Please click the payment button above.
          </div>
        </noscript>
      </body>
      </html>
    `;

    return htmlResponse(html);

  } catch (error) {
    console.error("[FOCAS Redirect] Error:", error.message, error.stack);

    return htmlResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Redirect Failed</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <p>Payment redirect failed. Please return to the store and try again.</p>
        <pre>${escapeHtml(error.message || "Unknown error")}</pre>
      </body>
      </html>
    `);
  }
}

export async function post_focasCallback(request) {
  try {
    const body = await request.body.text();

    console.log("[FOCAS Callback] raw body:", body);

    const params = parseFocasCallbackBody(body);

    console.log("[FOCAS Callback] parsed params:", JSON.stringify(params));

    const status = params.status || "";
    const authCode = params.authCode || "";
    const lidm = params.lidm || "";
    const errcode = params.errcode || "";
    const errDesc = params.errDesc || "";
    const authAmt = params.authAmt || "";
    const cardBrand = params.cardBrand || "";
    const lastPan4 = params.lastPan4 || "";
    const pan = params.pan || "";
    const authRespTime = params.authRespTime || "";
    const merID = params.merID || "";
    const xid = params.xid || "";

    const isSuccess =
      status === "0" &&
      authCode &&
      authCode !== "null" &&
      authCode !== "";

    await wixData.save(FOCAS_ORDERS_COLLECTION, {
      title: lidm || "FOCAS_ORDER",
      orderId: lidm,
      status: isSuccess ? "PAID" : "FAILED",
      focasStatus: status,
      authCode: authCode,
      errCode: errcode,
      errDesc: errDesc,
      authAmt: authAmt,
      cardBrand: cardBrand,
      lastPan4: lastPan4,
      pan: pan,
      authRespTime: authRespTime,
      merID: merID,
      xid: xid,
      rawBody: body,
      rawParams: JSON.stringify(params),
      updatedAt: new Date().toISOString()
    }, {
      suppressAuth: true
    });

    const submitResult = await submitWixPaymentEvent({
      lidm,
      isSuccess,
      errcode,
      errDesc
    });

    const returnUrl = isSuccess ? RETURN_URL_SUCCESS : RETURN_URL_FAILED;

    return htmlResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Result</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 24px; background: #f7f7f7;">
        <div style="
          max-width: 520px;
          margin: 40px auto;
          padding: 28px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        ">
          <h2>${isSuccess ? "Payment Successful" : "Payment Incomplete"}</h2>
          <p>Order ID: ${escapeHtml(lidm || "-")}</p>
          <p>Authorized Amount: ${escapeHtml(authAmt || "-")}</p>
          <p>Authorization Code: ${escapeHtml(authCode || "-")}</p>
          <p>Status: ${escapeHtml(status || "-")}</p>
          <p>${isSuccess ? "Your payment has been completed." : "Your payment was not completed."}</p>
          <p style="font-size: 13px; color: #777;">
            Wix submitEvent status: ${escapeHtml(submitResult.status || "-")}
          </p>

          <a href="${escapeHtml(returnUrl)}" style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 18px;
            background: #111;
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
          ">
            Return to Website
          </a>
        </div>

        <script>
          setTimeout(function() {
            window.location.href = ${JSON.stringify(returnUrl)};
          }, 4000);
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("[FOCAS Callback] Error:", error.message, error.stack);

    return htmlResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Result Handling Failed</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <p>Payment result was received, but the website failed to process it.</p>
        <pre>${escapeHtml(error.message || "Unknown error")}</pre>
      </body>
      </html>
    `);
  }
}

async function submitWixPaymentEvent({ lidm, isSuccess, errcode, errDesc }) {
  if (!lidm) {
    return {
      status: "SKIPPED_NO_LIDM",
      error: "Missing lidm"
    };
  }

  try {
    const pendingResult = await wixData
      .query(FOCAS_PENDING_COLLECTION)
      .eq("lidm", lidm)
      .limit(1)
      .find({
        suppressAuth: true
      });

    if (!pendingResult.items.length) {
      return {
        status: "SKIPPED_NO_PENDING_ORDER",
        error: "Pending order not found"
      };
    }

    const pendingOrder = pendingResult.items[0];
    const wixTransactionId = pendingOrder.wixTransactionId || "";

    let submitEventStatus = "";
    let submitEventError = "";

    if (!wixTransactionId) {
      submitEventStatus = "SKIPPED_NO_WIX_TRANSACTION_ID";
      submitEventError = "Missing wixTransactionId";

      await wixData.update(FOCAS_PENDING_COLLECTION, {
        ...pendingOrder,
        status: isSuccess ? "PAID" : "FAILED",
        callbackAt: new Date().toISOString(),
        submitEventStatus: submitEventStatus,
        submitEventAt: new Date().toISOString(),
        submitEventError: submitEventError
      }, {
        suppressAuth: true
      });

      return {
        status: submitEventStatus,
        error: submitEventError
      };
    }

    try {
      if (isSuccess) {
        await submitEvent({
          event: {
            transaction: {
              wixTransactionId: wixTransactionId,
              pluginTransactionId: lidm
            }
          }
        });

        submitEventStatus = "SUBMITTED";
        console.log("[FOCAS Callback] submitEvent success:", lidm);

      } else {
        submitEventStatus = "SKIPPED_PAYMENT_FAILED";
        submitEventError = errDesc || errcode || "FOCAS payment failed";
      }

    } catch (submitError) {
      submitEventStatus = "FAILED";
      submitEventError = submitError.message || String(submitError);
      console.error("[FOCAS Callback] submitEvent failed:", submitEventError);
    }

    await wixData.update(FOCAS_PENDING_COLLECTION, {
      ...pendingOrder,
      status: isSuccess ? "PAID" : "FAILED",
      callbackAt: new Date().toISOString(),
      submitEventStatus: submitEventStatus,
      submitEventAt: new Date().toISOString(),
      submitEventError: submitEventError
    }, {
      suppressAuth: true
    });

    return {
      status: submitEventStatus,
      error: submitEventError
    };

  } catch (error) {
    console.error("[FOCAS Callback] submitWixPaymentEvent failed:", error.message);

    return {
      status: "FAILED_INTERNAL",
      error: error.message || String(error)
    };
  }
}

function parseFocasCallbackBody(body) {
  const params = {};

  if (!body) {
    return params;
  }

  const authRespMatch = body.match(/AuthResp=\{([\s\S]*)\}/);

  if (authRespMatch) {
    authRespMatch[1].split(",").forEach((pair) => {
      const eqIndex = pair.indexOf("=");

      if (eqIndex > -1) {
        const key = pair.substring(0, eqIndex).trim();
        const value = pair.substring(eqIndex + 1).trim();
        params[key] = decodeMaybe(value);
      }
    });

    return params;
  }

  const searchParams = new URLSearchParams(body);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

function decodeMaybe(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

function htmlResponse(html) {
  return ok({
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    },
    body: html
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
