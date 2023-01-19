import { Alert, Avatar, Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import BookingSystemRequest from '../utils/BookingSystemRequest';
import useAuthenticationForm from '../hooks/useAuthenticationForm';
import { Role } from '../context/BookingSystemContext';

const styles = {
    lockIcon: {
        margin: 1,
        bgcolor: 'secondary.main'
    },
    button: {
        marginTop: 3,
        matginBottom: 2,
    },
    form: {
        marginTop: 1,
    }
}

export default function PTLoginForm(): React.ReactElement {
    // Input states
    const [userNameInput, setUserNameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    
    // e: html event，TextField每次改变就调用一次（如"aaa"调用三次）
    const onUserNameChange = useCallback((e) => {
        // 把userNameInput设置为event.target.value即用户输入值，供onSubmit, onLoginSuccess使用
        setUserNameInput(e.target.value);
    }, []);
    const onPasswordChange = useCallback((e) => {
        // 把passwordInput设置为event的value（即输入值），供onSubmit, onLoginSuccess使用
        setPasswordInput(e.target.value);
    }, []);

    /** 将会在调用useAuthenticationForm的时候被传入constructor */
    const parseResponse = useCallback((response) => {
        if (!Boolean(response)) { // if response is null, return an object with no empty username and role
            return {
                username: null,
                role: null,
            };
        }
        const parsedResponse = JSON.parse(response);
        return {
            username: parsedResponse.username,
            role: (parsedResponse.student?.id != null ? 'Student' : 'Instructor') as Role,
        };
    }, []);

    // Request Handling
    const {
        isLoading,
        errorMessage,
        onRequestStart, // -> onStart
        onErrorMsgClose,
        onRequestFailed, // -> onFailure, onError
        onRequestSuccess, // -> onSuccess
    } = useAuthenticationForm(parseResponse); // 把parseRequest

    /** re-direct */
    const onLoginSuccess = useCallback(() => {
        // constructor(path: string, method: Method, isFormData=false) {...}
        // login 成功后要对 'user/{username}' 做一次 'GET' 以达到re-diret to homepage的效果
        // 将用户在TextField中输入的userNameInput 作为 @PathVariable
        new BookingSystemRequest(`users/${userNameInput}`, 'GET') // 创建request
            .onSuccess(onRequestSuccess) // parseResponse -> set context -> re-direct to homepage ( history.push() )
            .onFailure(onRequestFailed) // setErrorMessage
            .onError(onRequestFailed) // setErrorMessage
            .send(); // 发送request
    }, [onRequestFailed, onRequestSuccess, userNameInput]);

    /** login */
    const onSubmit = useCallback((e) => {
        // constructor(path: string, method: Method, isFormData=false) {...}
        // 要对 'login/?username={username}&password={parrword}' 做一次 'POST'
        // 后端login需要提供FormData，将 username & password 作为 @RequestParam
        new BookingSystemRequest(`login?username=${userNameInput}&password=${passwordInput}`, 'POST', true)
            .onStart(onRequestStart) // set isLoading = true
            .onSuccess(onLoginSuccess) // 如果login验证成功，调用onLoginSuccess
            .onFailure(onRequestFailed) // setErrorMessage
            .onError(onRequestFailed) // setErrorMessage
            .send(); // 发送login request

        e.preventDefault();
    }, [onRequestFailed, onRequestStart, onLoginSuccess, userNameInput, passwordInput]);

    const history = useHistory();
    const onSignUpButtonClicked = useCallback(() => {
        history.push(`/signup`);
    }, [history]);

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Avatar sx={styles.lockIcon}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h4">
                    Log in
                </Typography>
                {isLoading && <CircularProgress sx={{ mt: 2 }} />}
                {errorMessage != null && (
                    <Alert onClose={onErrorMsgClose} severity="error" sx={{ mt: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
                <Box component="form" onSubmit={onSubmit} sx={styles.form}>
                    <TextField
                        margin="normal"
                        fullWidth
                        required
                        id="username"
                        label="User Name"
                        name="username"
                        autoComplete="username"
                        onChange={onUserNameChange}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        required
                        id="password"
                        label="Password"
                        name="password"
                        autoComplete="password"
                        // type设为password，输入时隐藏
                        type="password"
                        onChange={onPasswordChange}
                        autoFocus
                    />
                    
                    {/* 和直接在Button内定义 onClick={onSubmit} 有什么区别？ */ }
                    <Button
                        type="submit"
                        sx={styles.button}
                        fullWidth
                        variant="contained"
                    >
                        Log In
                    </Button>

                    {/* sign up button不需要随每次整个Form一起re-render*/}
                    {/* 使用useCallBack记住 onSignUpButtonClicked 可以防止每次重新创建function而导致props改变而重新渲染 */}
                    <Button
                        sx={styles.button}
                        fullWidth
                        variant="contained"
                        onClick={onSignUpButtonClicked}
                    >
                        Don't have an account? Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    )

}