import { HighlightOff, HighlightOffOutlined, HighlightOffRounded, HighlightOffSharp, HighlightOffTwoTone } from "@mui/icons-material";
import { Avatar, Box, Container, Typography } from "@mui/material";
import React from "react";
import PTAppBar from "../components/PTAppBar";

const styles = {
    iconContainer: {
        margin: 1,
        bgcolor: 'secondary.dark',
        width: 80,
        height: 80,
    },
    icon: {
        width: 72,
        height: 72,
    },
    title: {
        marginTop: 2,
        marginBottom: 1,
    }
}

export default function NotFoundView(): React.ReactElement {
    return (
        <>
            <PTAppBar />

            {/* 内容全部局中 */}
            <Container sx={{ mt: 10 }}>
                {/*  */}
                <Box sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>

                    {/* 把任意元件切成圆形 */}
                    <Avatar sx={styles.iconContainer}>
                        {/* name: HighlightOff, variant: Outlined */}
                        <HighlightOffTwoTone sx={styles.icon} />
                    </Avatar>
                    <Typography sx={styles.title} component="h1" variant="h4">
                        Page Not Found
                    </Typography>
                </Box>
            </Container>
        </>
    );
}