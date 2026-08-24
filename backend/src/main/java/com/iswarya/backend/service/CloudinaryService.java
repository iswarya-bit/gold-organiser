package com.iswarya.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) {

        try {

            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "gold-organizer/jewels"));

            return result.get("secure_url").toString();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload image",
                    e);
        }
    }

    private String extractPublicId(String imageUrl) {

        String uploadMarker = "/upload/";

        int uploadIndex = imageUrl.indexOf(uploadMarker);

        if (uploadIndex == -1) {
            throw new IllegalArgumentException(
                    "Invalid Cloudinary URL");
        }

        String publicId = imageUrl.substring(
                uploadIndex + uploadMarker.length());

        // Remove version: v1234567890/
        if (publicId.startsWith("v")) {

            int slashIndex = publicId.indexOf('/');

            if (slashIndex != -1) {
                publicId = publicId.substring(
                        slashIndex + 1);
            }
        }

        // Remove file extension
        int dotIndex = publicId.lastIndexOf('.');

        if (dotIndex != -1) {
            publicId = publicId.substring(
                    0,
                    dotIndex);
        }

        return publicId;
    }

    public void deleteImage(String imageUrl) {

        try {

            String publicId = extractPublicId(imageUrl);

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap());

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to delete image from Cloudinary",
                    e);
        }
    }
}