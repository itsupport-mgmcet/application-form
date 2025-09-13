import axios from "axios";

export const uploadImageToCloudinary = async (file) => {
    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );

        return response.data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return null;
    }
};