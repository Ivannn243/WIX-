# Wix × First Bank FOCAS Payment Provider

A reference implementation for integrating the **Wix Velo Payment Provider Service Plugin** with **First Bank / FISC FOCAS credit card payment flow**.

> This repository is for educational and integration reference only.  
> Do not commit real merchant credentials, bank credentials, verification keys, callback secrets, or production transaction records.

---

## Architecture

```text
Wix Checkout
  ↓
FirstBank.js createTransaction()
  ↓
Save pending payment to FocasPendingOrders (CMS)
  ↓
Redirect to /_functions/focasRedirect?lidm=...
  ↓
http-functions.js generates HTML Form POST
  ↓
FOCAS hosted credit card payment page
  ↓
FOCAS posts payment result to /_functions/focasCallback
  ↓
Save result to FocasOrders (CMS)
  ↓
submitEvent() updates Wix Orders status
  ↓
Redirect to /payment-success or /payment-failed
```

---

## Requirements

- A **Wix** account with at least a **Core Premium plan** (required for Velo / Service Plugins)
- A **First Bank FOCAS** merchant account (MerchantID, TerminalID, merID)
- Your Wix site must have **Developer Mode (Velo)** enabled

---

## Steps to Integrate First Bank FOCAS as a Payment Provider in Wix

### Step 1 — Enable Developer Mode

In your Wix site, open the **Wix Editor**.

At the top, click **Dev Mode** → **Turn on Dev Mode**.

### Step 2 — Open the Code Editor

On the left sidebar, click the **`{ }` icon** to open the Velo code panel.

### Step 3 — Add Payment Provider Service Plugin

In the **Service Plugins** section, click the **(+)** icon and select **Payment** to add a new payment provider plugin.

### Step 4 — Start Setup

On the following screen, click **Start now**.

### Step 5 — Accept Terms

Check the legal terms and click **Accept**.

### Step 6 — Name the Plugin

Enter the plugin name: **FirstBank** (or any name you prefer).

Click **Add & Edit Code**.

### Step 7 — Locate the Created Files

Wix will create a directory named **FirstBank** containing two files:

```text
backend/
  PaymentProvider/
    FirstBank/
      FirstBank.js
      FirstBank-config.js
```

Both files will open in the editor automatically.

### Step 8 — Copy Code to `FirstBank-config.js`

Open `src/FirstBank-config.js` from this repository.

Click **Copy raw file**, then paste the code into `FirstBank-config.js` in your Wix editor.

Delete all existing example code before pasting.

### Step 9 — Copy Code to `FirstBank.js`

Open `src/FirstBank.example.js` from this repository.

Paste the code into `FirstBank.js` in your Wix editor.

Delete all existing example code before pasting.

Replace all placeholder values:

```js
const MerchantID = merchantCredentials.MerchantID || "YOUR_MERCHANT_ID";
const TerminalID = merchantCredentials.TerminalID || "YOUR_TERMINAL_ID";
const merID      = merchantCredentials.merID      || "YOUR_MER_ID";
```

Also update the site URL:

```js
function getSiteUrl() {
  return "https://your-domain.com"; // Replace with your actual domain
}
```

### Step 10 — Add `http-functions.js` to the Backend Directory

In the **backend** section of the Velo editor, click the **(+) icon** and select **Expose Site API** to create `http-functions.js`.

> If `http-functions.js` already exists, paste the code below the existing content.

Copy the code from `src/http-functions.example.js` in this repository and paste it in.

Update the return URL constants:

```js
const RETURN_URL_SUCCESS = "https://your-domain.com/payment-success";
const RETURN_URL_FAILED  = "https://your-domain.com/payment-failed";
```

### Step 11 — Create Wix CMS Collections

Create two CMS collections in your Wix Dashboard. See [`docs/cms-collections.md`](docs/cms-collections.md) for full field definitions.

| Collection ID | Purpose |
|---|---|
| `FocasPendingOrders` | Stores pending payment data before redirect |
| `FocasOrders` | Stores payment results from FOCAS callback |

### Step 12 — Create Payment Result Pages

Create two pages in Wix with these URLs:

- `/payment-success`
- `/payment-failed`

### Step 13 — Publish Changes

Once all code is in place, click **Publish** in the Wix editor.

> ⚠️ Code changes in Wix are **not live until published**.

### Step 14 — Connect the Payment Provider

Go to your Wix Dashboard:

**Settings → Accept Payments → Connect Custom Payment Provider**

You should see **First Bank / FOCAS** listed. Click **Connect** and fill in your bank-issued credentials:

| Field | Description |
|---|---|
| MerchantID | Issued by First Bank |
| TerminalID | Issued by First Bank |
| merID | Issued by First Bank |
| MerchantName | Your store name |

---

## Files in This Repository

| File | Description |
|---|---|
| `src/FirstBank-config.js` | Wix Payment Provider configuration and credential fields |
| `src/FirstBank.example.js` | createTransaction(), connectAccount(), refundTransaction() |
| `src/http-functions.example.js` | focasRedirect and focasCallback HTTP functions |
| `examples/focas-html-form-example.html` | Standalone HTML form POST example for testing |
| `docs/setup-guide.md` | Detailed setup guide |
| `docs/cms-collections.md` | CMS collection field definitions |
| `docs/security-notes.md` | Security hardening checklist |

---

## Test Flow

```text
Wix Checkout
→ Select First Bank payment
→ /_functions/focasRedirect?lidm=...
→ FOCAS test payment page
→ Enter test card details
→ /_functions/focasCallback
→ /payment-success or /payment-failed
```

FOCAS test endpoint used in this reference:

```
https://www.focas-test.fisc.com.tw/FOCAS_WEBPOS/online/
```

---

## Production Checklist

Before going live, complete the following:

- [ ] Switch FOCAS URL from test to production: `https://www.focas.fisc.com.tw/FOCAS_WEBPOS/online/`
- [ ] Remove all hardcoded fallback credential values
- [ ] Implement `reqToken` / `respToken` validation (if provided by bank)
- [ ] Verify callback amount matches original order amount
- [ ] Add duplicate callback protection (check if order is already `PAID`)
- [ ] Restrict CMS collection permissions to **Admin only**
- [ ] Remove `pan` (card number) from CMS storage
- [ ] Confirm callback URL with First Bank
- [ ] Confirm `AutoCap` and `PayType` settings with First Bank
- [ ] Verify `submitEvent()` correctly updates Wix Orders status

---

## Security Notes

See [`docs/security-notes.md`](docs/security-notes.md) for a full security hardening guide.

Key points:

- The callback endpoint `/_functions/focasCallback` is **public** — implement token validation before production
- Compare `authAmt` from callback against original `purchAmt` before marking as paid
- Do **not** store full card numbers (`pan`) in production
- Use `suppressAuth: true` in backend only — do not expose CMS write access to public users

---

## Disclaimer

This project is **not** an official product of First Bank, FISC, or Wix.  
Use at your own risk. Verify all production requirements with your acquiring bank and Wix documentation.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
