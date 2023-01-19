import { BrowserRouter as Router, Switch, Route, } from "react-router-dom";
import React from "react";
import LoginView from "./views/LoginView";
import StudentView from "./views/StudentView";
import InstructorView from "./views/InstructorView";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/system";
import { BookingSystemContextProvider } from "./context/BookingSystemContext";
import SignUpView from "./views/SignupView";
import NotFoundView from "./views/NotFoundView";

export default function App(): React.ReactElement {
  const theme = createTheme();
  return (
    <BookingSystemContextProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            {/* 按从上到下的顺序检查path，所以 "/" 必须放在最后 */}
            <Route path="/student/:username"> {/* :<parameter> 引用变量名，可以有多个 */}
              <StudentView />
            </Route>
            <Route path="/instructor/:username">
              <InstructorView />
            </Route>
            <Route path="/login">
              <LoginView />
            </Route>
            <Route path="/signup">
              <SignUpView />
            </Route>
            <Route path="/">
              <NotFoundView />
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </BookingSystemContextProvider>
  );
}