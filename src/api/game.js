import request from './request'

export const getGameList = (inputData) => {
  const url = 'Game/GameList'
  const method = 'get'
  const data = {
    Skip: (inputData.page - 1) * inputData.count,
    Show: inputData.count,
    Field: 'FrontSort',
    OrderType: 'asc',
  }
  if (inputData?.gameProviderID) data.gameProviderID = inputData.gameProviderID
  if (inputData?.gameName) data.GameName = inputData.gameName

  return request({
    method,
    url,
    data,
  })
}

export const postGame = (inputData) => {
  const url = 'Game/AddGameInfo'
  const method = 'post'
  const data = {
    GameID: inputData.GameID,
    GameTypeID: inputData.GameTypeID,
    GameProviderID: inputData.GameProviderID,
    GameProviderGameID: inputData.GameProviderGameID,
    TraditionalChinese: inputData.TraditionalChinese,
  }

  return request({
    method,
    url,
    data,
  })
}

export const editGame = (inputData) => {
  const url = 'Game/EditGame'
  const method = 'post'
  const data = {
    GameID: inputData.GameID,
    GameTypeID: inputData.GameTypeID,
    GameProviderID: inputData.GameProviderID,
    GameProviderGameID: inputData.GameProviderGameID,
    TraditionalChinese: inputData.TraditionalChinese,
    FrontSort: inputData.FrontSort,
    GoldState: inputData.GoldState,
    SilverState: inputData.SilverState,
  }

  return request({
    method,
    url,
    data,
  })
}

export const changeGameMaintenance = (inputData) => {
  const url = 'Game/Um/Status'
  const method = 'post'
  const data = {
    GameID: inputData.GameID,
    MaintenanceStatus: inputData.MaintenanceStatus,
  }

  return request({
    method,
    url,
    data,
  })
}

export const getGameProviderMaintenance = (inputData) => {
  const url = `Game/Provider/${inputData.GameProviderID}/Um/Status`
  const method = 'get'

  return request({
    method,
    url,
    noCache: true,
  })
}

export const changeGameProviderMaintenance = (inputData) => {
  const url = 'Game/Provider/Um/Status'
  const method = 'post'
  const data = {
    GameProviderID: inputData.GameProviderID,
    MaintenanceStatus: inputData.MaintenanceStatus,
  }

  return request({
    method,
    url,
    data,
  })
}
