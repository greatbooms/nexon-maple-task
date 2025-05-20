db = db.getSiblingDB('maple')

// 컬렉션 비우기 (기존 컬렉션)
db.Point.drop()
db.Item.drop()
db.Coupon.drop()

// 추가 컬렉션 비우기
db.User.drop()
db.LoginHistory.drop()
db.InviteHistory.drop()

// User 컬렉션에 어드민 유저 데이터 삽입
const adminUser = {
  email: 'mapel-admin@nexon.co.kr',
  name: 'Maple Admin',
  password: '$2b$10$RcvpB35uQf/HGoXjWqDo8eEN69s.HcXuV.6vPZ/nf1LEZZLaODUbS',
  role: 'ADMIN',
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const adminUserId = db.User.insertOne(adminUser).insertedId
console.log(`어드민 유저가 생성되었습니다. ID: ${adminUserId}`)

// 일반 유저 5명 생성
const users = []
for (let i = 1; i <= 5; i++) {
  users.push({
    email: `user${i}@example.com`,
    name: `테스트 유저 ${i}`,
    password: '$2b$10$RcvpB35uQf/HGoXjWqDo8eEN69s.HcXuV.6vPZ/nf1LEZZLaODUbS', // 같은 패스워드 사용
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

const userIds = db.User.insertMany(users).insertedIds
console.log(`${users.length}명의 일반 유저가 생성되었습니다.`)

// 각 유저에 대한 로그인 기록 생성
const loginHistories = []
// 어드민 로그인 기록
loginHistories.push({
  userId: adminUserId,
  loginAt: new Date(),
})

// 일반 유저 로그인 기록
for (let i = 0; i < 5; i++) {
  // 각 유저당 3개의 로그인 기록 생성
  for (let j = 0; j < 3; j++) {
    const loginDate = new Date()
    loginDate.setDate(loginDate.getDate() - j) // 각각 다른 날짜

    loginHistories.push({
      userId: userIds[i],
      loginAt: loginDate,
    })
  }
}

db.LoginHistory.insertMany(loginHistories)
console.log(`${loginHistories.length}개의 로그인 기록이 생성되었습니다.`)

const inviteHistories = [
  {
    referrerUserId: userIds[0], // 유저1
    inviteeUserId: userIds[1], // 유저2
    inviteAt: new Date(),
  },

  {
    referrerUserId: userIds[0], // 유저1
    inviteeUserId: userIds[2], // 유저3
    inviteAt: new Date(),
  },

  {
    referrerUserId: userIds[0], // 유저1
    inviteeUserId: userIds[3], // 유저4
    inviteAt: new Date(),
  },
  {
    referrerUserId: userIds[2], // 유저3
    inviteeUserId: userIds[3], // 유저4
    inviteAt: new Date(),
  },
]

db.InviteHistory.insertMany(inviteHistories)
console.log(`${inviteHistories.length}개의 친구 초대 기록이 생성되었습니다.`)

// Point 컬렉션에 5개 데이터 삽입
const points = []
for (let i = 1; i <= 5; i++) {
  points.push({
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}
db.Point.insertMany(points)
console.log(`${points.length}개의 Point 데이터가 생성되었습니다.`)

// Item 컬렉션에 5개 데이터 삽입
const items = []
for (let i = 1; i <= 5; i++) {
  items.push({
    name: `테스트 아이템 ${i}`,
    description: `아이템 설명 ${i}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}
db.Item.insertMany(items)
console.log(`${items.length}개의 Item 데이터가 생성되었습니다.`)

// Coupon 컬렉션에 5개 데이터 삽입
const coupons = []
for (let i = 1; i <= 5; i++) {
  coupons.push({
    code: `COUPON${i}`,
    description: `쿠폰 설명 ${i}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}
db.Coupon.insertMany(coupons)
console.log(`${coupons.length}개의 Coupon 데이터가 생성되었습니다.`)

// 생성된 데이터 ID 출력
console.log('\n--- 생성된 컬렉션 데이터 정보 ---')

console.log('\n[유저 정보]')
console.log('어드민 유저:')
printjson(db.User.findOne({ role: 'ADMIN' }, { _id: 1, email: 1, role: 1 }))

console.log('\n일반 유저 목록:')
db.User.find({ role: 'USER' }, { _id: 1, email: 1 }).forEach((doc) => printjson(doc))

console.log('\n[보상 아이템 ObjectId 목록] (이벤트 보상 참조용)')
console.log('Points:')
db.Point.find({}, { _id: 1 }).forEach((doc) => printjson(doc._id))

console.log('\nItems:')
db.Item.find({}, { _id: 1 }).forEach((doc) => printjson(doc._id))

console.log('\nCoupons:')
db.Coupon.find({}, { _id: 1 }).forEach((doc) => printjson(doc._id))
