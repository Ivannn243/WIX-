# WIX-
這是一個 Wix Velo 串接第一銀行／財金資訊 FOCAS 信用卡收單系統的範例專案，示範如何使用 Wix Payment Provider Service Plugin、HTTP Functions、HTML Form POST 與 WiS 完成外部金流導向與付款結果回傳。x CM

# Wix × First Bank FOCAS Payment Provider

This project demonstrates how to integrate First Bank / FISC FOCAS credit card payment flow with Wix Velo Payment Provider Service Plugin.

## Features

- Wix Payment Provider Service Plugin structure
- Hosted payment page redirect flow
- HTML Form POST redirect to FOCAS
- Wix HTTP Functions callback handler
- Wix CMS transaction logging
- Success / failed payment return pages
- Optional Wix Orders payment status update via submitEvent

## Important

This repository is for educational and integration reference only.

Do not commit real merchant credentials, bank credentials, reqToken verification keys, callback secrets, or production transaction records.

## Required Wix CMS Collections

### FocasPendingOrders

| Field ID | Type |
|---|---|
| title | Text |
| lidm | Text |
| wixTransactionId | Text |
| focasParams | Text |
| status | Text |
| createdAt | Text |
| redirectedAt | Text |
| callbackAt | Text |
| submitEventStatus | Text |
| submitEventAt | Text |
| submitEventError | Text |

### FocasOrders

| Field ID | Type |
|---|---|
| title | Text |
| orderId | Text |
| status | Text |
| focasStatus | Text |
| authCode | Text |
| errCode | Text |
| errDesc | Text |
| authAmt | Text |
| cardBrand | Text |
| lastPan4 | Text |
| pan | Text |
| authRespTime | Text |
| merID | Text |
| xid | Text |
| rawBody | Text |
| rawParams | Text |
| updatedAt | Text |

## Environment Setup

Replace the placeholders in the example files:

```js
YOUR_SITE_URL
YOUR_MERCHANT_ID
YOUR_TERMINAL_ID
YOUR_MER_ID
YOUR_STORE_NAME
