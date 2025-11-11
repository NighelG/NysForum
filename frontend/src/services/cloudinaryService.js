const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/TU_CLOUD_NAME/upload';
const UPLOAD_PRESET = 'TU_UPLOAD_PRESET';

export const cloudinaryService = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir imagen');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error subiendo a Cloudinary:', error);
            throw error;
        }
    }
};