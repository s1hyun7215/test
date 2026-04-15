import { MdAdd } from 'react-icons/md';
import './TodoInsert.scss';
import { useCallback, useState } from 'react';

const TodoInsert = ({ onInsert }) => {
  const [value, setValue] = useState('');

  // useCallback:함수 재사용
  const onChange = useCallback((e) => {
    setValue(e.target.value);
    // onChange 함수가 호출이 될 떄마다 변경되야 할 변수명 -> 의존성 배열
  }, []);

  const onSubmit = useCallback(
    (e) => {
      onInsert(value);
      setValue(''); // value 값 초기화
      // submit 이벤트는 브라우저에서 새로고침을 발생시킨다
      // 이를 방지하기 위해
      e.preventDefault();
    },
    [onInsert, value],
  );

  return (
    <form className="TodoInsert" onSubmit={onSubmit}>
      <input
        value={value}
        onChange={onChange}
        placeholder="할 일을 입력하세요"
      />
      <button type="submit">
        <MdAdd />
      </button>
    </form>
  );
};

export default TodoInsert;
