export const routes = [
  { path: '/sign-in', name: 'SignIn', component: () => import('@/views/SignIn/index.vue') },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/Dashboard/index.vue') },
      // advertiser
      { path: 'advertiser/advertiser-list', name: 'advertiser/advertiser-list', component: () => import('@/views/advertiser/AdvertiserList/index.vue') },
      { path: 'advertiser/promote-link-list', name: 'advertiser/promote-link-list', component: () => import('@/views/advertiser/PromoteLinkList/index.vue') },
      { path: 'advertiser/advertiser-level-confirm', name: 'advertiser/advertiser-level-confirm', component: () => import('@/views/advertiser/AdvertiserLevelConfirm/index.vue') },
      // member
      { path: 'member/member-list', name: 'member/member-list', component: () => import('@/views/member/MemberList/index.vue') },
      { path: 'member/cs-point-change-record', name: 'member/cs-point-change-record', component: () => import('@/views/member/CSPointChangeRecord/index.vue') },
      { path: 'member/message-record', name: 'member/message-record', component: () => import('@/views/member/messageRecord/index.vue') },
      // game
      { path: 'game/game-list', name: 'game/game-list', component: () => import('@/views/game/GameList/index.vue') },
      // report
      { path: 'report/deposit', name: 'report/deposit', component: () => import('@/views/report/Deposit.vue') },
      { path: 'report/member-deposit', name: 'report/member-deposit', component: () => import('@/views/report/MemberDeposit/index.vue') },
      { path: 'report/member-wallet-change', name: 'report/member-wallet-change', component: () => import('@/views/report/MemberWalletChange.vue') },
      { path: 'report/member-mining-receipts', name: 'report/member-mining-receipts', component: () => import('@/views/report/MemberMiningReceipts.vue') },
      { path: 'report/member-transaction', name: 'report/member-transaction', component: () => import('@/views/report/MemberTransaction.vue') },
      { path: 'report/game-report', name: 'report/game-report', component: () => import('@/views/report/GameReport/index.vue') },
      // Platform
      { path: 'platform/announcement-list', name: 'platform/announcement-list', component: () => import('@/views/platform/AnnouncementList/index.vue') },
      { path: 'platform/rewardpoint-list', name: 'platform/rewardpoint-list', component: () => import('@/views/platform/rewardpointList/index.vue') },
      // 礦寵1.0 api沒有在用，先隱藏
      // { path: 'report/mining-report', name: 'report/mining-report', component: () => import('@/views/report/MiningReport/index.vue') },
    ],
  },
  // 404
  { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
]
