# 🎮 커넥트4 (Connect Four)

Java 기반으로 구현한 1인용 **커넥트4** 게임입니다.<br>
6×7 보드에서 가로·세로·대각선으로 먼저 4개를 연결하면 승리하는 보드게임입니다.<br>
AI 난이도(쉬움/보통/어려움)를 선택할 수 있으며, **Minimax 알고리즘**과 **휴리스틱**, **랜덤 전략**을 사용합니다.


## 🎯 개발 목표

객체지향 설계 원칙과 디자인 패턴을 실제 프로젝트에 적용해보는 것을 목표로 진행했습니다.

- **디자인 패턴 적용** — 전략 패턴(Strategy Pattern)을 사용해 AI 난이도를 손쉽게 교체·확장할 수 있는 구조 설계
- **추상화와 다형성** — `Player` 추상 클래스를 두어 사람과 AI를 동일한 인터페이스로 처리
- **알고리즘 구현** — Minimax 알고리즘과 휴리스틱 평가 함수를 구현
- **예외 처리 설계** — 커스텀 예외(`InvalidMoveException`)를 정의해 잘못된 입력을 명확히 분리


## 🎮 주요 기능

- **사람 vs AI 대전** — 사용자가 AI와 1:1로 대전
- **난이도 선택** — 게임 시작 시 3단계 난이도 중 선택
  - `쉬움` : 유효한 열 중 무작위로 선택
  - `보통` : 즉시 승리/방어 + 중앙 선호 (1수 앞 탐색)
  - `어려움` : Minimax 알고리즘 (깊이 3) + 휴리스틱 평가
- **선공 선택** — 사람과 AI 중 누가 먼저 둘지 선택 가능
- **GUI 기반 조작** — 마우스 클릭으로 원하는 열에 말 떨어뜨리기
- **실시간 상태 표시** — 현재 차례, 승패 결과를 화면 상단에 표시
- **새 게임** — 게임 종료 후 버튼 클릭으로 난이도·선공 재선택하여 재시작

## 🛠️ 기술 스택

- **언어**: Java
- **GUI**: Swing
- **데이터 관리**: ArrayList
- **예외 처리**: 사용자 정의 예외 (`InvalidMoveException`)

## 📘 클래스 다이어그램

<!-- 여기에 클래스 다이어그램 이미지를 넣으세요 -->

![Class Diagram](./images/class-diagram.png)


## 🏛️ 핵심 설계 (OOP)

객체지향 설계 원칙과 디자인 패턴을 적용해 **확장 가능하고 유지보수하기 좋은 구조**를 목표로 설계했습니다.

<br>

### 1. 전략 패턴 (Strategy Pattern)

AI의 난이도별 행동 방식을 `Strategy` 인터페이스로 추상화하고, 각 난이도를 별개의 구현 클래스로 분리했습니다.

```
Strategy (interface)
├── EasyStrategy     ← 랜덤 선택
├── MediumStrategy   ← 즉시 승리/방어 + 중앙 선호
└── HardStrategy     ← Minimax + 휴리스틱 평가
```

`AIPlayer`는 어떤 전략을 사용하는지 알 필요 없이 `strategy.decideMove(board, piece)` 만 호출합니다.

```java
public class AIPlayer extends Player {
    private final Strategy strategy;

    public int decideMove(Board board) throws InvalidMoveException {
        return strategy.decideMove(board, piece);
    }
}
```

**이렇게 설계한 이유**
- 새로운 난이도(예: 매우 어려움)를 추가할 때 `Strategy` 인터페이스만 구현하면 됨
- 기존 코드 수정 없이 기능 확장 가능 (**OCP, 개방-폐쇄 원칙**)
- 런타임에 난이도를 동적으로 교체할 수 있음

<br>

### 2. 추상 클래스를 통한 플레이어 추상화

사람과 AI는 입력 방식이 전혀 다르지만(마우스 클릭 vs 알고리즘 계산), 게임 입장에서는 **"다음에 둘 열을 결정한다"** 라는 동일한 행동을 합니다. 이를 `Player` 추상 클래스로 묶었습니다.

```
Player (abstract)
├── HumanPlayer  ← 마우스 클릭으로 입력받은 열 반환
└── AIPlayer     ← Strategy를 통해 계산한 열 반환
```

```java
public abstract class Player {
    public abstract int decideMove(Board board) throws InvalidMoveException;
}
```

**이렇게 설계한 이유**
- `Game` 클래스는 현재 플레이어가 사람인지 AI인지 신경 쓸 필요 없음
- 게임 진행 로직이 `currentPlayer.decideMove(board)` 한 줄로 단순해짐
- 향후 네트워크 플레이어, 리플레이 플레이어 등도 같은 방식으로 확장 가능

<br>

### 3. 다형성을 활용한 게임 로직 단순화

위 두 가지 설계 덕분에 `Game.playTurn()` 메서드가 매우 간결해졌습니다.

```java
public int playTurn() throws InvalidMoveException {
    // 사람이든 AI든, 쉬움이든 어려움이든 동일하게 처리
    int col = currentPlayer.decideMove(board);
    int row = board.dropPiece(col, currentPlayer.getPiece());
    
    if (board.checkWin(row, col)) { /* 승리 처리 */ }
    else if (board.isFull())       { /* 무승부 처리 */ }
    else                           { switchTurn(); }
    
    return row;
}
```

`Game`은 **누가 어떻게 수를 결정하는지** 전혀 모릅니다. 그저 `Player`에게 묻고, `Board`에 반영할 뿐입니다. 이러한 책임 분리 덕분에 각 클래스가 자기 역할에만 집중할 수 있습니다.

<br>

### 📦 패키지 구조

```
connect4/
├── Main.java              # 진입점, 난이도/선공 선택 다이얼로그
├── Game.java              # 게임 진행 관리
├── model/
│   ├── Board.java         # 6×7 보드, 승패 판정
│   └── Piece.java         # RED, YELLOW, EMPTY
├── player/
│   ├── Player.java        # 추상 클래스
│   ├── HumanPlayer.java
│   └── AIPlayer.java
├── ai/
│   ├── Strategy.java      # 전략 인터페이스
│   ├── EasyStrategy.java
│   ├── MediumStrategy.java
│   └── HardStrategy.java
├── ui/
│   ├── GameFrame.java     # 메인 창
│   └── BoardPanel.java    # 보드 렌더링 + 마우스 입력
└── exception/
    └── InvalidMoveException.java
```
