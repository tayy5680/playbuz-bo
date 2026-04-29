import request from './request'

export const postNewsGet = (inputData) => {
  const url = 'News/NewsGet'
  const method = 'post'
  const data = {
    NewsType: inputData.newsType,
    Skip: inputData.skip,
    Show: inputData.show,
    Field: inputData.field,
    OrderType: inputData.orderType,
    IsFuzzySearch: inputData.isFuzzySearch ? 0 : 1,
  }
  if (inputData.title) data.Title = inputData.title
  if (inputData.statusId.toString()) data.StatusId = inputData.statusId
  if (data.NewsType === 0 && inputData.newsTag) data.NewsTag = inputData.newsTag
  if (data.NewsType === 1 && inputData.newsPage) data.NewsPage = inputData.newsPage

  return request({
    method,
    url,
    data,
  })
}

export const getNewsTranslationGet = (inputData) => {
  const url = 'News/NewsTranslationGet'
  const method = 'get'
  const data = {
    NewsId: inputData.NewsId,
  }

  return request({
    method,
    url,
    data,
  })
}

// 公告連結開啟方式列表
export const getNewsOpenTypeGet = () => {
  const url = '/News/NewsOpenTypeGet'
  const method = 'get'

  return request({
    method,
    url,
  })
}

// 公告觸發頻率列表
export const getNewsTriggerTypeGet = () => {
  const url = '/News/NewsTriggerTypeGet'
  const method = 'get'

  return request({
    method,
    url,
  })
}

// 公告顯示頁面列表 (首頁、遊戲、商城、門市據點...)
export const getNewsPageGet = () => {
  const url = '/News/NewsPageGet'
  const method = 'get'

  return request({
    method,
    url,
  })
}

// 最新消息頁面的分類
export const getNewsTagGet = () => {
  const url = '/News/NewsTagGet'
  const method = 'get'

  return request({
    method,
    url,
  })
}

export const postNewsAdd = (inputData) => {
  const url = 'News/NewsAdd'
  const method = 'post'
  const data = new FormData()
  data.append('Title', inputData.Title)
  if (inputData.Content) data.append('Content', inputData.Content)
  data.append('StatusId', inputData.StatusId)
  if (inputData.StartTime) data.append('StartTime', inputData.StartTime)
  if (inputData.EndTime) data.append('EndTime', inputData.EndTime)
  data.append('NewsType', inputData.NewsType)
  data.append('OpenTypeId', inputData.OpenTypeId)
  data.append('TriggerTypeId', inputData.TriggerTypeId)

  if (inputData.NewsTag.length) {
    for (const [key, value] of Object.entries(inputData.NewsTag)) {
      data.append(`NewsTag[${key}]`, value)
    }
  }

  if (inputData.NewsPage.length) {
    for (const [key, value] of Object.entries(inputData.NewsPage)) {
      data.append(`NewsPage[${key}]`, value)
    }
  }

  for (const [index, value] of Object.entries(inputData.NewsTranslation)) {
    data.append(`NewsTranslation[${index}].Locale`, value.Locale)
    data.append(`NewsTranslation[${index}].Title`, value.Title)
    data.append(`NewsTranslation[${index}].MediaType`, value.MediaType)
    if (value.Content) data.append(`NewsTranslation[${index}].Content`, value.Content)
    if (value.ActionText) data.append(`NewsTranslation[${index}].ActionText`, value.ActionText)
    if (value.OpenUrlPc) data.append(`NewsTranslation[${index}].OpenUrlPc`, value.OpenUrlPc)
    if (value.OpenUrlMo) data.append(`NewsTranslation[${index}].OpenUrlMo`, value.OpenUrlMo)
    if (value.ImgPc.length) data.append(`NewsTranslation[${index}].ImgPc`, value.ImgPc[0].image)
    if (value.ImgMo.length) data.append(`NewsTranslation[${index}].ImgMo`, value.ImgMo[0].image)

    if (value.MediaType === 'video') {
      data.append(`NewsTranslation[${index}].ImgUrlPc`, value.videoPc)
      data.append(`NewsTranslation[${index}].ImgUrlMo`, value.videoMo)
    }
  }

  return request({
    method,
    url,
    data,
  })
}

// 更新公告
export const postNewsMod = (inputData) => {
  const url = 'News/NewsMod'
  const method = 'post'
  const data = {
    NewsType: inputData.NewsType,
    NewsId: inputData.NewsId,
    Title: inputData.Title,
    Content: inputData.Content,
    StatusId: inputData.StatusId,
    StartTime: inputData.StartTime ? inputData.StartTime : null,
    EndTime: inputData.EndTime ? inputData.EndTime : null,
    FrontSort: inputData.FrontSort,
    OpenTypeId: inputData.OpenTypeId,
    TriggerTypeId: inputData.TriggerTypeId,
  }

  return request({
    method,
    url,
    data,
  })
}

// 更新公告：NewsTranslation部分，多語系的更新
export const postNewsTranslationMod = (inputData) => {
  const url = 'News/NewsTranslationMod'
  const method = 'post'

  const data = new FormData()
  for (const [index, value] of Object.entries(inputData.NewsTranslation)) {
    data.append(`NewsTranslation[${index}].NewsId`, inputData.NewsId)
    if (value.Id) data.append(`NewsTranslation[${index}].Id`, value.Id)
    data.append(`NewsTranslation[${index}].Locale`, value.Locale)
    data.append(`NewsTranslation[${index}].Title`, value.Title)
    if (value.Content) data.append(`NewsTranslation[${index}].Content`, value.Content)
    if (value.ActionText) data.append(`NewsTranslation[${index}].ActionText`, value.ActionText)
    data.append(`NewsTranslation[${index}].ImgUrlPc`, value.MediaType === 'video' ? value.videoPc : value.ImgUrlPc ?? null)
    data.append(`NewsTranslation[${index}].ImgUrlMo`, value.MediaType === 'video' ? value.videoMo : value.ImgUrlMo ?? null)
    if (value.OpenUrlPc) data.append(`NewsTranslation[${index}].OpenUrlPc`, value.OpenUrlPc)
    if (value.OpenUrlMo) data.append(`NewsTranslation[${index}].OpenUrlMo`, value.OpenUrlMo)
    data.append(`NewsTranslation[${index}].MediaType`, value.MediaType)
    data.append(`NewsTranslation[${index}].ImgMo`, value.ImgMo?.[0]?.image ?? null)
    data.append(`NewsTranslation[${index}].ImgPc`, value.ImgPc?.[0]?.image ?? null)
  }

  return request({
    method,
    url,
    data,
  })
}

// 更新公告：NewsPage的部分
export const postNewsPageMod = (inputData) => {
  const url = 'News/NewsPageMod'
  const method = 'post'
  const data = {
    NewsId: inputData.NewsId,
    NewsPage: inputData.NewsPage,
  }

  return request({
    method,
    url,
    data,
  })
}

// 更新公告：NewsTag的部分
export const postNewsTagMod = (inputData) => {
  const url = 'News/NewsTagMod'
  const method = 'post'
  const data = {
    NewsId: inputData.NewsId,
    NewsTag: inputData.NewsTag,
  }

  return request({
    method,
    url,
    data,
  })
}

// 贈點設定取得
export const getRewardPoint = () => {
  const url = '/Transaction/Get?test=123'
  const method = 'get'

  return request({
    method,
    url,
  })
}
// 贈點設定更新
export const updateRewardPoint = (inputData) => {
  const url = '/Transaction/Update'
  const method = 'post'
  const data = {
    ...inputData,
  }

  return request({
    method,
    url,
    data,
  })
}
