import cloudinary
import cloudinary.uploader
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Cloudinary Configuration
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_media(file_contents, file_name: str, folder: str = "round_table") -> str:
    """
    Uploads a file-like object or bytes to Cloudinary.
    Auto-detects resource type (image, raw/pdf, video).
    """
    try:
        upload_result = cloudinary.uploader.upload(
            file_contents,
            public_id=file_name.rsplit(".", 1)[0],
            folder=folder,
            resource_type="auto",
            overwrite=True
        )
        return upload_result.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary upload error: {str(e)}")
        raise e

def delete_media(url: str):
    """
    Strips the public ID from a Cloudinary URL and purges the asset.
    """
    if not url or "cloudinary" not in url:
        return
    try:
        # Format: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<folder>/<public_id>.<ext>
        parts = url.split("/")
        upload_idx = -1
        for i, part in enumerate(parts):
            if part == "upload":
                upload_idx = i
                break
        
        if upload_idx != -1 and len(parts) > upload_idx + 2:
            # Skip 'upload/' and 'vXXXXXXXX/'
            public_path = "/".join(parts[upload_idx + 2:])
            # Strip file extension
            public_id = public_path.rsplit(".", 1)[0]
            # Detect resource type
            res_type = "image"
            if "raw" in parts or "pdf" in url.lower():
                res_type = "raw"
            elif "video" in parts:
                res_type = "video"
                
            cloudinary.uploader.destroy(public_id, resource_type=res_type)
            logger.info(f"Purged media from Cloudinary: {public_id} ({res_type})")
    except Exception as e:
        logger.error(f"Cloudinary deletion error: {str(e)}")
