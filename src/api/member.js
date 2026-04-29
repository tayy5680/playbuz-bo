import request from './request'

export const getMemberList = (inputData) => {
  const url = 'Member/MemberList'
  const method = 'get'
  const data = {
    IsFuzzySearch: inputData.isFuzzySearch,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'CreateTime',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.UpMemberID !== undefined && inputData.UpMemberID !== '') data.UpMemberID = inputData.UpMemberID
  if (inputData.LV !== undefined && inputData.LV !== '') data.LV = inputData.LV
  if (inputData.StatusID !== undefined && inputData.StatusID !== '') data.StatusID = inputData.StatusID
  if (inputData.MemberID !== undefined && inputData.MemberID !== '') data.MemberID = inputData.MemberID
  if (inputData.PhoneNumber !== undefined && inputData.PhoneNumber !== '') data.PhoneNumber = inputData.PhoneNumber
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.LoginIp !== undefined && inputData.LoginIp !== '') data.LoginIp = inputData.LoginIp
  if (inputData.IsGuest !== undefined && inputData.IsGuest !== '') data.IsGuest = inputData.IsGuest
  if (inputData.Email !== undefined && inputData.Email !== '') data.Email = inputData.Email

  return request({
    method,
    url,
    data,
  })
}
export const getMemberbyInput = (inputData) => {
  const url = 'Infos/MemberInfo'
  const method = 'post'
  const data = {}
  if (inputData.NickName) data.NickNameLike = inputData.NickName
  if (inputData.Email) data.Email = inputData.Email
  if (inputData.MemberID !== undefined && inputData.MemberID !== '') data.MemberId = inputData.MemberID

  return request({
    method,
    url,
    data,
  })
}

export const getCustomerServiceChangeRecord = (inputData, noCache) => {
  const url = 'Member/CustomerServiceChangeRecord'
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
  if (inputData.UUID !== undefined && inputData.UUID !== '') data.UUID = inputData.UUID
  if (inputData.PhoneNumber !== undefined && inputData.PhoneNumber !== '') data.PhoneNumber = inputData.PhoneNumber
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.Email !== undefined && inputData.Email !== '') data.Email = inputData.Email

  return request({
    method,
    url,
    data,
    noCache,
  })
}

export const postCustomerServiceChange = (inputData) => {
  const url = 'Member/CustomerServiceChange'
  const method = 'post'
  const data = {
    MemberID: inputData.MemberID,
    PointTypeID: inputData.PointTypeID,
    Point: inputData.Point,
    Note: inputData.Note,
  }

  return request({
    method,
    url,
    data,
  })
}

export const getAdvertiserDropdown = (inputData) => {
  const url = 'Member/AdBriefList'
  const method = 'get'
  const data = {
    // MemberID: inputData?.MemberID ?? 1,
    Skip: 0,
    Show: 999,
    Field: inputData?.field ?? 'CreateTime',
    OrderType: inputData?.orderType ?? 'desc',
  }

  return request({
    method,
    url,
    data,
  })
}

export const getGameAccounts = (inputData) => {
  const url = 'Infos/GameAccounts'
  const method = 'get'
  const data = {
    MemberID: inputData.MemberID,
  }

  return request({
    method,
    url,
    data,
  })
}

export const getInfosSmsVerifications = () => {
  const url = 'Infos/SmsVerifications'
  const method = 'get'

  return request({
    method,
    url,
  })
}

export const getInfosEmailVerifications = () => {
  const url = 'Infos/EmailVerifications'
  const method = 'get'

  return request({
    method,
    url,
  })
}

// 停用或啟用會員
export const updateMemberStatus = (inputData) => {
  const url = '/Member/StatusIDUpdate'
  const method = 'post'

  return request({
    method,
    url,
    data: { ...inputData },
  })
}

// 會員狀態更新紀錄
export const getMemberStatusUpdateRecord = (inputData) => {
  const url = '/Member/StatusIDUpdateRecord'
  const method = 'get'

  return request({
    method,
    url,
    data: { ...inputData },
  })
}
