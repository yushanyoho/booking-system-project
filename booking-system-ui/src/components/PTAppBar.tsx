import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import BookingSystemContext from '../context/BookingSystemContext';
import iconImage from '../static/logo.png';

const styles = {
    // App Bar 显示在中间的字需要 full growth
    nameText: {
        flexGrow: 1
    },

    // App Bar最左边的icon image
    iconImage: {
        width: '60px',
        height: '60px',
        marginRight: '20px',
    }
}

export default function PTAppBar(): React.ReactElement {
    const history = useHistory();
    const { username, role, setUserName, setRole } = useContext(BookingSystemContext);

    const onLoginButtonClick = useCallback(() => {
        switch (role) {
            // instructor 需要re-direct到 homepage
            case 'Instructor':
                history.push(`/instructor/${username}`);
                break;
            // student 需要re-direct到 homepage
            case 'Student':
                history.push(`/student/${username}`);
                break;
            // 当前没有用户，需要re-direct到 './login'
            default:
                history.push('/login');
        }
    }, [history, role, username]);

    // 清空username和role并redirect到 '/login' 页面
    const onLogOutButtonClick = useCallback(() => {
        localStorage.clear();
        setUserName(null);
        setRole(null);
        history.push('/login');
    }, [history, setRole, setUserName])

    // 通过context中是否存在username来判断目前是需要
    // Log in (username === null) 还是回到 homepage (username != null)
    const buttonText = username ?? 'Log in';

    return (
        <AppBar>
            <Toolbar>
                {/* 原生 html element 只能定义 style，不能使用 sx，但可以引用 typescript */}
                <img src={iconImage} alt='Pivot Tech Logo' style={styles.iconImage} />

                <Typography variant="h6" component="div" sx={styles.nameText}>
                    Pivot Tech Booking System
                </Typography>

                <Button color="inherit" onClick={onLoginButtonClick}>{buttonText}</Button>

                {/* if username is null, don't display, otherwise display 'Log Out' */}
                {Boolean(username) && (
                    <Button color="inherit" onClick={onLogOutButtonClick}>Log Out</Button>
                )}
            </Toolbar>
        </AppBar>
    )

}