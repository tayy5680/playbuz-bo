import request from './request'

export const signIn = (data) => {
  const url = 'Token/SignIn'
  const method = 'post'
  const outData = {
    Account: data.account,
    Password: data.password,
    Device: data.device,
  }

  return request({
    method,
    url,
    data: outData,
  })
}

export const reissueToken = (data) => {
  const url = 'Token/ReissueAccessToken'
  const method = 'post'
  const outData = {
    RefreshToken: data.refreshToken,
  }

  return request({
    method,
    url,
    data: outData,
  })
}

export const signOut = (data) => {
  const url = 'Token/SignOut'
  const method = 'get'
  const outData = {
    RefreshToken: data.refreshToken,
  }

  return request({
    method,
    url,
    data: outData,
  })
}

export const getMenu = () => {
  const url = 'Token/Menu'
  const method = 'get'

  return request({
    method,
    url,
  })
}

export const passwordChange = (inputData) => {
  const url = 'Member/Password'
  const method = 'post'
  const data = {
    Password: inputData.Password,
  }

  return request({
    method,
    url,
    data,
  })
}

export const getLocale = () => {
  const url = '/Token/Locale'
  const method = 'get'

  return request({
    method,
    url,
  })
}
