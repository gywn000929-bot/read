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

### 📖 고전 41권 (Project Gutenberg)

퍼블릭 도메인 고전을 같은 형식으로 넣어 두었습니다. 사이드바 드롭다운의
**📖 고전** 갈래에서 고르면 됩니다. 원문은 [Project Gutenberg](https://www.gutenberg.org/)
의 평문(txt)을 이 앱의 파서로 장 단위로 나눈 것입니다.

| 책 | 저자 | 챕터 |
|----|------|------|
| A Christmas Carol | Charles Dickens | 6 |
| A Little Princess | Frances Hodgson Burnett | 19 |
| A Study in Scarlet | Arthur Conan Doyle | 14 |
| A Tale of Two Cities | Charles Dickens | 45 |
| Adventures of Huckleberry Finn | Mark Twain | 45 |
| Alice's Adventures in Wonderland | Lewis Carroll | 12 |
| Anne of Green Gables | L. M. Montgomery | 38 |
| Around the World in Eighty Days | Jules Verne | 37 |
| Dracula | Bram Stoker | 27 |
| Emma | Jane Austen | 56 |
| Frankenstein | Mary Wollstonecraft Shelley | 24 |
| Great Expectations | Charles Dickens | 62 |
| Gulliver's Travels | Jonathan Swift | 21 |
| Heart of Darkness | Joseph Conrad | 3 |
| Jane Eyre | Charlotte Brontë | 38 |
| Little Women | Louisa May Alcott | 48 |
| Metamorphosis | Franz Kafka | 3 |
| Moby Dick | Herman Melville | 131 |
| Oliver Twist | Charles Dickens | 53 |
| Peter Pan | J. M. Barrie | 17 |
| Pride and Prejudice | Jane Austen | 65 |
| Robinson Crusoe | Daniel Defoe | 20 |
| Sense and Sensibility | Jane Austen | 51 |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle | 4 |
| The Adventures of Tom Sawyer | Mark Twain | 35 |
| The Call of the Wild | Jack London | 7 |
| The Count of Monte Cristo | Alexandre Dumas | 120 |
| The Great Gatsby | F. Scott Fitzgerald | 10 |
| The Hound of the Baskervilles | Arthur Conan Doyle | 16 |
| The Invisible Man | H. G. Wells | 28 |
| The Picture of Dorian Gray | Oscar Wilde | 21 |
| The Prince and the Pauper | Mark Twain | 33 |
| The Scarlet Letter | Nathaniel Hawthorne | 25 |
| The Secret Garden | Frances Hodgson Burnett | 27 |
| The War of the Worlds | H. G. Wells | 27 |
| The Wonderful Wizard of Oz | L. Frank Baum | 24 |
| Through the Looking-Glass | Lewis Carroll | 12 |
| Treasure Island | Robert Louis Stevenson | 34 |
| Twenty Thousand Leagues under the Sea | Jules Verne | 47 |
| White Fang | Jack London | 25 |
| Wuthering Heights | Emily Brontë | 34 |

> 상업 출판사(펭귄 북스 등)의 책은 저작권이 있어 넣을 수 없습니다.
> 개인 소장 파일은 아래 **📂 내 책 열기** 로 직접 넣어 읽으세요.

사이드바 상단의 드롭다운으로 책을 전환합니다. 각 책은 선택할 때 필요한 만큼만 불러옵니다(빠른 로딩).

## 📂 내 책 열기 (개인 소장 파일)

사이드바의 **＋ 내 책 열기 (PDF · TXT)** 버튼으로 **내가 가지고 있는 파일**을 그대로 리더에 넣을 수 있습니다.

- 지원 형식: **PDF**, **TXT**, 그리고 이 앱 형식의 **JSON**
- PDF는 브라우저 안에서 [pdf.js](https://mozilla.github.io/pdf.js/)로 해석해
  `Chapter 1`, `Prologue`, `Part I` 같은 제목을 찾아 **자동으로 장(chapter)을 나눕니다.**
  들여쓰기와 줄 끝 위치를 보고 문단을 복원하고, 쪽번호·반복되는 머리말은 걸러냅니다.
- 넣고 나면 기존 책과 **똑같이** 단어 탭·해석·TTS·플래시카드·퀴즈·진행률을 쓸 수 있습니다.

### 🖼 그림책 · 만화형 PDF

*Diary of a Wimpy Kid* 처럼 **손글씨와 그림이 한 장에 같이 그려진 책**은 쪽 전체가 이미지입니다.
글자만 뽑으면 그림이 통째로 사라지므로, 이런 PDF 는 알아서 알아보고 **쪽 그림을 그대로 보여줍니다.**

- 쪽 그림 위에 **보이지 않는 단어 칸**을 얹어, 그림 속 손글씨를 탭하면 뜻·발음이 나오고 단어장에 저장됩니다
- 폰트에 유니코드 표가 없어 글자가 밀려 나오는 PDF 는 **밀린 칸 수를 스스로 찾아** 되돌립니다
  (흔한 영어 단어가 가장 많이 잡히는 값을 고릅니다)
- 요일·`Chapter` 같은 머리글로 장을 나누고, 못 찾으면 쪽 번호로 이름을 붙입니다

> 227쪽짜리 책 기준 해석 약 **25초**, 저장 용량 약 **16MB** 입니다.
> 용량이 큰 만큼 동기화 업로드도 그만큼 오래 걸립니다.

> ⚠️ **넣은 책은 자동 동기화로 클라우드에 올라갑니다.**
> 고른 파일은 브라우저 안에서 해석되어 내 기기의 IndexedDB에 저장되고,
> 기기끼리 이어보기 위해 아래 [자동 동기화](#-자동-동기화-로그인-없이-모든-기기)의 데이터베이스에도 올라갑니다.
> 그 데이터베이스는 **로그인이 없어서 주소를 아는 사람은 누구나 내용을 볼 수 있습니다.**
> 남에게 보이면 안 되는 파일은 넣지 마세요.
> 이 저장소(`books/`)에 커밋되지는 않습니다.

`books/` 에 커밋하는 것은 배포 권한이 있는 텍스트(퍼블릭 도메인 등)만 사용하세요.

## ☁️ 자동 동기화 (로그인 없이, 모든 기기)

**로그인도, 기기마다 넣을 설정도 없습니다.** 앱을 열기만 하면 모든 기기가 같은 곳을 봅니다 —
휴대폰에서 읽던 챕터, 저장한 단어, 내가 넣은 책이 노트북에서도 그대로 이어집니다.

주소가 앱에 들어 있고 Firebase **Realtime Database** 에 REST 로 바로 붙기 때문에,
SDK 를 받아오는 시간도 없이 열자마자 맞춰집니다. ([WSJ English Study](https://gywn000929-bot.github.io/WSJ/) 와 같은 방식)

### 데이터베이스 규칙 (처음 한 번)

같은 데이터베이스를 WSJ 앱과 함께 쓰고 경로만 `bookstudy` 로 나눕니다.
**Realtime Database → 규칙** 에 `bookstudy` 를 한 줄 추가하고 게시하세요.

```json
{
  "rules": {
    "study":     { ".read": true, ".write": true },
    "bookstudy": { ".read": true, ".write": true }
  }
}
```

> ⚠️ 로그인이 없다는 것은 **주소를 아는 사람은 누구나 이 데이터를 읽고 쓸 수 있다**는 뜻입니다.
> 읽은 챕터·단어장뿐 아니라 **내가 넣은 책 본문도 함께 올라갑니다.**
> 남에게 보이면 안 되는 파일은 넣지 마세요.

### 언제 맞춰지는지

| 시점 | 하는 일 |
|------|--------|
| 앱을 열 때 | 받아서 **합치고**, 합친 결과를 올림 · 마지막으로 읽던 자리로 이어감 |
| 읽는 중 | 20초마다 다른 기기의 변경을 받아옴 (탭이 가려져 있으면 쉼) |
| 공부하는 중 | 바뀐 뒤 4초쯤 모았다가 자동으로 올림 |
| 탭을 덮거나 앱을 나갈 때 | 모아둔 변경을 바로 올림 |
| 다시 앱으로 돌아올 때 | 20초 넘게 지났으면 받아옴 |

### 합치는 규칙

지우지 않고 **더 많이 읽은 쪽 · 읽음 표시는 합집합 · 더 최근에 저장한 단어**를 남깁니다.
단, **내가 지운 것은 지운 채로 둡니다** — 지울 때 무덤(tombstone)을 남겨 다른 기기에도 전하므로,
지운 단어·책·북마크가 다음 동기화에 되살아나지 않습니다. 같은 것을 다시 넣으면 무덤에서 꺼냅니다.
올릴 때는 키 하나하나를 `PATCH` 로 보내서, 그 사이 다른 기기가 넣은 것을 덮지 않습니다.
그래서 두 기기를 번갈아 써도 진도가 사라지지 않습니다.

책 본문은 한 권이 수 MB 라 **새로 넣은 책만** 올리고, 다른 기기에는 **없는 책만** 받아옵니다.
읽는 자리 이동은 앱을 **열 때만** 따라갑니다 — 읽는 도중에 화면이 옮겨가면 곤란하니까요.

## 주요 기능

- **신문 스타일 리더** — 챕터 목차(제목 포함), 읽기 진행률, 세리프 본문, 드롭캡
- **페이지 넘김** — 스크롤 대신 책처럼 한 쪽씩 가로로 넘기기 (넓은 화면은 두 쪽 펼침).
  **모바일은 스와이프**, **데스크탑은 ← → 방향키·좌우 가장자리 탭**, 아래 바의 `‹ ›` 버튼.
  마지막 쪽에서 넘기면 다음 챕터로 이어지고, 첫 쪽에서 뒤로 가면 앞 챕터의 마지막 쪽으로 갑니다.
  툴바의 **📄 페이지 / 📜 스크롤** 버튼으로 언제든 바꿀 수 있습니다.
  쪽 높이는 **줄 높이의 배수로 맞춰** 마지막 줄이 반쯤 잘리지 않습니다
- **읽던 쪽 이어보기** — 챕터마다 읽던 쪽을 기억합니다. 앱을 닫았다 열어도, 다른 기기에서 열어도 그 쪽부터
- **북마크** — 툴바 **🔖** 로 지금 쪽을 저장하고, 사이드바 목록에서 눌러 그 자리로. 기기끼리 동기화됩니다
- **단어 탭 → 학습** — 단어를 탭하면 한국어 뜻·영영 정의·발음기호를 보고 **내 단어장에 저장**
- **문장 해석** — “문장 해석”을 켜고 문장을 탭하면 한국어 번역이 인라인으로 표시
- **음성 읽기(TTS)** — 챕터를 소리 내어 읽어주며 현재 문장을 하이라이트
- **내 단어장** — 저장한 단어를 **플래시카드**와 **퀴즈**로 복습, CSV 내보내기 (책 구분 없이 통합)
- **3가지 테마** (베이지 / 화이트 / 블랙), 글꼴(세리프·고딕·Palatino), 글자 크기 조절
- **자동 저장·동기화** — 저장 단어·읽은 챕터·마지막 책/챕터가 브라우저에 보관되고, 로그인 없이 모든 기기에서 자동으로 맞춰짐
- **그림책 지원** — 쪽 전체가 그림인 PDF 는 그림 그대로 보여주고, 그림 속 글자도 탭해서 저장
- **모바일 대응** — 서랍형 목차, 바텀시트 단어 팝업

## 파일 구조

```
index.html          # 앱 (단일 파일, 데이터는 fetch로 로드)
books/
  manifest.json     # 책 목록
  holes.json
  hp1.json … hp7.json
```

내 기기에서 연 책은 파일로 저장되지 않고 브라우저 IndexedDB(`bookstudy_local`)에 들어갑니다.

> 데이터를 `fetch` 로 불러오므로 **웹 서버(예: GitHub Pages)** 에서 열어야 합니다.
> (로컬에서 `index.html` 을 파일로 직접 열면 목록이 로드되지 않습니다.
>  로컬 확인 시: `python3 -m http.server` 후 `http://localhost:8000` 접속)

## 사용한 API (인터넷 연결 시 동작)

- 사전: `api.dictionaryapi.dev` (영영 정의·발음)
- 번역: Google Translate `gtx` (영→한)
- 음성: 브라우저 Web Speech API (오프라인 동작)
- PDF 해석: 저장소에 포함된 pdf.js `vendor/pdfjs/` (Apache-2.0, 인터넷 없이 동작)

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
