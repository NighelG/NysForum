// Configuración de Cloudinary - acordarse de configurarlo
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/TU_CLOUD_NAME/upload';
const UPLOAD_PRESET = 'TU_UPLOAD_PRESET';

export const cloudinaryService = {
    uploadImage: async (file) => {
        if (!file) {
            throw new Error('No se proporcionó ningún archivo');
        }
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, GIF y WebP');
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('La imagen es demasiado grande. El tamaño máximo permitido es 5MB');
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                let errorMessage = 'Error al subir imagen';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (jsonError) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }         
                throw new Error(errorMessage);
            }
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error subiendo a Cloudinary:', error);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Error de conexión. Verifica tu conexión a internet.');
            }           
            throw error;
        }
    },
    deleteImage: async (publicId) => {
        console.warn('La eliminación de imágenes requiere configuración en el backend');
        return Promise.resolve();
    }
};