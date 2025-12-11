import React, { useState, useEffect, useCallback } from "react";
import { useavatar } from "../hooks/useavatar";
import { authService } from "../services/authService";
import "../styles/UserProfilePopup.css";

const UserProfilePopup = ({ username, isOpen, onClose }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const avatarUrl = useavatar(username);
    useEffect(() => {
        if (!isOpen) return;
        setUserData(null);
    }, [isOpen, username]);
    useEffect(() => {
        if (isOpen && username) {
            loadUserData();
        }
    }, [isOpen, username]);
    const loadUserData = useCallback(async () => {
        if (!username) return;
        setLoading(true);
        try {
            const profileData = await authService.getUserProfile(username);
            setUserData(profileData);
        } catch (error) {
            console.error("Error cargando datos del usuario:", error);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    }, [username]);
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape" && isOpen) onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleEscKey);
        return () => document.removeEventListener("keydown", handleEscKey);
    }, [isOpen, onClose]);
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("user-profile-modal-overlay")) {
            onClose();
        }
    };
    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    if (!isOpen) return null;

    return (
        <div className="user-profile-modal-overlay" onClick={handleOverlayClick}>
            <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="user-basic-info">
                        <img src={avatarUrl} alt={`Avatar de ${username}`} className="user-modal-avatar" onError={(e) => (e.target.src = "/defaultPFP.jpg")}/>
                        <div className="user-details">
                            <h3 className="username">@{username}</h3>
                            {loading ? (
                                <p className="user-bio">Cargando perfil...</p>
                            ) : userData ? (
                                <>
                                    <p className="user-bio">{userData.bio || "Sin biografía"}</p>
                                    <div className="user-role-status">
                                        <p>Estado: {userData.status} | Rol: {userData.role}</p>
                                    </div>
                                    <div className="user-meta">
                                        <span className="join-date">
                                            Se unió el {formatDate(userData.date_joined)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="user-bio">Error al cargar el perfil.</p>
                            )}
                        </div>
                    </div>
                    <button className="close-modal-btn" onClick={onClose}><img src="/close.png" alt="close" /></button>
                </div>
                {userData && (
                    <div className="user-stats">
                        <div className="stat-item">
                            <span className="stat-number">Publicaciones: {userData.posts_count || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">Comentarios: {userData.comments_count || 0}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(UserProfilePopup);
