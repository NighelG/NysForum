import { useState, useEffect, useRef } from "react";

export const useavatar = (username) => {
    const [avatarUrl, setAvatarUrl] = useState ('/defaultPFP.jpg');
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        if (!username || username === 'Usuario'){
            setAvatarUrl('/defaultPFP.jpg');
            return;
        }
        const controller = new AbortController();
        const timestamp = Date.now();
        const img = new Image();
        img.src = `http://localhost:8000/users/profiles/${username}/avatar/?t=${timestamp}`;
        img.onload = () => {
            if (mountedRef.current){
                setAvatarUrl(img.src);
            }
        };
        img.onerror = () => {
            if (mountedRef.current){
                setAvatarUrl('/defaultPFP.jpg');
            }
        };

        return () => {
            mountedRef.current = false;
            controller.abort();
        };
    }, [username]);
    return avatarUrl;
};