Wix CMS Collections
This project uses two Wix CMS collections to track payment state.

1. FocasPendingOrders
Collection ID: FocasPendingOrders
Stores pending payment data between the time a transaction is created and the FOCAS callback is received.
Field NameField IDTypeTitletitleTextlidmlidmTextWix Transaction IDwixTransactionIdTextFOCAS ParamsfocasParamsTextStatusstatusTextCreated AtcreatedAtTextRedirected AtredirectedAtTextCallback AtcallbackAtTextSubmit Event StatussubmitEventStatusTextSubmit Event AtsubmitEventAtTextSubmit Event ErrorsubmitEventErrorText
Status Values
ValueMeaningCREATEDTransaction created, not yet redirectedREDIRECTEDCustomer sent to FOCAS payment pagePAIDCallback received, payment successfulFAILEDCallback received, payment failed
submitEventStatus Values
ValueMeaningSUBMITTEDsubmitEvent() called successfullyFAILEDsubmitEvent() threw an errorSKIPPED_NO_WIX_TRANSACTION_IDMissing wixTransactionIdSKIPPED_PAYMENT_FAILEDPayment failed, submitEvent() not calledSKIPPED_NO_PENDING_ORDERPending order not found for this lidmFAILED_INTERNALInternal error before submitEvent()

2. FocasOrders
Collection ID: FocasOrders
Stores the final payment result received from the FOCAS callback.
Field NameField IDTypeTitletitleTextOrder IDorderIdTextStatusstatusTextFOCAS StatusfocasStatusTextAuth CodeauthCodeTextError CodeerrCodeTextError DescriptionerrDescTextAuthorized AmountauthAmtTextCard BrandcardBrandTextLast 4 DigitslastPan4TextPANpanTextAuth Response TimeauthRespTimeTextMerchant IDmerIDTextXIDxidTextRaw BodyrawBodyTextRaw ParamsrawParamsTextUpdated AtupdatedAtText

⚠️ Production note: Remove pan (full card number) from this collection before going live. Do not store raw card data in production.


Permissions
For testing, you may use looser permissions temporarily.
For production, set all permissions to Admin only:
PermissionSettingReadAdminCreateAdminUpdateAdminDeleteAdmin
The backend code uses { suppressAuth: true } so public users do not need direct CMS write access.
