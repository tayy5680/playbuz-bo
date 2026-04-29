import {
  required as rawRequired,
  integer as rawInteger,
  numeric as rawNumeric,
  sameAs as rawSameAs,
  maxLength as rawMaxLength,
  minLength as rawMinLength,
  url as rawUrl,
} from '@vuelidate/validators/dist/raw.esm'

export function required () {
  return {
    $validator: rawRequired,
    $message: '必填',
  }
}

export function integer () {
  return {
    $validator: rawInteger,
    $message: '需為整數',
  }
}

export function numeric () {
  return {
    $validator: rawNumeric,
    $message: '需為數字',
  }
}

export function sameAs (equalTo, otherName) {
  return {
    $validator: rawSameAs(equalTo),
    $message: `需輸入相同${otherName}`,
  }
}

export function minLength (min) {
  return {
    $validator: rawMinLength(min),
    $message: `最小長度: ${min}`,
  }
}

export function maxLength (max) {
  return {
    $validator: rawMaxLength(max),
    $message: `最大長度: ${max}`,
  }
}

export function betweenLength (min, max) {
  return {
    $validator: rawBetweenLength(min, max),
    $message: `長度需為: ${min}-${max}`,
  }
}

export function url () {
  return {
    $validator: rawUrl,
    $message: '需符合網址格式',
  }
}

// 以下為custom驗證
function rawBetweenLength (min, max) {
  return (value) => !required(value) || (rawMinLength(min)(value) && rawMaxLength(max)(value))
}
