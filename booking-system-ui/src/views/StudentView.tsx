import { Container } from "@mui/material";
import React, { useContext, useEffect } from "react";
// Hooks
import { useHistory, useParams } from "react-router";
import LoadingContainer from "../components/LoadingContainer";
import MyCalendar from "../components/MyCalendar";
import PTAppBar from "../components/PTAppBar";
import BookingSystemContext from "../context/BookingSystemContext";
import useUserCheck from "../hooks/useUserCheck";
import { RouteParams } from "./InstructorView";

export default function StudentView(): React.ReactElement {
    // useContext() 返回一个object (BookingSystemContextInterface)，其中有uername, role等一些fields
    // 我们提取出username和role，并把username的value赋值给一个新的变量 viewerUserName
    const {username: viewerUserName, role} = useContext(BookingSystemContext);

    // useParams() 返回一个object (RouteParams 自定义的)，其中有一个field叫做username
    // 将username的value赋值给一个新的变量 studentUserName
    const {username: studentUserName} = useParams<RouteParams>();

    const history = useHistory();

    const isLoading = useUserCheck(
        (parsedRes) => parsedRes?.student?.id == null
    );

    useEffect(() => {
        // Only student themselves can see this page
        if (studentUserName !== viewerUserName && role != null){
            history.push('/');
        }
    }, [history, role, studentUserName, viewerUserName]);

    useEffect(() => {

    }, []);

    return (
        <>
            <PTAppBar />
            <Container sx={{mt: 10}}>
                <LoadingContainer isLoading={isLoading}>
                    <MyCalendar />
                </LoadingContainer>
            </Container>
        </>
    );
}