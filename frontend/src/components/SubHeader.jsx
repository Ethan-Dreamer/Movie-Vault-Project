import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import HomeIcon from '@mui/icons-material/Home';
import Box from "@mui/material/Box";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function SubHeader({title}) {
    const navigate = useNavigate();
    return (
        <Box className="watched-short-title" sx={styles.headerBar}>
            <HomeIcon style={styles.homeIcon} onClick={()=>navigate("/home")} />
            <NavigateNextIcon style={styles.icon} />
            <Box component="h2">{title}</Box>
        </Box>);
}

const styles = {
    headerBar: {
        backgroundColor: "rgb(255, 255, 255)",
    },
    homeIcon: {
        color: "rgb(195, 5, 5)",
        marginLeft: 10,
        fontSize: "25px",
        cursor: "pointer",
    },
    icon: {
        color: "rgb(195, 5, 5)",
        marginLeft: 5,
        marginRight: 5,
        fontSize: "25px",
    },
}