import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import BookingSystemRequest from "../utils/BookingSystemRequest";

export type Role = 'Student' | 'Instructor';

export interface BookingSystemContextInterface {
  username: string | null;
  role: Role | null;
  setUserName: (username: string | null) => void;
  setRole: (role: Role | null) => void;
}

const emptyFunction = () => { };
const emptyContext: BookingSystemContextInterface = {
  username: null,
  role: null,
  setUserName: emptyFunction,
  setRole: emptyFunction,
}
const BookingSystemContext: React.Context<BookingSystemContextInterface> = React.createContext(emptyContext);

interface Props {
  children: React.ReactElement;
}
export function BookingSystemContextProvider({
  children
}: Props): React.ReactElement {
  const [username, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  // Fetch user information from local storage
  const onRequestSuccess = useCallback((response) => {
    if (!Boolean(response)) {
        return;
    }
    response = JSON.parse(response);

    const username = response.username;
    const role = response.instructor?.id != null ? 'Instructor' : 'Student';

    // set context -> 触发re-render studentView / instructorView
    setUserName(username);
    setRole(role);
  }, [setRole, setUserName]);

  // 仅在初次渲染（mount）context provider的时候运行
  useEffect(() => {
    // 拿到localStorage中存储的username
    const userFromStorage = localStorage.getItem('username');
    if (userFromStorage != null) {
      // 直接通过存储的username拿到用户信息
      new BookingSystemRequest(`users/${userFromStorage}`, 'GET')
            .onSuccess(onRequestSuccess)
            .send();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const initialValue: BookingSystemContextInterface = { username, role, setUserName, setRole };

  return (
    <BookingSystemContext.Provider value={initialValue}>
      {children}
    </BookingSystemContext.Provider>
  );
}

// 其他component使用context时要用到同一个context object
export default BookingSystemContext;