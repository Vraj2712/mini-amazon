import cloudinary
import cloudinary.uploader
import os

# Load env variables
cloudinary.config(
  cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key=os.getenv("CLOUDINARY_API_KEY"),
  api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

async def upload_product_image(file):
    # You CANNOT await cloudinary.uploader.upload() — it's sync function
    result = cloudinary.uploader.upload(file.file)
    return result["secure_url"]
