import request from './request'

export const getDepositReport = (inputData) => {
  const url = 'DataReport/DepositReport'
  const method = 'get'
  const data = {
    PayTypeID: inputData.payTypeId,
    sDate: inputData.startDate,
    eDate: inputData.endDate,
    Skip: (inputData.page - 1) * inputData.count ?? 0,
    Show: inputData.count,
    Field: inputData.field ?? 'Date',
    OrderType: inputData.orderType ?? 'desc',
  }

  return request({
    method,
    url,
    data,
  })
}

export const getMemberDepositReport = (inputData) => {
  const url = 'DataReport/MemberDepositReport'
  const method = 'get'
  const data = {
    sDate: inputData.startDate,
    eDate: inputData.endDate,
    IsFuzzySearch: inputData.isFuzzySearch,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'Date',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.StoredStatusID !== undefined && inputData.StoredStatusID !== '') data.StoredStatusID = inputData.StoredStatusID
  if (inputData.PhoneNumber !== undefined && inputData.PhoneNumber !== '') data.PhoneNumber = inputData.PhoneNumber
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.TransID !== undefined && inputData.TransID !== '') data.TransID = inputData.TransID
  if (inputData.SESS_ID !== undefined && inputData.SESS_ID !== '') data.SESS_ID = inputData.SESS_ID
  if (inputData.InvoiceNumber !== undefined && inputData.InvoiceNumber !== '') data.InvoiceNumber = inputData.InvoiceNumber
  if (inputData.Email !== undefined && inputData.Email !== '') data.Email = inputData.Email

  return request({
    method,
    url,
    data,
  })
}

export const getInvoiceDetail = (inputData) => {
  const url = 'DataReport/InvoiceDetail'
  const method = 'get'
  const data = {
    TransID: inputData.transId,
  }

  return request({
    method,
    url,
    data,
  })
}

// 會員儲值紀錄，手動履約
export const completeOrder = (inputData) => {
  const url = '/ElectronicMall/CompleteOrder'
  const method = 'post'
  const data = {
    OrderID: inputData.TransID,
  }

  return request({
    method,
    url,
    data,
  })
}

export const getMemberWalletChangeReport = (inputData) => {
  const url = 'DataReport/WalletChangeReport'
  const method = 'get'
  const data = {
    sDate: inputData.startDate,
    eDate: inputData.endDate,
    PointTypeID: inputData.pointTypeId,
    ChangeTypeID: inputData.changeTypeId,
    IsFuzzySearch: inputData.isFuzzySearch,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'CreateTime',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.MemberID !== undefined && inputData.MemberID !== '') data.MemberID = inputData.MemberID
  if (inputData.PhoneNumber !== undefined && inputData.PhoneNumber !== '') data.PhoneNumber = inputData.PhoneNumber
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.IsGuest !== undefined && inputData.IsGuest !== '') data.IsGuest = inputData.IsGuest
  if (inputData.Email !== undefined && inputData.Email !== '') data.Email = inputData.Email

  return request({
    method,
    url,
    data,
  })
}

export const getMemberMiningReceipts = (inputData) => {
  const url = 'DataReport/MiningReceipts'
  const method = 'get'
  const data = {
    sDate: inputData.startDate,
    eDate: inputData.endDate,
    IsFuzzySearch: inputData.isFuzzySearch,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'CreateTime',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.MemberID !== undefined && inputData.MemberID !== '') data.MemberID = inputData.MemberID
  if (inputData.PhoneNumber !== undefined && inputData.PhoneNumber !== '') data.PhoneNumber = inputData.PhoneNumber
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.Email !== undefined && inputData.Email !== '') data.Email = inputData.Email

  return request({
    method,
    url,
    data,
  })
}

