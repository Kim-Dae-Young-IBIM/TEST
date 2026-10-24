# Glow Globe

빛나는 위치 마커가 있는 인터랙티브 3D 지구본 (three.js).

## 실행

ES 모듈과 텍스처를 쓰기 때문에 로컬 서버로 열어야 합니다.

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

외부 CDN 없이 동작하도록 three.js(r160)와 텍스처를 저장소에 포함했습니다.

## 기능

- 전체 뷰포트 3D 지구본: 지표 텍스처, 범프·스펙큘러 맵, 구름층, 대기 림 글로우와 헤일로
- 부드러운 조명: 주변광 + 반구광 + 카메라를 따라가는 키 라이트
- 빛나는 마커: 펄스 링, 숨쉬는 글로우, 빛 기둥, 지평선 근처에서 자연스럽게 페이드
- 드래그 회전(관성), 스크롤/핀치 확대
- 마커·라벨·목록 클릭 시 호를 그리며 이동하는 카메라 전환
- 자동 회전: 상호작용 중 일시정지, 3.5초 후 재개. 위치를 선택한 동안은 정지
- 추천 위치 목록과 정보 카드(현지 시각, 좌표, 이전/다음)
- 키보드: `←` `→` 위치 이동, `Esc` 전체 보기
- 모바일 레이아웃과 `prefers-reduced-motion` 지원

위치 데이터는 `main.js` 상단의 `LOCATIONS` 배열에서 수정할 수 있습니다.

## 출처

- three.js — MIT (`vendor/three/LICENSE`)
- 지구 텍스처 — NASA Blue Marble 기반, [three-globe](https://github.com/vasturiano/three-globe) 예제 이미지를 변환
