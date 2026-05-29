# Serpent Rift RPG

모바일 세로(430×932) 캔버스 액션 RPG 프로토타입. HTML/CSS/JS 단일 파일 구성, 외부 의존성 없음.

**플레이**: https://aijunny0604-alt.github.io/serpent-rift/

## 조작

- **이동**: 화면 드래그 (가상 조이스틱)
- **자동 공격**: 가장 가까운 적 자동 추적
- **스킬**: 우측 하단 4개 버튼 (Nova / Lance / Rift / Ultimate)
- **자동 캐스팅**: 토글 가능 (좌측 하단 표시)

## 콘텐츠

- **스테이지 4종**: Elderwood Ruins → Obsidian Gate → Frozen Citadel → Astral Void
- **적 3종**: shade(잡몹) / elite(정예) / boss(용)
- **스킬 3 + 궁극기**: Nova(범위 폭발) / Lance(관통) / Rift(시간 균열) / Ultimate
- **추가 효과**: storm / meteor / inferno / thunder / blink

## 파일 구조

```
rpg-prototype/
├── index.html        # 캔버스 + 스크립트 로더
├── styles.css        # 모바일 셀 + 힌트
├── game.js           # 게임 본체 (단일 파일, 약 2800줄)
├── assets/           # 스프라이트 시트(.png)
│   ├── player-action-sheet.png   (960×800, 6×5×160px)
│   ├── shade/elite/boss-action-sheet.png  (768×512, 6×4×128px)
│   ├── stage-*.png   # 스테이지 배경
│   └── *-icons.png   # UI/loot/skill 아이콘
└── tools/            # 스프라이트 시트 생성 파이썬 스크립트
```

## 스프라이트 시트 규격

- **player**: 160×160 프레임, 6열 × 5행 (idle/walk/attack/hurt/cast)
- **enemy(shade/elite/boss)**: 128×128 프레임, 6열 × 4행 (idle/walk/attack/hurt)
- **0.5px 안쪽으로 inset 자르기**로 인접 프레임 픽셀 bleeding 방지

## 알려진 그래픽 함정 (해결됨)

| 증상 | 원인 | 해결 |
|------|------|------|
| 캐릭터 주변 사각형 색 패치 | `source-atop` + 칠해진 배경 → fillRect 전체 영역 색칠 | offscreen canvas에서 sprite+tint 미리 합성 후 본 캔버스로 전송 |
| 캐릭터 가장자리 띠 | shadowBlur + fillRect 직사각형 그림자 | tint는 offscreen 사용해 본 캔버스 shadow 영향 차단 |
| 프레임 경계 작은 띠 | image smoothing이 인접 프레임 픽셀 샘플링 | sheet drawImage 시 source rect 0.5px inset |
| 보스 등장 직후 정지 | `drawEntity`에서 보스 sheet가 null → TypeError | `sprites.bossSheet` 매핑 + null 가드 |
| 게임이 한참 뒤 멈춤 | hit-stop NaN 가능성 + 효과 배열 폭주로 메인스레드 stutter | `Number.isFinite` 가드, 0.25s 캡, 배열별 안전 캡(particles 600 등) |
| 무지개 stroke 동심원이 촌스러움 | 절차적 stroke arc + drawProceduralRune | RadialGradient 4레이어 + 회전 광선 10개 + 궤도 sparks |

## 합성 모드 노트

`fillRect`로 sprite 모양에만 tint를 입히려면 `source-atop` 만으로는 부족하다. 본 캔버스에 이미 배경이 채워져 있으면 destination alpha가 사각형 전체에 깔려서 사각형이 그대로 색칠된다. **`drawSheetFrameTinted` / `drawSpriteTinted`** 헬퍼는 빈 offscreen 캔버스(`_tintCanvas`)에서 sprite를 먼저 그리고 그 위에 source-atop fillRect로 tint를 누적한 뒤 본 캔버스로 한 번에 blit 한다.

```js
drawSheetFrameTinted(sheet, sx, sy, sw, sh, dx, dy, dw, dh, [stageTint, hitTint])
drawSpriteTinted(sprite, dx, dy, dw, dh, [tint])
hexAlpha("#ffd965", 0.7)  // → "rgba(255,217,101,0.7)"
```

## 게임 루프 안전망

```js
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  try {
    if (state.screen === "title") state.t += dt;
    else if (!state.paused) update(dt);
    draw();
  } catch (err) {
    console.error("[game loop] frame skipped:", err);
  }
  requestAnimationFrame(loop);
}
```

`update()` 또는 `draw()`에서 어떤 에러가 던져져도 다음 프레임은 항상 예약된다. 에러는 콘솔에 흔적이 남으므로 사용자가 멈춤 신고 시 콘솔로 원인 추적 가능.

## 배포

```bash
git add -A
git commit -m "변경 요약"
git push
# GitHub Pages가 main 브랜치 / 경로에서 자동 빌드 (1~2분)
```

`index.html`의 `<script src="./game.js?v=XXX">` 쿼리 스트링을 바꿔서 브라우저 캐시를 강제 무효화한다.

## 라이선스 / 크레딧

프로토타입 단계. 스프라이트는 `tools/` 폴더의 파이썬 스크립트로 절차적 생성.
