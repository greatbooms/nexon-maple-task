# Nexon MapleStory Node Task

이 프로젝트는 NX 모노레포를 사용하여 개발된 마이크로서비스 아키텍처 기반의 이벤트 관리 시스템입니다. GraphQL과 Apollo Federation을 활용하여 분산 서비스 간 통신을 구현했으며, 세 개의 NestJS 애플리케이션(User, Event, Gateway)으로 구성되어 있습니다.

## 프로젝트 구조

```
nexon-maple-node-task/
├── apps/                        # 애플리케이션 디렉토리
│   ├── user/                    # 사용자 서비스 (GraphQL Federation)
│   ├── event/                   # 이벤트 서비스 (GraphQL Federation)
│   ├── gateway/                 # API 게이트웨이 (Apollo Gateway)
│   └── *-e2e/                   # E2E 테스트 애플리케이션
├── libs/                        # 공유 라이브러리
│   ├── models/                  # 공통 모델 및 타입 정의
│   └── nest-shared/             # 공통 서비스 및 유틸리티
└── node_modules/
```

## 핵심 컴포넌트

### 1. API Gateway (apps/gateway)

게이트웨이는 Apollo Federation을 사용하여 User 서비스와 Event 서비스의 GraphQL 스키마를 통합합니다. 이를 통해 클라이언트는 단일 엔드포인트로 전체 API에 접근할 수 있습니다.

- 포트: 3100
- 엔드포인트: `/graphql`
- 주요 기능:
  - Federated GraphQL 서비스 통합
  - 인증 토큰 전파
  - 요청 라우팅

### 2. User 서비스 (apps/user)

사용자 계정 관리, 인증, 권한 등을 담당하는 마이크로서비스입니다.

- 포트: 3200 (HTTP), 3010 (TCP 마이크로서비스)
- 주요 기능:
  - 사용자 등록/인증
  - 사용자 프로필 관리
  - 로그인 이력 관리
  - 친구 초대 이력 관리
- 주요 엔티티:
  - User: 사용자 정보
  - LoginHistory: 로그인 이력
  - InviteHistory: 친구 초대 이력
- 역할 기반 접근 제어:
  - USER: 일반 사용자, 보상 요청 가능
  - OPERATOR: 이벤트/보상 등록 가능
  - AUDITOR: 보상 이력 조회만 가능
  - ADMIN: 모든 기능 접근 가능

### 3. Event 서비스 (apps/event)

이벤트 및 보상 관리, 사용자 참여 이력을 담당하는 마이크로서비스입니다.

- 포트: 3300
- 주요 기능:
  - 이벤트 생성 및 관리
  - 이벤트 보상 관리
  - 사용자 이벤트 참여 이력 관리
- 주요 엔티티:
  - Event: 이벤트 정보
  - EventReward: 이벤트 보상
  - UserEventParticipationHistory: 사용자 이벤트 참여 이력
- 이벤트 유형:
  - ATTENDANCE: 출석체크 이벤트
  - INVITE: 친구초대 이벤트
- 보상 유형:
  - POINT: 포인트
  - ITEM: 아이템
  - COUPON: 쿠폰

## 공통 라이브러리

### models (libs/models)

- 공통 데이터 모델 및 타입 정의
- 열거형(Enum) 정의
  - UserRole: 사용자 역할
  - EventType: 이벤트 유형
  - EventRewardType: 보상 유형
  - ParticipationResult: 참여 결과
- 공통 인터페이스 및 유틸리티 타입

### nest-shared (libs/nest-shared)

- 공통 서비스 및 유틸리티
- 인증 모듈 (JWT 기반)
- 데코레이터:
  - Roles: 역할 기반 접근 제어
  - Public: 공개 API 표시
  - User: 현재 인증된 사용자 주입
- 가드:
  - AuthGuard: 인증 확인
  - RolesGuard: 역할 기반 권한 확인
- 상수 및 헬퍼 함수

## 통신 방식

1. **GraphQL Federation**:
   - User 서비스와 Event 서비스는 각각 독립적인 GraphQL 스키마를 제공
   - Gateway에서 Apollo Federation을 사용하여 스키마 통합
   - 클라이언트는 Gateway의 단일 엔드포인트로 모든 서비스 접근

2. **TCP 마이크로서비스**:
   - User 서비스는 TCP 기반 마이크로서비스 엔드포인트 제공
   - Event 서비스에서 필요한 사용자 정보 조회 시 활용

## 데이터베이스

프로젝트는 MongoDB를 사용하며 Prisma ORM을 통해 데이터베이스에 접근합니다.

- MongoDB 복제셋 구성 (docker-compose.yml)
- Prisma 스키마:
  - apps/user/src/prisma/schema.prisma: 사용자 관련 스키마
  - apps/event/src/prisma/schema.prisma: 이벤트 관련 스키마

## 개발 환경 설정

### 필수 조건

- Node.js v18
- Docker 및 Docker Compose
- MongoDB

### 시작하기

1. 의존성 설치:
   ```
   yarn install
   ```

2. MongoDB 복제셋 실행:
   ```
   docker-compose up -d
   ```

3. 복제셋 초기화:
   ```
   sh init-replicaset.sh
   ```

4. Prisma 데이터베이스 마이그레이션:
   ```
   yarn user:db-push:dev
   yarn event:db-push:dev
   ```

5. 샘플 데이터 생성:
   ```
   sh seed-data.sh
   ```

6. 서비스 실행:
   ```
   nx serve user
   nx serve event
   -- 두 서비스가 켜진 다음 게이트 웨이 실행
   nx serve gateway
   ```

7. GraphQL Playground 접속:
   - Gateway: http://localhost:3100/graphql
   - 실행에 도움이 되는 포스트맨 파일은 nexon-maple-task.postman_collection.json 를 참고하세요.

nx 번들링에 실패하여 도커 생성을 못하였습니다

~~빌드시 공통으로 사용하는 라이브러리 참조를 하지 못하는 이슈로...~~

## 인증 및 권한

- JWT 기반 인증 사용
- Authorization 헤더를 통한 토큰 전달
- 역할 기반 접근 제어 (RBAC)
- 데코레이터를 통한 권한 검사: `@Roles(UserRole.ADMIN)`

## 개발자 도구

- NX CLI를 통한 애플리케이션 및 라이브러리 관리
- Jest를 사용한 테스트
- ESLint 및 Prettier를 통한 코드 스타일링
- GitLab CI/CD를 통한 자동화된 빌드 및 테스트

## 라이센스

MIT
