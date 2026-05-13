# Wix CMS Collections

This project uses two Wix CMS collections to track payment state.

---

## 1. FocasPendingOrders

**Collection ID:** `FocasPendingOrders`

Stores pending payment data between the time a transaction is created and the FOCAS callback is received.

| Field Name | Field ID | Type |
|---|---|---|
| Title | `title` | Text |
| lidm | `lidm` | Text |
| Wix Transaction ID | `wixTransactionId` | Text |
| FOCAS Params | `focasParams` | Text |
| Status | `status` | Text |
| Created At | `createdAt` | Text |
| Redirected At | `redirectedAt` | Text |
| Callback At | `callbackAt` | Text |
| Submit Event Status | `submitEventStatus` | Text |
| Submit Event At | `submitEventAt` | Text |
| Submit Event Error | `submitEventError` | Text |

### Status Values

| Value | Meaning |
|---|---|
| `CREATED` | Transaction created, not yet redirected |
| `REDIRECTED` | Customer sent to FOCAS payment page |
| `PAID` | Callback received, payment successful |
| `FAILED` | Callback received, payment failed |

### submitEventStatus Values

| Value | Meaning |
|---|---|
| `SUBMITTED` | submitEvent() called successfully |
| `FAILED` | submitEvent() threw an error |
| `SKIPPED_NO_WIX_TRANSACTION_ID` | Missing wixTransactionId |
| `SKIPPED_PAYMENT_FAILED` | Payment failed, submitEvent() not called |
| `SKIPPED_NO_PENDING_ORDER` | Pending order not found for this lidm |
| `FAILED_INTERNAL` | Internal error before submitEvent() |

---

## 2. FocasOrders

**Collection ID:** `FocasOrders`

Stores the final payment result received from the FOCAS callback.

| Field Name | Field ID | Type |
|---|---|---|
| Title | `title` | Text |
| Order ID | `orderId` | Text |
| Status | `status` | Text |
| FOCAS Status | `focasStatus` | Text |
| Auth Code | `authCode` | Text |
| Error Code | `errCode` | Text |
| Error Description | `errDesc` | Text |
| Authorized Amount | `authAmt` | Text |
| Card Brand | `cardBrand` | Text |
| Last 4 Digits | `lastPan4` | Text |
| PAN | `pan` | Text |
| Auth Response Time | `authRespTime` | Text |
| Merchant ID | `merID` | Text |
| XID | `xid` | Text |
| Raw Body | `rawBody` | Text |
| Raw Params | `rawParams` | Text |
| Updated At | `updatedAt` | Text |

> ⚠️ **Production note:** Remove `pan` (full card number) from this collection before going live. Do not store raw card data in production.

---

## Permissions

For testing, you may use looser permissions temporarily.

For production, set all permissions to **Admin only**:

| Permission | Setting |
|---|---|
| Read | Admin |
| Create | Admin |
| Update | Admin |
| Delete | Admin |

The backend code uses `{ suppressAuth: true }` so public users do not need direct CMS write access.
