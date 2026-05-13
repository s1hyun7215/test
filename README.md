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
- AIPlayer는 구체 클래스가 아닌 Strategy 인터페이스에 의존 (**DIP, 의존성 역전 원칙**)

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
- Player는 "수를 결정한다"는 단일 책임만 가짐 (**SRP, 단일 책임 원칙**)

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

## 🚨 예외 처리 설계

게임 중 발생할 수 있는 **잘못된 수(Invalid Move)** 를 명확히 다루기 위해 사용자 정의 예외 `InvalidMoveException`을 정의했습니다.

### 예외 상황 및 처리 방식

#### 실제 발생 가능 예외

| 상황 | 처리 방식 |
|------|-----------|
| 사용자가 이미 가득 찬 열을 클릭한 경우 | `Board.dropPiece()`에서 예외 발생 → `GameFrame`이 `JOptionPane`으로 알림 후 다시 입력 대기 |

#### 방어적 예외 처리

정상적인 흐름에서는 발생하지 않지만, 호출 규약을 어긴 코드가 조용히 동작하지 않도록 명시적으로 예외를 발생시킵니다.

| 상황 | 발생 위치 |
|------|-----------|
| 잘못된 열 번호 (음수/범위 초과)로 호출 | `Board.dropPiece()` |
| `EMPTY` 말을 놓으려 할 때 | `Board.dropPiece()` |
| 클릭 입력 없이 `decideMove()`가 호출된 경우 | `HumanPlayer.decideMove()` |
| 둘 수 있는 열이 하나도 없는 상태에서 호출 | `Strategy.decideMove()` |

- 잘못된 열 번호(음수/범위 초과) → UI에서 좌표 계산할 때 `col < 0 || col >= Board.COLS` 체크하니까 안 들어옴
- `EMPTY` 말을 놓으려 함 → 코드 어디서도 `EMPTY`를 인자로 안 넘김
- 클릭 없이 `HumanPlayer.decideMove()` 호출 → `GameFrame.handleHumanClick()`이 클릭 후에만 `playOneTurn()` 부르니까 안 일어남
- 둘 수 있는 열이 없음 → 보드가 가득 차면 Game이 먼저 DRAW 상태로 만들어서 AI 호출 자체가 안 됨

<br>

### 예외 처리 흐름

예외는 발생한 곳에서 바로 처리하지 않고, **상위 계층(`GameFrame`)까지 전파**되어 사용자에게 알림 다이얼로그로 표시됩니다.

```java
// GameFrame.java
private void playOneTurn() {
    try {
        game.playTurn();
        // ... 정상 처리
    } catch (InvalidMoveException e) {
        // 사용자에게 알림, 다시 입력받기
        JOptionPane.showMessageDialog(this, 
            e.getMessage(), "잘못된 수", JOptionPane.WARNING_MESSAGE);
    }
}
```

<br>

### 이렇게 설계한 이유

- **명확한 의미 전달** — `boolean` 반환값 대신 예외를 사용해 "정상 흐름이 아닌 비정상 상황"임을 명시
- **에러 메시지 일원화** — 어떤 종류의 잘못된 수든 `getMessage()`로 사용자에게 그대로 전달 가능
- **책임 분리** — `Board`와 `Player`는 예외를 **발생시키기만** 하고, UI 계층(`GameFrame`)이 **처리**를 담당
- **게임 진행 보호** — 예외가 발생해도 게임이 종료되지 않고, 사용자가 다시 입력할 수 있도록 복구
