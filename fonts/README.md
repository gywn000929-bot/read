# 글꼴

본문을 읽는 데 쓰는 한글 글꼴입니다. 원본을 **WOFF2** 로 바꿔서 넣었습니다 —
그대로 넣으면 한 벌에 2MB 가 넘고, 본명조는 14MB 입니다.

| 파일 | 크기 | 원본 | 성격 |
|------|------|------|------|
| `RIDIBatang.woff2` | 0.44 MB | 1.39 MB (OTF) | 전자책 본문용으로 만든 명조 |
| `NotoSerifKR.woff2` | 1.03 MB | 13.5 MB (TTF) | 본명조. 획이 고르고 자간이 넉넉해 긴 글에 강하다 |
| `GowunBatang.woff2` | 0.46 MB | 8.04 MB (TTF) | 붓끝이 살아 있는 부드러운 바탕. 소설에 어울린다 |
| `NanumBarunGothic.woff2` | 1.31 MB | 2.23 MB (OTF) | 본문 가독성을 목표로 만든 고딕 |
| `Pretendard.woff2` | 0.55 MB | 1.50 MB (OTF) | 화면에서 또렷한 고딕. 자잘한 글자도 잘 버틴다 |

## 어디까지 넣었나

한글 음절 **11,172자를 모두** 넣었습니다. 자주 쓰는 2,350자만 넣는 방식도 있지만,
그러면 `쀼` 같은 글자에서 갑자기 다른 글꼴로 튀어 문장이 어긋나 보입니다.

한자는 **넣지 않았습니다.** 한국 근대문학 75권을 세어 보니 한자는 전체 글자의
0.28% 였는데, 본명조에 한자를 넣으면 1.03MB 가 2.6MB 가 됩니다. 그 몇 글자는
기기에 깔린 글꼴이 대신 그립니다 — 기존 리디바탕도 같은 방식입니다.

그 밖에 라틴 문자, 문장부호(― … “ ” 『 』 「 」), 주석 번호(① ② ③), 전각 기호를
넣었습니다.

## 안 고르면 안 받는다

`@font-face` 로 선언만 해 두었습니다. 브라우저는 **그 글꼴로 실제 글자를 그릴 때**
비로소 파일을 받아옵니다. 그래서 설정에서 고르지 않은 사람은 한 바이트도
받지 않습니다. `font-display:swap` 이라 받아오는 동안에도 글은 바로 보입니다.

## 굵기는 한 벌씩만

**Bold** 는 한 벌에 1MB 가 넘는데 굵게가 필요한 곳은 제목 정도라,
브라우저가 합성하는 것으로 갈음했습니다. 같은 이유로 나눔고딕(바른고딕과 겹침),
나눔스퀘어(각진 제목용)는 넣지 않았습니다.

## 출처와 이용 조건

| 글꼴 | 만든 곳 | 조건 | 라이선스 파일 |
|------|---------|------|----------------|
| 본명조 (Noto Serif KR) | Google | SIL Open Font License 1.1 | `OFL-NotoSerifKR.txt` |
| 고운바탕 (Gowun Batang) | Gowun Batang Project Authors (유양희) | SIL Open Font License 1.1 | `OFL-GowunBatang.txt` |
| 프리텐다드 (Pretendard) | 길형진(Kil Hyung-jin) | SIL Open Font License 1.1 | `OFL-Pretendard.txt` |
| 나눔바른고딕 | 네이버(NAVER) | SIL Open Font License | — |
| RIDIBatang | 리디주식회사(RIDI) | 무료 공개 | — |

OFL 은 글꼴을 잘라 내어(subset) 다시 배포하는 것을 허용하며, 라이선스 문서를
같이 두도록 요구합니다. 그래서 위 세 벌은 원문을 그대로 함께 넣었습니다.

> ⚠️ 나눔바른고딕과 RIDIBatang 은 받은 압축 파일에 라이선스 문서가 들어 있지
> 않아, 위 내용은 각 배포처의 일반적인 공개 조건을 적은 것입니다. 이 저장소는
> 공개 사이트로 배포되므로, 배포 조건을 원 배포처에서 한 번 확인해 두시는
> 편이 좋습니다.

## 다시 만들려면

```sh
pyftsubset NotoSerifKR-400.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0100-017F,U+2010-2027,U+2030-205E,\
U+20A9,U+20AC,U+2122,U+00D7,U+00F7,U+2460-24FF,U+25A0-25FF,U+3000-303F,\
U+3131-318E,U+1100-11FF,U+AC00-D7A3,U+FF01-FF60,U+FFFD" \
  --layout-features='kern,liga,calt,ccmp,locl,vert,vrt2,halt,palt' \
  --no-hinting --desubroutinize --flavor=woff2 --output-file=NotoSerifKR.woff2
```

본명조는 굵기가 이어지는 가변 글꼴이라, 자르기 전에
`fontTools.varLib.instancer` 로 400 한 벌을 뽑아 두어야 합니다.
