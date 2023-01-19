import { Alert, Avatar, Box, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { AccountCircleOutlined } from '@mui/icons-material';
import useAuthenticationForm from '../hooks/useAuthenticationForm';
import BookingSystemRequest from '../utils/BookingSystemRequest';
import { Role } from '../context/BookingSystemContext';

const styles = {
    accountIcon: {
        margin: 1,
        bgcolor: 'secondary.main'
    },
    button: {
        marginTop: 3,
        matginBottom: 2,
    },
    form: {
        marginTop: 1,
    },
    title: {
        marginBottom: 2,
    },
    grade: {
        marginTop: 2,
    },
    tabGroup: {
        borderBottom: 1,
        borderColor: 'divider',
    }
}

export default function PTSignUpForm(): React.ReactElement {
    // Input states
    const [tab, setTab] = useState('Student');
    const [userNameInput, setUserNameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [gradeInput, setGradeInput] = useState('Freshman');
    const [introduction, setIntroduction] = useState('');

    const onUserNameChange = useCallback((e) => {
        setUserNameInput(e.target.value);
    }, []);
    const onPasswordChange = useCallback((e) => {
        setPasswordInput(e.target.value);
    }, []);
    // function(event: React.SyntheticEvent, value: any) => void
    const onTabChange = useCallback((e, newValue) => {
        // catch tab value，记录 click on 'Student' tab or 'Instructor' tab
        // 之后用于判断显示 Introduction TextField (Instructor) or Grade TextField (Student)
        setTab(newValue);
    }, []);

    const onGradeChange = useCallback((e) => {
        setGradeInput(e.target.value as string);
    }, []);
    const onIntroChange = useCallback((e) => {
        setIntroduction(e.target.value);
    }, []);

    // Request Handling
    const {
        isLoading,
        errorMessage,
        onRequestStart,
        onErrorMsgClose,
        onRequestFailed,
        onRequestSuccess,
    } = useAuthenticationForm(
        // 和LoginForm不同，这里不需要parseResponse，SignUp的时候用户端本身有可用的userName和role
        () => {
            return {
                username: userNameInput,
                role: tab as Role,
            };
        }
    );

    /** set role + re-direct */
    const onLoginSuccess = useCallback(() => {
        const isStudent = tab === 'Student';
        const path = isStudent ? 'students' : 'instructors';
        const payload = isStudent ? {grade: gradeInput} : {introduction: introduction}
        new BookingSystemRequest(`${path}/${userNameInput}`, 'POST') // /api/instructors/yyy: createOrUpdateInstructor(), /api/students/ysl: createOrUpdateStudent()
            .setPayload(payload)
            .onSuccess(onRequestSuccess) // parseResponse -> set context -> re-direct to homepage ( history.push() )
            .onFailure(onRequestFailed) // setErrorMessage
            .onError(onRequestFailed) // setErrorMessage
            .send();
        },
        // 将 new BookingSystemRequest() 中用到的所有变量添加到dependency中（setPayload)
        // 否则callback function发送request时不能及时更新相应信息
        [gradeInput, introduction, onRequestFailed, onRequestSuccess, tab, userNameInput]
    );

    /** login */
    const onUserCreationSuccess = useCallback(() => {
        // login: url = 'api/login?username={userNameInput}&password={passwordInput}
        new BookingSystemRequest(`login?username=${userNameInput}&password=${passwordInput}`, 'POST', true)
            .onStart(onRequestStart)
            .onSuccess(onLoginSuccess) // 如果 login 成功，调用onLoginSuccess以re-direct到user homepage
            .onFailure(onRequestFailed) // setErrorMessage
            .onError(onRequestFailed) // setErrorMessage
            .send();
    }, [onRequestStart, onRequestFailed, onLoginSuccess, userNameInput, passwordInput]);

    /** SignUp */
    const onSubmit = useCallback((e) => {
        // Create User Request: url = '/api/users', method = 'POST', body = payload
        // constructor(path: string, method: Method, isFormData=false) {...}
        new BookingSystemRequest(`users`, 'POST')
            .setPayload({ username: userNameInput, password: passwordInput }) // set POST body
            .onStart(onRequestStart) // isLoading = true
            .onSuccess(onUserCreationSuccess) // 如果 SignUp 成功，调用onUserCreationSuccess来login
            .onFailure(onRequestFailed) // errorMessage
            .onError(onRequestFailed) // errorMessage
            .send();
        e.preventDefault();
    }, [onRequestFailed, onRequestStart, onUserCreationSuccess, userNameInput, passwordInput]);

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Avatar sx={styles.accountIcon}>
                    <AccountCircleOutlined />
                </Avatar>
                <Typography sx={styles.title} component="h1" variant="h4">
                    Sign Up
                </Typography>
                {isLoading && <CircularProgress sx={{ mt: 2 }} />}
                {errorMessage != null && (
                    <Alert onClose={onErrorMsgClose} severity="error" sx={{ mt: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
                <Box sx={styles.tabGroup}>
                    {/* 一个tab group，onChange时向function (event, value) => void 传入选中的tab所对应的value */}
                    <Tabs value={tab} onChange={onTabChange}>
                        <Tab tabIndex={0} value='Student' label="Student" />
                        <Tab tabIndex={1} value='Instructor' label="Instructor" />
                    </Tabs>
                </Box>
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
                        onChange={onPasswordChange}
                        type="password"
                        autoFocus
                    />

                    {/* if click on tab 'Instructor', show TextField Introduction */}
                    {tab === 'Instructor' && (<TextField
                        margin="normal"
                        fullWidth
                        id="intro"
                        label="Introduction"
                        name="Introduction"
                        onChange={onIntroChange}
                    />)}
                    {/* If click on tab 'Student', show TextField Grade */}
                    {tab === 'Student' && (
                        <FormControl sx={styles.grade} fullWidth>
                            <InputLabel id="grade-label">Grade</InputLabel>
                            <Select
                                labelId='grade-label'
                                id="grade"
                                fullWidth
                                label="Grade"
                                value={gradeInput}
                                onChange={onGradeChange}
                            >
                                <MenuItem value={'Freshman'}>Freshman</MenuItem>
                                <MenuItem value={'Sophoremore'}>Sophoremore</MenuItem>
                                <MenuItem value={'Junior'}>Junior</MenuItem>
                                <MenuItem value={'Senior'}>Senior</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    <Button
                        type="submit"
                        sx={styles.button}
                        fullWidth
                        variant="contained"
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    )
}