export const getMiningReport = (inputData) => {
  const url = 'DataReport/MiningReport'
  const method = 'get'
  const data = {
    TargetType: inputData.TargetType,
    sDate: inputData.startDate,
    eDate: inputData.endDate,
    IsFuzzySearch: inputData.isFuzzySearch,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'MemberID',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.MemberAccount !== undefined && inputData.MemberAccount !== '') data.MemberAccount = inputData.MemberAccount
  if (inputData.UpMemberID !== undefined && inputData.UpMemberID !== '') data.UpMemberID = inputData.UpMemberID
  if (inputData.MemberID !== undefined && inputData.MemberID !== '') data.MemberID = inputData.MemberID
  if (inputData.PhoneNumber !== undefined && inputData.PhoneNumber !== '') data.PhoneNumber = inputData.PhoneNumber
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.IsGuest !== undefined && inputData.IsGuest !== '') data.IsGuest = inputData.IsGuest
  if (inputData.IsActive !== undefined && inputData.IsActive !== '') data.IsActive = inputData.IsActive

  return request({
    method,
    url,
    data,
  })
}

export const getMemberTranstionRecord = (inputData) => {
  const url = 'DataReport/TransactionRecord'
  const method = 'get'
  const data = {
    PointTypeID: inputData.PointTypeID,
    sDate: inputData.startDate,
    eDate: inputData.endDate,
    IsFuzzySearch: inputData.isFuzzySearch,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'CreateTime',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.StartUpMemberID !== undefined && inputData.StartUpMemberID !== '') data.StartUpMemberID = inputData.StartUpMemberID
  if (inputData.StartPhoneNumber !== undefined && inputData.StartPhoneNumber !== '') data.StartPhoneNumber = inputData.StartPhoneNumber
  if (inputData.StartNickName !== undefined && inputData.StartNickName !== '') data.StartNickName = inputData.StartNickName
  if (inputData.AcceptUpMemberID !== undefined && inputData.AcceptUpMemberID !== '') data.AcceptUpMemberID = inputData.AcceptUpMemberID
  if (inputData.AcceptPhoneNumber !== undefined && inputData.AcceptPhoneNumber !== '') data.AcceptPhoneNumber = inputData.AcceptPhoneNumber
  if (inputData.AcceptNickName !== undefined && inputData.AcceptNickName !== '') data.AcceptNickName = inputData.AcceptNickName
  if (inputData.StartTransactionEmail !== undefined && inputData.StartTransactionEmail !== '') data.StartTransactionEmail = inputData.StartTransactionEmail
  if (inputData.AcceptEmail !== undefined && inputData.AcceptEmail !== '') data.AcceptEmail = inputData.AcceptEmail

  return request({
    method,
    url,
    data,
  })
}

// 取得廣告商等級趨勢報表
export const getDataReportAdLvReport = (inputData) => {
  const url = 'DataReport/AdLvReport'
  const method = 'get'
  const data = {
    sDate: inputData.sDate,
    eDate: inputData.eDate,
    GroupBy: inputData.GroupBy,
  }

  return request({
    method,
    url,
    data,
  })
}

// 取得廣告商等級重置記錄
export const getDataReportAdLvResetGet = (inputData) => {
  const url = 'DataReport/AdLvResetGet'
  const method = 'get'
  const data = {}
  if (inputData?.MemberID) data.MemberID = inputData.MemberID
  if (inputData?.ApplySTime) data.ApplySTime = inputData.ApplySTime
  if (inputData?.ApplyETime) data.ApplyETime = inputData.ApplyETime
  if (inputData?.Account) data.Account = inputData.Account
  if (inputData?.NickName) data.NickName = inputData.NickName
  if (inputData?.ApplyStatus) data.ApplyStatus = inputData.ApplyStatus

  return request({
    method,
    url,
    data,
  })
}

// 新增廣告商等級重置
export const getDataReportAdLvResetAdd = (inputData) => {
  const url = 'DataReport/AdLvResetAdd'
  const method = 'post'
  const data = {
    Note: inputData.Note,
  }

  return request({
    method,
    url,
    data,
  })
}

// 修改廣告商等級重置
export const getDataReportAdLvResetMod = (inputData) => {
  const url = 'DataReport/AdLvResetMod'
  const method = 'post'
  const data = {
    Id: inputData.Id,
    ApplyStatus: inputData.ApplyStatus,
    Note: inputData.Note,
  }

  return request({
    method,
    url,
    data,
  })
}
// 遊戲報表
export const getGameResultReport = (inputData) => {
  const url = 'DataReport/GameResultReport'
  const method = 'get'
  const data = {
    GameProvider: inputData.gameProviderID,
    sDate: inputData.sDate,
    eDate: inputData.eDate,
  }

  return request({
    method,
    url,
    data,
  })
}
