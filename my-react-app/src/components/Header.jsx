import React, { useEffect, useState, useRef } from "react";
import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";

export default function Header() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === "Tab" || event.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <header>
      <MovieFilterOutlinedIcon fontSize="large" sx={styles.filterIcon} />
      <h1 className="web-title">MovieVault</h1>

      <Stack direction="row" spacing={2} sx={styles.stack}>
        <div>
          <AccountCircleIcon
            ref={anchorRef}
            onClick={handleToggle}
            fontSize="large"
            sx={styles.accountIcon}
          />
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-end"
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom-end" ? "right top" : "right bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList autoFocusItem={open} onKeyDown={handleListKeyDown}>
                      <MenuItem
                        onClick={() => {
                          window.location.href = "http://localhost:3000/logout";
                        }}
                      >
                        Logout
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </Stack>
    </header>
  );
}

const styles = {
  filterIcon: {
    color: "white",
    marginRight: 1,
  },
  stack: {
    marginLeft: "auto",
    zIndex: 999,
  },
  accountIcon: {
    color: "white",
    cursor: "pointer",
    transition: "transform 0.1s ease",
    "&:hover": {
      transform: "scale(0.9)",
    },
  },
};