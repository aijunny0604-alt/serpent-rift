# Serpent Rift RPG

모바일 세로형 캔버스 액션 RPG 프로토타입입니다. `canvas` 기반으로 동작하며, CSS 도형 대신 생성형 PNG 에셋과 4K급 아틀라스를 중심으로 캐릭터, 몬스터, 마법 이펙트, 마을 UI를 구성합니다.

## 실행

프로젝트 루트에서 로컬 서버를 실행합니다.

```bash
python -m http.server 8130 --bind 127.0.0.1
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:8130/index.html
```

최신 캐시 버전 확인용 URL:

```text
http://127.0.0.1:8130/index.html?v=assets-4k-ui-text-v2
```

## 주요 기능

- 타이틀 화면과 애니메이션풍 인트로 대화 씬
- 자동 전투 기반 핵앤슬래시 RPG 전투
- 검 휘두르기, 피격, 걷기, 캐스팅, 라이딩 액션 시트
- 파티원, 펫, 라이딩, 힐러/탱커/딜러 보조 시스템
- 일반 몬스터, 엘리트, 계층주 보스 및 레이드 연출
- 층별 스테이지와 마지막 스테이지 계층주 등장 구조
- 골드/아이템 드롭, 코어 파편, 퀘스트 보상
- 마을 시스템: 무기점, 펫샵, 파트너 홀, 의뢰소, 던전 게이트
- 인벤토리, 스킬창, 퀘스트 보드, 마을 상점 패널
- 4K급 배경/마을 UI/건물/캐릭터 시트/마법 FX 에셋 적용
- 대화창과 UI 텍스트의 자동 줄바꿈, 축소, 말줄임, 클리핑 처리

## 조작

- 화면 탭 또는 클릭: 시작, 대화 진행, UI 선택
- `Enter`: 시작/대화 진행/던전 입장
- `T`: 마을로 이동
- `R`: 라이딩 토글
- 하단 및 사이드 UI 버튼: 인벤토리, 스킬, 퀘스트, 마을 기능

## 파일 구조

```text
rpg-prototype/
├─ index.html      # 캔버스와 game.js 로더
├─ game.js         # 게임 본체, 전투/마을/UI/퀘스트 로직
├─ assets/         # 생성형 그래픽 에셋, 4K 아틀라스, 스프라이트 시트
└─ tools/          # 에셋/스프라이트 작업용 보조 스크립트
```

## 핵심 에셋

- `assets/town-map-4k-v1.png`: 4K급 마을 배경
- `assets/town-ui-atlas-4k-v1.png`: 4K급 마을 UI 패널 아틀라스
- `assets/town-buildings-atlas-4k-v1.png`: 4K급 마을 건물 아틀라스
- `assets/magic-fx-atlas-generated-4k-v1.png`: 새로 생성한 4K급 마법 FX 아틀라스
- `assets/player-action-sheet-4k-v1.png`: 주인공 액션 시트
- `assets/player-riding-sheet-4k-v1.png`: 라이딩 액션 시트
- `assets/partner-*-sheet-4k-v1.png`: 파티원 액션 시트
- `assets/shade-action-sheet-4k-v1.png`: 일반 몬스터 액션 시트
- `assets/elite-action-sheet-4k-v1.png`: 엘리트 몬스터 액션 시트
- `assets/boss-*-action-sheet-4k-v1.png`: 보스 액션 시트
- `assets/skill-icons-v2-4k-v1.png`: 스킬 아이콘 아틀라스
- `assets/item-icons-4k-v1.png`: 아이템 아이콘 아틀라스
- `assets/loot-icons-4k-v1.png`: 드롭 아이콘 아틀라스
- `assets/rune-effects-4k-v1.png`: 룬 이펙트 아틀라스
- `assets/element-fx-4k-v1.png`: 번개/화염 등 속성 이펙트 아틀라스

## 그래픽 처리 방식

- 주요 UI는 생성형 PNG 아틀라스와 9-slice 렌더링을 조합합니다.
- 캐릭터와 적은 프레임별 액션 시트로 렌더링합니다.
- 고해상도 아틀라스는 논리 프레임 크기와 실제 픽셀 크기를 분리해서 자릅니다.
- 마을 배경은 `cover` 방식으로 그려서 화면 축이 비틀리지 않게 처리합니다.
- 마법 FX는 알파 채널이 있는 4K급 아틀라스를 사용해 사각 배경 노출을 줄입니다.

## UI 텍스트 규칙

긴 텍스트가 패널 밖으로 나가지 않도록 공통 렌더링 헬퍼를 사용합니다.

- `drawFitText`: 지정 폭 안에서 폰트 크기 축소 및 말줄임 처리
- `drawWrappedText`: 지정 줄 수 안에서 자동 줄바꿈 처리
- 대화창 본문: 내부 영역 클리핑으로 창 밖 출력 방지
- 상점/의뢰/퀘스트/스킬/아이템 패널: 제목, 설명, 가격 영역 분리

## 최종 점검

문법 체크:

```bash
node --check game.js
```

최근 확인 항목:

- `node --check game.js` 통과
- 브라우저 로딩 시 콘솔 오류/경고 없음
- 4K 에셋 해상도 확인
- 현재 README 기준 최신 기능 반영

## GitHub

원격 저장소:

```text
https://github.com/aijunny0604-alt/serpent-rift.git
```
