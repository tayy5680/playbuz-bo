import request from './request'

export const getAdvertiserData = () => {
  const url = 'Home/AdvertisersData'
  const method = 'get'

  return request({
    method,
    url,
  })
}

export const getAdvertiserDataByMemberID = (inputData) => {
  const url = 'Member/AdvertisersInfo'
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

export const getAdvertiserPath = (inputData) => {
  const url = 'Member/AdvertisersPath'
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

export const getAdvertiserList = (inputData) => {
  const url = 'Member/AdvertisersList'
  const method = 'get'
  const data = {
    IsFuzzySearch: inputData.isFuzzySearch,
    SearchDescents: false,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'CreateTime',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.MemberID !== undefined && inputData.MemberID !== '') data.MemberID = inputData.MemberID
  if (inputData.LoginIp !== undefined && inputData.LoginIp !== '') data.LoginIp = inputData.LoginIp
  if (inputData.PhoneNumber !== undefined && inputData.PhoneNumber !== '') data.PhoneNumber = inputData.PhoneNumber
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.UpMemberId !== undefined && inputData.UpMemberId !== '') data.UpMemberId = inputData.UpMemberId
  if (inputData.Email !== undefined && inputData.Email !== '') data.Email = inputData.Email

  return request({
    method,
    url,
    data,
  })
}

export const inviteAdvertiser = (inputData) => {
  const url = 'Member/InviteFranchisee'
  const method = 'post'
  const data = {
    Greeting: inputData.Greeting,
  }
  if (inputData.UpMemberID !== undefined && inputData.UpMemberID !== '') data.UpMemberID = inputData.UpMemberID

  return request({
    method,
    url,
    data,
  })
}

export const advertiserPasswordChange = (inputData) => {
  const url = 'Member/Password'
  const method = 'post'
  const data = {
    MemberID: inputData.MemberID,
    Password: inputData.Password,
  }

  return request({
    method,
    url,
    data,
  })
}

export const getPromoteLinkList = (inputData, noCache) => {
  const url = 'DataReport/PromoteReport'
  const method = 'get'
  const data = {
    StatusID: inputData.StatusID,
    IsFuzzySearch: inputData.isFuzzySearch,
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: inputData.field ?? 'CreateTime',
    OrderType: inputData.orderType ?? 'desc',
  }
  if (inputData.sDate !== undefined && inputData.sDate !== '') data.sDate = inputData.sDate
  if (inputData.eDate !== undefined && inputData.eDate !== '') data.eDate = inputData.eDate
  if (inputData.AdID !== undefined && inputData.AdID !== '') data.AdID = inputData.AdID
  if (inputData.MemberID !== undefined && inputData.MemberID !== '') data.MemberID = inputData.MemberID
  if (inputData.PromoteCode !== undefined && inputData.PromoteCode !== '') data.PromoteCode = inputData.PromoteCode
  if (inputData.MemberAccount !== undefined && inputData.MemberAccount !== '') data.MemberAccount = inputData.MemberAccount
  if (inputData.NickName !== undefined && inputData.NickName !== '') data.NickName = inputData.NickName
  if (inputData.Email !== undefined && inputData.Email !== '') data.Email = inputData.Email

  return request({
    method,
    url,
    data,
    noCache,
  })
}

export const editPromoteLink = (inputData) => {
  const url = 'Promote/Edit'
  const method = 'post'
  const data = {
    PromoteID: inputData.PromoteID,
  }
  // 空字串可以被允許
  if (inputData.Note !== undefined) data.Note = inputData.Note
  if (inputData.StatusID !== undefined && inputData.StatusID !== '') data.StatusID = inputData.StatusID

  return request({
    method,
    url,
    data,
  })
}

export const deletePromoteLink = (inputData) => {
  const url = 'Promote/Delete'
  const method = 'post'
  const data = {
    PromoteID: inputData.PromoteID,
  }

  return request({
    method,
    url,
    data,
  })
}

export const getPromoteCode = () => {
  const url = 'Promote/NewCode'
  const method = 'get'

  return request({
    method,
    url,
  })
}

export const postPromoteCode = (inputData) => {
  const url = 'Promote/Add'
  const method = 'POST'
  const data = {
    MemberID: inputData.MemberID,
    PromoteCode: inputData.PromoteCode,
    Note: inputData.Note,
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
