export const MENU_LIST = [
  // {
  //   code: 0,
  //   name: '帳號管理',
  //   icon: 'el-icon-user-solid',
  //   children: [
  //   ],
  // },
  {
    code: 1,
    name: '廣告加盟商管理',
    icon: 'el-icon-s-marketing',
    path: 'advertiser',
    children: [
      {
        code: 0,
        name: '廣告加盟商列表',
        path: '/advertiser/advertiser-list',
      },
      {
        code: 0,
        name: '推廣連結管理',
        path: '/advertiser/promote-link-list',
      },
      {
        code: 1,
        name: '加盟商等級確認',
        path: '/advertiser/advertiser-level-confirm',
      },
    ],
  },
  {
    code: 2,
    name: '會員管理',
    icon: 'el-icon-user',
    path: 'member',
    children: [
      {
        code: 0,
        name: '會員列表',
        path: '/member/member-list',
      },
      {
        code: 1,
        name: '補/扣點紀錄查詢',
        path: '/member/cs-point-change-record',
      },
      {
        code: 2,
        name: '會員驗證碼查詢',
        path: '/member/message-record',
      },
    ],
  },
  // {
  //   code: 4,
  //   name: '禮包管理',
  //   icon: 'el-icon-user-solid',
  //   children: [
  //   ],
  // },
  {
    code: 5,
    name: '遊戲管理',
    icon: 'el-icon-coordinate',
    path: 'game',
    children: [
      {
        code: 0,
        name: '遊戲列表',
        path: '/game/game-list',
      },
    ],
  },
  {
    code: 6,
    name: '報表管理',
    icon: 'el-icon-s-order',
    path: 'report',
    children: [
      {
        code: 0,
        name: '會員點數異動紀錄',
        path: '/report/member-wallet-change',
      },
      {
        code: 2,
        name: '會員儲值紀錄',
        path: '/report/member-deposit',
      },
      {
        code: 1,
        name: '儲值報表',
        path: '/report/deposit',
      },
      {
        code: 4,
        name: '會員交易紀錄',
        path: '/report/member-transaction',
      },
      {
        code: 3,
        name: '會員礦機領取紀錄',
        path: '/report/member-mining-receipts',
      },
      // {
      //   code: 5,
      //   name: '礦機報表',
      //   path: '/report/mining-report',
      // },
    ],
  },
]

export const CHANGE_TYPE_LIST = [
  { id: 4, name: '遊戲輸贏' },
  { id: 5, name: '儲值禮包入點' },
  { id: 6, name: '礦機提領' },
  { id: 8, name: '遊戲輸贏-異常' },
  { id: 11, name: '人工補扣點' },
  // 贈點交易
  { id: 13, name: '會員交易-異常' },
  { id: 14, name: '會員交易-贈禮' },
  { id: 16, name: '會員交易-接收' },
  // 活動
  { id: 1001, name: '簽到送禮' },
  { id: 1005, name: '簽到送禮-碎片兌換' },
  { id: 1100, name: '活動抽獎-扣點' },
  { id: 1101, name: '活動抽獎-獎勵' },
  // 轉帳錢包
  { id: 8000, name: '遊戲轉帳' },
  { id: 8001, name: '錢包金額補正' },
]

export const PACKAGE_TYPE_LIST = [
  { id: 1, name: '常駐' },
  { id: 2, name: '週期限時' },
  { id: 3, name: '活動限時' },
]

export const POINT_TYPE_LIST = [
  { id: 1, PointType: 'GoldPoint', name: '金幣' },
  { id: 2, PointType: 'SilverPoint', name: '銀幣' },
]

export const BONUS_TYPE_LIST = [
  { id: 0, name: '礦機-初代' },
  { id: 1, name: '金幣' },
  { id: 2, name: '銀幣' },
  { id: 3, name: '經驗' },
  { id: 4, name: '背包-罐頭' },
  // 活動
  { id: 10001, name: '神奇香包' },
]

export const CONDITION_ID_LIST = [
  { id: 0, name: '無' },
  { id: 1, name: '購買次數' },
  { id: 2, name: 'VIP等級' },
]

export const GAME_TYPE_LIST = [
  { id: 1, name: 'Slot' },
  { id: 2, name: 'Chess' },
  { id: 3, name: 'Battle' },
]

export const PAY_TYPE_LIST = [
  { id: 1, name: 'ATM' },
  { id: 2, name: 'VISA' },
  { id: 3, name: '超商' },
  { id: 5, name: '小額付款' },
]

export const GAME_PROVIDER_LIST = [
  { id: 1, name: 'VA電子', key: 'VA' },
  { id: 3, name: 'VA對戰', key: 'VABattle' },
  { id: 4, name: 'iFun', key: 'IFUN' },
  { id: 5, name: 'MK', key: 'MK' },
  { id: 6, name: 'MK礦寵', key: 'MK Pet' },
  { id: 10, name: 'Cofun', key: 'CofunLive' },
]

export const AD_TYPE_LIST = [
  { id: 1, name: '總廣告商' },
  { id: 2, name: '特約經銷' },
  { id: 3, name: '區域總經銷' },
  { id: 4, name: '廣告代理' },
]

export const AD_TYPE_INCLUDE_MEMBER_LIST = [
  ...AD_TYPE_LIST,
  { id: 11, name: '廣告商下線會員' },
  { id: 12, name: '會員下線會員' },
]

export const ENABLE_LIST = [
  { value: true, name: '開啟' },
  { value: false, name: '關閉' },
]

export const VIP_LEVEL_LIST = [
  { id: 0, name: 'VIP 0' },
  { id: 1, name: 'VIP 1' },
  { id: 2, name: 'VIP 2' },
  { id: 3, name: 'VIP 3' },
  { id: 4, name: 'VIP 4' },
  { id: 5, name: 'VIP 5' },
  { id: 6, name: 'VIP 6' },
  { id: 7, name: 'VIP 7' },
  { id: 8, name: 'VIP 8' },
  { id: 9, name: 'VIP 9' },
  { id: 10, name: 'VIP 10' },
  { id: 11, name: 'VIP 11' },
  { id: 12, name: 'VIP 12' },
  { id: 13, name: 'VIP 13' },
  { id: 14, name: 'VIP 14' },
  { id: 15, name: 'VIP 15' },
  { id: 16, name: 'VIP 16' },
]
