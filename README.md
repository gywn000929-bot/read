# 📖 Book Study · 원서로 영어 공부

영어 원서를 읽으며 **단어 뜻·발음·문장 해석·플래시카드·퀴즈**로 공부할 수 있는 인터랙티브 리더입니다.
[WSJ English Study](https://gywn000929-bot.github.io/WSJ/) 와 같은 형식으로 만들었습니다.

## 수록된 책

| 책 | 저자 | 챕터 |
|----|------|------|
| Holes | Louis Sachar | 50 |
| Harry Potter and the Sorcerer's Stone | J.K. Rowling | 17 |
| Harry Potter and the Chamber of Secrets | J.K. Rowling | 18 |
| Harry Potter and the Prisoner of Azkaban | J.K. Rowling | 22 |
| Harry Potter and the Goblet of Fire | J.K. Rowling | 37 |
| Harry Potter and the Order of the Phoenix | J.K. Rowling | 38 |
| Harry Potter and the Half-Blood Prince | J.K. Rowling | 30 |
| Harry Potter and the Deathly Hallows | J.K. Rowling | 37 |

사이드바 상단의 드롭다운으로 책을 전환합니다. 각 책은 선택할 때 필요한 만큼만 불러옵니다(빠른 로딩).

## 주요 기능

- **신문 스타일 리더** — 챕터 목차(제목 포함), 읽기 진행률, 세리프 본문, 드롭캡
- **단어 탭 → 학습** — 단어를 탭하면 한국어 뜻·영영 정의·발음기호를 보고 **내 단어장에 저장**
- **문장 해석** — “문장 해석”을 켜고 문장을 탭하면 한국어 번역이 인라인으로 표시
- **음성 읽기(TTS)** — 챕터를 소리 내어 읽어주며 현재 문장을 하이라이트
- **내 단어장** — 저장한 단어를 **플래시카드**와 **퀴즈**로 복습, CSV 내보내기 (책 구분 없이 통합)
- **3가지 테마** (베이지 / 화이트 / 블랙), 글꼴(세리프·고딕·Palatino), 글자 크기 조절
- **자동 저장** — 저장 단어·읽은 챕터·마지막 책/챕터·설정이 브라우저(localStorage)에 보관
- **모바일 대응** — 서랍형 목차, 바텀시트 단어 팝업

## 파일 구조

```
index.html          # 앱 (단일 파일, 데이터는 fetch로 로드)
books/
  manifest.json     # 책 목록
  holes.json
  hp1.json … hp7.json
```

> 데이터를 `fetch` 로 불러오므로 **웹 서버(예: GitHub Pages)** 에서 열어야 합니다.
> (로컬에서 `index.html` 을 파일로 직접 열면 목록이 로드되지 않습니다.
>  로컬 확인 시: `python3 -m http.server` 후 `http://localhost:8000` 접속)

## 사용한 API (인터넷 연결 시 동작)

- 사전: `api.dictionaryapi.dev` (영영 정의·발음)
- 번역: Google Translate `gtx` (영→한)
- 음성: 브라우저 Web Speech API (오프라인 동작)

## 배포 (GitHub Pages)

1. 저장소 **Settings → Pages**
2. **Source: Deploy from a branch**, 브랜치와 폴더 `/ (root)` 선택
3. `https://<사용자>.github.io/read/` 에서 접속

## 새 책 추가하기

`books/` 에 같은 형식의 JSON을 추가하고 `books/manifest.json` 에 항목을 넣으면 됩니다.

```jsonc
// books/<id>.json
{ "id":"myid", "title":"…", "author":"…", "lang":"en",
  "parts":{ "1":"Part One" },
  "chapters":[ { "n":1, "part":1, "title":"챕터 제목(선택)", "paras":["문단1","문단2"] } ] }
```
