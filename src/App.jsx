import React, { useCallback, useReducer, useRef } from 'react';
import TodoTemplate from './components/TodoTemplate';
import TodoInsert from './components/TodoInsert';
import TodoList from './components/TodoList';

function createBulkTodos() {
  const array = [];
  for (let i = 1; i <= 3000; i++) {
    array.push({
      id: i,
      text: `할 일 ${i}`,
      checked: false,
    });
  }
  return array;
}

function todoReducer(todos, action) {
  switch (action.type) {
    case 'INSERT': // 새로 추가
      // {type:'INSERT', todo:{id:1, text:'todo', checked:false}}
      return todos.concat(action.todo);
    case 'REMOVE': // 제거
      // {type:'REMOVE', id:1}
      return todos.filter((todo) => todo.id !== action.id);
    case 'TOGGLE': // 토글
      // {type:'TOGGLE', id:1}
      return todos.map((todo) =>
        todo.id === action.id ? { ...todo, checked: !todo.checked } : todo,
      );
    default:
      return todos;
  }
}

function App() {
  // 두번째에 undefined를 넣고, 세번째 파라미터에 초기 상태를 만드는 함수(createBulkTodos)를 넣으면
  // 컴포넌트가 처음 렌더링 될 때만 createBulkTodos 함수를 호출된다.
  // const [todos, dispatch] = useReducer(todoReducer, createBulkTodos); 이 기본방식 이지만
  // 중간에 undefined 를 넣으면 처음엔 undefined 가 초기화 값으로 들어갔다가 createBulkTodos를 한번만 받아온다
  const [todos, dispatch] = useReducer(todoReducer, undefined, createBulkTodos);

  // 고유값으로 사용 될 id
  // ref를 사용하여 변수 담기
  // 변경이 잦은 변수를 담는공간
  const nextId = useRef(3001);

  const onInsert = useCallback((text) => {
    const todo = {
      id: nextId.current,
      text,
      checked: false,
    };
    dispatch({ type: 'INSRET', todo });
    nextId.current += 1; // nextId 1씩 더하기
  }, []);

  const onRemove = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const onToggle = useCallback((id) => {
    dispatch({ type: 'TOGGLE', id });
  }, []);

  return (
    <div>
      <TodoTemplate>
        <TodoInsert onInsert={onInsert} />
        <TodoList todos={todos} onRemove={onRemove} onToggle={onToggle} />
      </TodoTemplate>
    </div>
  );
}

export default App;
