import { apiRequest } from './apiConfig';

export const mediaService = {
    /**
     * @param {string} fileId
     * @returns {string}
     */
    getMediaUrl: (fileId) => {
        if (!fileId) return null;
        return `/api/posts/media/${fileId}/`;
    },
    /**
     * @param {File} file
     * @returns {string}
     */
    getMediaType: (file) => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
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
            case 'audio':
                return fileType.startsWith('audio/');
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