# Serpent Rift RPG

모바일 세로형 액션 RPG 프로토타입입니다. 화면 표현은 CSS UI가 아니라 `canvas`와 생성 PNG 에셋 중심으로 구성합니다.

## 실행

```bash
python -m http.server 8130 --bind 127.0.0.1
```

브라우저:

```text
http://127.0.0.1:8130/index.html
```

## 파일 구조

```text
rpg-prototype/
├─ index.html          # 캔버스와 스크립트 로더
├─ game.js             # 게임 본체
├─ assets/             # 생성 그래픽, 스프라이트 시트, UI/전투 FX 아틀라스
└─ tools/              # 스프라이트 시트 생성 스크립트
```

## 그래픽 원칙

- CSS UI 사용 안 함
- UI 프레임, 버튼, 슬롯, 대화창, 스킬 아이콘은 생성 PNG 에셋 사용
- 캐릭터, 파티원, 펫, 보스는 프레임별 스프라이트 시트 사용
- 전투 이펙트는 그래픽 FX 아틀라스와 캔버스 파티클을 조합

## 주요 에셋

- `assets/ui-fantasy-atlas-v2.png`: 판타지 UI 프레임/버튼/슬롯 아틀라스
- `assets/skill-icons-v2.png`: 스킬 아이콘 아틀라스
- `assets/combat-fx-atlas.png`: 전투 이펙트 아틀라스
- `assets/magic-fx-atlas-v2.png`: 8종 마법 그래픽 FX 아틀라스
- `assets/player-action-sheet.png`: 주인공 액션 시트
- `assets/partner-*-sheet.png`: 파티원 액션 시트
- `assets/boss-floorlord-*-sheet.png`: 계층주 액션 시트
