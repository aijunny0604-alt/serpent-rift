# Serpent Rift RPG

모바일 세로형 캔버스 액션 RPG 프로토타입입니다. 캐릭터/몬스터/보스/마법/UI는 PNG 에셋과 스프라이트 시트 중심으로 렌더링하며, 자동 전투, 스킬 난사, 파티원/펫, 마을, 퀘스트, 계층주 레이드 구조를 포함합니다.

## 실행

프로젝트 루트에서 로컬 서버를 실행합니다.

```bash
python -m http.server 8130 --bind 127.0.0.1
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:8130/index.html
```

최신 캐시 버전 확인 URL:

```text
http://127.0.0.1:8130/index.html?v=enemy-attack-assets-v1
```

## 주요 기능

- 백버퍼 렌더링으로 실패 프레임을 화면에 표시하지 않는 깜빡임 방지 구조
- 좌/우 이동 및 타겟 방향에 따른 플레이어 스프라이트 방향 전환
- 자동 스킬, 오버드라이브, 순간이동 연속 베기, 번개/화염/운석/리프트 스킬
- 스킬 이펙트 과부하 방지 및 대형 스킬 중첩 제한
- 적/엘리트/보스의 걷기, 피격, 공격, 캐스팅 애니메이션
- 적 공격 궤적과 보스 캐스팅 링을 PNG 애니메이션 시트로 재생
- 파티원, 힐러/딜러/탱커 역할, 펫 및 라이딩 시스템
- 1-1부터 1-5까지 진행되는 스테이지 구조와 마지막 스테이지 계층주 레이드
- 골드/아이템/코어 파편 드롭 연출
- 마을 시스템: 무기점, 펫샵, 파트너 홀, 의뢰소, 던전 게이트
- 그래픽 UI 패널, 인벤토리, 스킬창, 퀘스트 보드

## 조작

- 화면 클릭/터치: 시작, 대화 진행, UI 선택, 이동
- `Enter`: 시작/대화 진행/던전 입장
- 방향키 또는 `WASD`: 이동
- `T`: 마을로 이동
- `R`: 라이딩 토글
- 우측 스킬 버튼: 수동 스킬 사용
- 하단/사이드 UI 버튼: 인벤토리, 스킬, 퀘스트, 마을 기능

## 파일 구조

```text
rpg-prototype/
├─ index.html      # 캔버스와 game.js 로더
├─ game.js         # 게임 본체, 전투/마을/UI/퀘스트/렌더링 로직
├─ assets/         # 그래픽 에셋, 4K 아틀라스, 스프라이트 시트
└─ tools/          # 에셋/스프라이트 작업 보조 스크립트
```

## 핵심 에셋

- `assets/player-action-sheet-4k-v1.png`: 주인공 액션 시트
- `assets/player-riding-sheet-4k-v1.png`: 라이딩 액션 시트
- `assets/partner-*-sheet-4k-v1.png`: 파티원 액션 시트
- `assets/shade-action-sheet-4k-v1.png`: 일반 몬스터 액션 시트
- `assets/elite-action-sheet-4k-v1.png`: 엘리트 몬스터 액션 시트
- `assets/boss-floorlord-*-sheet.png`: 계층주 보스 액션 시트
- `assets/enemy-attack-fx-sheet-v1.png`: 적 공격 궤적 PNG 애니메이션 시트
- `assets/boss-cast-fx-sheet-v1.png`: 보스 캐스팅 링 PNG 애니메이션 시트
- `assets/magic-fx-atlas-generated-4k-v1.png`: 마법 FX 아틀라스
- `assets/element-fx-4k-v1.png`: 번개/화염 속성 이펙트 아틀라스
- `assets/skill-icons-v2-4k-v1.png`: 스킬 아이콘 아틀라스
- `assets/item-icons-4k-v1.png`: 아이템 아이콘 아틀라스
- `assets/loot-icons-4k-v1.png`: 드롭 아이콘 아틀라스
- `assets/rune-effects-4k-v1.png`: 룬 이펙트 아틀라스
- `assets/town-map-4k-v1.png`: 마을 배경
- `assets/town-ui-atlas-4k-v1.png`: 마을 UI 아틀라스
- `assets/town-buildings-atlas-4k-v1.png`: 마을 건물 아틀라스
- `assets/ui-fantasy-atlas-v2.png`: 판타지 UI 프레임 아틀라스

## 렌더링 안정화

- 게임은 오프스크린 `renderCanvas`에 먼저 그린 뒤, 성공한 프레임만 실제 캔버스에 복사합니다.
- 렌더 중 예외가 발생하면 이전 정상 프레임이 유지되어 검은 화면 깜빡임을 줄입니다.
- `ctx.save()` / `ctx.restore()` 깊이를 추적해 이펙트 실패 시 캔버스 상태 스택을 복구합니다.
- 스킬/투사체/루팅/데미지/적 렌더는 개별 보호 처리되어 하나가 실패해도 전체 프레임이 무너지지 않습니다.
- 파티클, 투사체, 히트 숫자, 해저드 개수는 상한을 두어 스킬 폭주 시 프레임 저하를 완화합니다.

## 그래픽 처리 방식

- 캐릭터와 적은 프레임별 액션 시트로 `idle`, `walk`, `attack`, `hurt`, `cast` 상태를 렌더링합니다.
- UI는 PNG 아틀라스와 9-slice 렌더링을 조합합니다.
- 공격 궤적과 보스 캐스팅은 `enemy-attack-fx-sheet-v1.png`, `boss-cast-fx-sheet-v1.png`를 프레임별로 재생합니다.
- PNG 시트가 로드되지 않으면 캔버스 기반 fallback 이펙트를 사용합니다.
- 배경은 실제 맵 이미지를 `cover` 방식으로 렌더링해 화면 비율 변화에 대응합니다.

## 검증

문법 체크:

```bash
node --check game.js
```

최근 확인 항목:

- `node --check game.js` 통과
- 로컬 서버 `http://127.0.0.1:8130` 응답 `200`
- 브라우저 로딩 및 콘솔 오류 없음
- 새 공격 이펙트 PNG 시트 `RGBA` 및 투명 모서리 alpha `0` 확인

## GitHub

원격 저장소:

```text
https://github.com/aijunny0604-alt/serpent-rift.git
```
