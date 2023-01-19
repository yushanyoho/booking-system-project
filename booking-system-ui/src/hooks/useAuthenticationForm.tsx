import { useCallback, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import BookingSystemContext, { Role } from "../context/BookingSystemContext";

interface AuthenticationFormStates {
    isLoading: boolean,
    errorMessage: string | null,
    onRequestStart: () => void,
    onErrorMsgClose: () => void,
    onRequestFailed: () => void,
    onRequestSuccess: (response: any) => void,
}

const defaultErrorMessage = 'There has been an error processing your request';

/** Define a set of handler methods */
export default function useAuthenticationForm(
    parseResponse: (request: any) => {username: string | null, role: Role | null}
): AuthenticationFormStates {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { setUserName, setRole } = useContext(BookingSystemContext);

    /** When the request start, set isLoading = true */
    const onRequestStart = useCallback(() => {
        setIsLoading(true);
    }, []);

    /** Whe the errorMessage window is closed by user, restore errorMessage = null */
    const onErrorMsgClose = useCallback(() => {
        setErrorMessage(null);
    }, []);

    /** When the request failed, set and errorMessage and set isLoading = false */
    const onRequestFailed = useCallback(() => {
        setErrorMessage(defaultErrorMessage);
        setIsLoading(false);
    }, []);

    const history = useHistory();


    const onRequestSuccess = useCallback((response) => {
        setIsLoading(false);

        // 当调用 'user/{username}' 成功收到 response，将response内的信息deserialize 为 object，以供后续调用
        const {username, role} = parseResponse(response);

        // 如果没有拿到用户信息，需要返回error
        if (username == null || role == null) {
            setErrorMessage(defaultErrorMessage);
            return;
        }

        // set context，从而整个App都可以拿到 username 和 role 的信息
        setUserName(username);
        setRole(role);
        // 将当前用户名储存在 localStorage 中
        localStorage.setItem('username', username); // localStorage.setItem(key, value)

        switch (role) {
            case 'Student':
                history.push(`/student/${username}`); // re-direct to student homepage
                break;
            case 'Instructor':
                history.push(`instructor/${username}`); // re-direct to instructor homepage
                break;
        }
    }, [history, parseResponse, setRole, setUserName]);

    return {
        isLoading,
        errorMessage,
        onRequestStart,
        onErrorMsgClose,
        onRequestFailed,
        onRequestSuccess,
    }
}