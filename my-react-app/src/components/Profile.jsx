import React, { useState, useRef } from "react";
import LocalMoviesRoundedIcon from "@mui/icons-material/LocalMoviesRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Button, Box, TextField, Avatar, IconButton, Typography, CircularProgress, Container, Snackbar, Alert } from "@mui/material";
import SubHeader from "./SubHeader";
import {API_URL} from "../config";

export default function Profile({ user, watched = [] }) {
    const fileInputRef = useRef(null);

    const [name, setName] = useState(user?.name || "");
    const [editingName, setEditingName] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.profile_pic || null);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [profileImg, setProfileImage] = useState(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setAvatarPreview(URL.createObjectURL(file));
        setProfileImage(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            let finalAvatarUrl = user?.avatar_url || null;

            if (profileImg) {
                const formData = new FormData();
                formData.append("file", profileImg);
                formData.append("upload_preset", "my-present"); 
                formData.append("cloud_name", "daol4gyo7");

                const cloudinaryRes = await fetch(
                    `https://api.cloudinary.com/v1_1/daol4gyo7/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const cloudinaryData = await cloudinaryRes.json();
                
                if (cloudinaryData.secure_url) {
                    finalAvatarUrl = cloudinaryData.secure_url;
                } else {
                    throw new Error("Cloudinary upload failed");
                }
            }

            const result = await fetch(`${API_URL}/api/profile/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    name: name, 
                    avatar_url: finalAvatarUrl 
                }),
            });
            
            const data = await result.json();

            if (data.success) {
                setSnackbar({ open: true, message: data.message || "Profile updated successfully!", severity: "success" });
                setEditingName(false);
                setProfileImage(null);
                window.location.reload();
            } else {
                setSnackbar({ open: true, message: data.message || "Failed to update profile.", severity: "error" });
            }
        } catch (error) {
            setSnackbar({ open: true, message: "Something went wrong. Please try again.", severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    return (
        <div className="profile-page">
            <SubHeader title={"Profile"} />
            <Container maxWidth="sm" className="profile-content">
                <form onSubmit={handleSave} className="profile-form">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-wrapper">
                            <Avatar src={avatarPreview} className="profile-avatar">
                                {!avatarPreview && (name || user?.username)?.[0]?.toUpperCase()}
                            </Avatar>
                            <IconButton onClick={handleAvatarClick} className="edit-avatar-btn" size="small">
                                <CameraAltRoundedIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} hidden />
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="profile-row">
                            <Typography className="profile-label">Name:</Typography>
                            <div className="profile-value-group">
                                {editingName ? (
                                    <TextField
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                        size="small"
                                        variant="standard"
                                        className="profile-textfield"
                                        InputProps={{ disableUnderline: false }}
                                    />
                                ) : (
                                    <Typography className="profile-value">{name || "—"}</Typography>
                                )}
                                <IconButton
                                    onClick={() => setEditingName((v) => !v)}
                                    size="small"
                                    className="edit-field-btn"
                                >
                                    <EditRoundedIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </div>
                        </div>

                        <div className="profile-row">
                            <Typography className="profile-label">Username:</Typography>
                            <Typography className="profile-value user-value">{user?.username || 'ethan'}</Typography>
                        </div>

                        <div className="profile-row">
                            <Typography className="profile-label">Watched:</Typography>
                            <div className="watched-stats">
                                <LocalMoviesRoundedIcon className="movie-icon" />
                                <Typography className="profile-value user-value">{watched.length}</Typography>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" variant="contained" color="error" disabled={saving} className="profile-save-btn">
                        {saving ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Save changes"}
                    </Button>
                </form>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}