# 🎮 Connect4 Game

> Java + Swing으로 만든 커넥트4 게임. 사람 vs AI 대전, 3단계 난이도 지원.

![Class Diagram](./docs/class-diagram.png)

---

## 🎯 프로젝트 소개

가로·세로·대각선으로 같은 색 돌 **4개를 먼저 연결**하면 이기는 보드 게임을 Java로 구현했습니다.

객체지향 설계의 핵심 개념(**상속, 인터페이스, 예외 처리**)을 자연스럽게 적용하는 것이 목표였고, AI는 난이도별로 다른 알고리즘(랜덤 → 휴리스틱 → 미니맥스)을 사용해 차별화했습니다.

---

## ✨ 주요 기능

- **3단계 AI 난이도**: 쉬움(랜덤) / 보통(1수 앞 휴리스틱) / 어려움(미니맥스 깊이 3)
- **Swing GUI**: 마우스 클릭으로 직관적인 조작
- **선공 선택**: 사람 또는 AI가 먼저 시작
- **예외 처리**: 잘못된 입력 시 친절한 안내
- **새 게임 기능**: 매 게임마다 난이도/선공 재선택 가능

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|---|---|
| 언어 | Java |
| GUI | Java Swing |


### 활용한 Java 기능
- 추상 클래스 & 인터페이스 (다형성, 전략 패턴)
- 사용자 정의 예외 (Checked Exception)
- 제네릭 컬렉션 (`ArrayList<Integer>`)
- 람다 & 함수형 인터페이스 (`IntConsumer`, `Runnable`)
- Swing 컴포넌트 (JFrame, JPanel, JOptionPane, Timer)
- `paintComponent`로 직접 그리기 + 마우스 이벤트 처리

---

## 📁 프로젝트 구조

```
src/
└── connect4/
    ├── Main.java                          # 진입점
    ├── Game.java                          # 게임 진행 로직
    │
    ├── model/                             # 게임 데이터
    │   ├── Board.java                     # 보드 상태 + 승리 판정
    │   └── Piece.java (enum)              # 돌 종류 (EMPTY/RED/YELLOW)
    │
    ├── player/                            # 플레이어 (상속/다형성)
    │   ├── Player.java (abstract)         # 추상 부모
    │   ├── HumanPlayer.java               # 사람 플레이어
    │   └── AIPlayer.java                  # AI 플레이어
    │
    ├── ai/                                # AI 전략 (인터페이스)
    │   ├── Strategy.java (interface)      # 전략 인터페이스
    │   ├── EasyStrategy.java              # 랜덤
    │   ├── MediumStrategy.java            # 1수 앞 휴리스틱
    │   └── HardStrategy.java              # 미니맥스 알고리즘
    │
    ├── ui/                                # Swing UI
    │   ├── GameFrame.java                 # 메인 창
    │   └── BoardPanel.java                # 보드 그리기 + 클릭 처리
    │
    └── exception/                         # 사용자 정의 예외
        └── InvalidMoveException.java
```

---

## 🏗️ 핵심 설계

### 1. 상속 기반 다형성

`Player` 추상 클래스를 두고 `HumanPlayer`와 `AIPlayer`가 각자 다른 방식으로 `decideMove()`를 구현합니다. `Game` 클래스는 사람인지 AI인지 모르고 `Player` 타입으로만 다루므로, **하나의 코드로 두 플레이어를 모두 처리**할 수 있습니다.

```java
// Game.java — 같은 코드, 다른 동작
int col = currentPlayer.decideMove(board);
//        ↑
//        HumanPlayer면 → 클릭 좌표 반환
//        AIPlayer면    → 알고리즘 결과 반환
```

### 2. 인터페이스 기반 전략 패턴

AI 난이도별로 알고리즘이 다른데, `Strategy` 인터페이스로 추상화하고 3개의 구현체를 만들었습니다. `AIPlayer`는 어떤 Strategy를 주입받느냐에 따라 동작이 달라집니다.

