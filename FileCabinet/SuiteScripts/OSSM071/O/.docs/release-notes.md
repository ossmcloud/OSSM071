# OSSM NSDK - Release Notes

## v1.1 [2023.01.11]
> NOTE: this version was upgraded from v1.0 and has a number of new features  as long as deprecated ones and code breaking changing.

---

## CODE BREAKING CHANGES:

- core.accountId
  >it is now a function, to fix: find "core.accountId" and replace with "core.accountId()" across all project(s)
- core.log
  >deprecated (method still there but does nothing)
- core.downloadText
  >moved to modal.js
- coreSvc.getLatestLogInfo
  >changed to renderLatestLogInfo
- cored.formatNs
  >deprecated (method no longer there)
- cored.nsParse
  >deprecated (method no longer there)
- cored.nsFormat
  >deprecated (method no longer there)
- customRec.getNsReccord
  >changed to getNsRecord

---

## LIST OF CHANGES BY MODULE

### core.js
- [NEW]       core.microSvc               =>  for now only read/write file
- [NEW]       core.isDate(value)
- [NEW]       core.toInt(value)
- [NEW]       core.formatNumber           =>  also Number.prototype.formatNumber
- [NEW]       core.formatMoney            =>  also Number.prototype.formatMoney
- [NEW]       core.getUnits()
- [CHANGE]    core.each                   =>  added _this parameter
- [CHANGE]    core.loop                   =>  added _this parameter
- [REMOVED]   core.log
- [NEW] ```core.url = { app(), record(), script, scriptEx }```

---

### core.date.js
- [NEW]       cored.WeekDays
- [NEW]       cored.WeekDaysJS
- [NEW]       cored.formatSerial
- [NEW]       cored.formatPad
- [CHANGED]   cored.format                => CODE BREAKING ???        
    > NOTE: ***DAY AND MONTH ARE NO LONGER PADDED BY DEFAULT*** use cored.formatPad instead
- [REMOVED]   cored.formatNs              => CODE BREAKING
- [REMOVED]   cored.nsParse               => CODE BREAKING
- [REMOVED]   cored.nsFormat              => CODE BREAKING- 

---

### data\customRec.js
- [CHANGE]    customRec.getNsReccord

---

### data\rec.search.js

- [CHANGE]    src.each                    => has index in callback + _this
- [CHANGE]    src.first                   => fixed, was returning last
- [NEW]       src.eachEx
- [NEW]       src.getResult
- [NEW]       src.getFolder
- [NEW]       src.getNSFolder

---

### data\rec.utils.js

- [NEW]       recu.getList
- [NEW]       recu.getListText
- [NEW]       recu.setList
- [NEW]       recu.receivePurchOrder
- [NEW]       recu.fulfilSalesOrder
- [NEW]       recu.completeWorkOrder
- [NEW]       recu.countList
- [NEW]       recu.getListRecord- 
- [CHANGE]    recu.NsRecord            => ignoreFieldChange is false by default- 

---

### ui\form.js.js

- [NEW]       form.setFieldDisabled
- [NEW]       form.setFieldHidden
- [NEW]       form.setFieldInline
- [NEW]       form.setFieldEditable
- [NEW]       form.addSublistField
- [NEW]       form.addTextArea
- [NEW]       form.getButton
- [NEW]       form.hideButton
- [NEW]       form.initBanner
- [NEW]       form.initInfoBanner
- [NEW]       form.initOkBanner
- [NEW]       form.initWarnBanner
- [NEW]       form.initErrorBanner

