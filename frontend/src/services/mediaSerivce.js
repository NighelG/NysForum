import { apiRequest } from './apiConfig';

export const mediaService = {
    /**
     * @param {string} fileId
     * @param {string} mediaSource
     * @returns {string}
     */
    getMediaUrl: (fileId, mediaSource = 'post') => {
        if (!fileId) return null;
        if (mediaSource === 'comment') {
            return `/api/comments/media/${fileId}/`;
        }
        return `/api/posts/media/${fileId}/`;
    },
    /**
     * @param {Object} mediaObject
     * @returns {string}
     */
    getUrlFromMediaObject: (mediaObject) => {
        if (!mediaObject) return null;
        if (mediaObject.file_url) {
            return mediaObject.file_url;
        }
        if (mediaObject.file_id) {
            if (mediaObject.comment_id || mediaObject.comment) {
                return `/api/comments/media/${mediaObject.file_id}/`;
            } else {
                return `/api/posts/media/${mediaObject.file_id}/`;
            }
        }
        
        return null;
    },
    /**
     * @param {File} file
     * @returns {string}
     */
    getMediaType: (file) => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        return 'image';
    },
    
    /**
     * @param {File} file
     * @param {string} mediaType
     * @returns {boolean}
     */
    validateFileType: (file, mediaType) => {
        const fileType = file.type;
        switch (mediaType) {
            case 'image':
                return fileType.startsWith('image/');
            case 'video':
                return fileType.startsWith('video/');
            default:
                return false;
        }
    },
    /**
     * @param {File} file
     * @returns {boolean}
     */
    validateFileSize: (file) => {
        const maxSize = 10 * 1024 * 1024;
        return file.size <= maxSize;
    },
    /**
     * @param {File} file
     * @returns {string}
     */
    getSizeErrorMessage: (file) => {
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return `El archivo no debe exceder los 10MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
        }
        return null;
    }
};

export default mediaService;