```java
// 난이도 선택에 따라 다른 Strategy 주입
new AIPlayer("AI", Piece.YELLOW, new EasyStrategy());
new AIPlayer("AI", Piece.YELLOW, new MediumStrategy());
new AIPlayer("AI", Piece.YELLOW, new HardStrategy());
```

| 난이도 | 알고리즘 | 특징 |
|---|---|---|
| 쉬움 | 랜덤 선택 | 가능한 열 중 무작위 |
| 보통 | 1수 앞 휴리스틱 | 이기는 수 / 막는 수 / 가운데 우선 |
| 어려움 | 미니맥스 (깊이 3) | 미래 3수까지 시뮬레이션 후 최적 선택 |

### 3. 예외 처리

`InvalidMoveException`이라는 사용자 정의 검사 예외를 만들어 다음 상황을 처리합니다:

- 보드 범위 밖 열 클릭 → 예외 발생
- 가득 찬 열에 두기 시도 → 예외 발생
- 잘못된 Piece(EMPTY)로 두기 시도 → 예외 발생

`Board`에서 예외를 던지고, `Game`이 throws로 전파하며, 최종적으로 `GameFrame`이 catch해서 사용자에게 다이얼로그로 안내합니다.

---

## 🎮 게임 흐름

```
[프로그램 시작]
       ↓
[난이도 선택]  ← 쉬움 / 보통 / 어려움
       ↓
[선공 선택]   ← 사람 / AI
       ↓
[게임 진행]   ← 사람 클릭 ↔ AI 자동 (Swing Timer로 0.6초 딜레이)
       ↓
[게임 종료]   ← 4목 완성 또는 무승부
       ↓
[새 게임]    ← 처음으로 반복
```

---

## ▶️ 실행 방법

### 요구사항
- **JDK 17 이상**

### 방법 1: Eclipse에서 실행
1. 프로젝트 import
2. `src/connect4/Main.java` 우클릭 → Run As → Java Application

### 방법 2: 명령어로 실행
```bash
cd src
javac connect4/Main.java
java connect4.Main
```

---

## 🧠 미니맥스 알고리즘

어려움 난이도의 AI는 미니맥스 알고리즘을 사용합니다.

- **AI 차례**에는 점수를 **최대화**하려고 함
- **상대 차례**에는 AI의 점수를 **최소화**한다고 가정
- 깊이 3까지 모든 가능한 수를 시뮬레이션
- 종착점 보드를 평가 함수(가운데 열 가중치)로 점수화

```java
// HardStrategy.java의 핵심 로직
private int minimax(Board board, int depth, boolean isMaximizing, ...) {
    if (depth == 0 || board.isFull()) {
        return evaluate(board, myPiece, opponentPiece);
    }
    
    if (isMaximizing) {
        // 가능한 모든 수에 대해 최대 점수 찾기
        ...
    } else {
        // 상대 입장에서 최소 점수 찾기
        ...
    }
}
```

---

## 📚 배운 점

- **추상 클래스 vs 인터페이스의 선택 기준**: 공통 상태가 있으면 추상 클래스(Player), 행동만 정의하면 인터페이스(Strategy)
- **전략 패턴의 실용성**: 알고리즘을 갈아끼우기 쉬워 난이도 추가/변경이 자유로움
- **Checked Exception의 가치**: 컴파일러가 예외 처리를 강제해서 누락 방지
- **Swing 그리기**: `paintComponent`로 직접 그리는 방식과 좌표 계산 방법
- **이벤트 드리븐 UI**: 콜백 패턴으로 BoardPanel ↔ GameFrame 통신

---

## 📷 스크린샷

> 게임 플레이 화면을 추가해주세요

<!-- 
![난이도 선택](./docs/screenshots/difficulty.png)
![게임 플레이](./docs/screenshots/gameplay.png)
![게임 종료](./docs/screenshots/gameover.png)
-->

---

## 📄 원본 다이어그램

수정 가능한 원본 파일: [class-diagram.drawio](./docs/class-diagram.drawio)
