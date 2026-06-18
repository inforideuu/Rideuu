import os
from PIL import Image

def process_and_generate_icons():
    src_path = r"C:\Users\annam\.gemini\antigravity-ide\brain\tempmediaStorage\media__1780901456351.png"
    if not os.path.exists(src_path):
        print(f"Source image not found at {src_path}")
        return

    # Load original image
    img = Image.open(src_path)
    
    # We want to create a 512x512 square with white background
    size = 512
    square_img = Image.new("RGBA", (size, size), "WHITE")
    
    # Resize the original logo so that it fits nicely inside the 512x512 square with padding
    # Keep aspect ratio
    max_w = int(size * 0.85) # 85% of square width
    max_h = int(size * 0.85) # 85% of square height
    
    w, h = img.size
    ratio = min(max_w / w, max_h / h)
    new_w = int(w * ratio)
    new_h = int(h * ratio)
    
    resized_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Paste resized image into center
    offset_x = (size - new_w) // 2
    offset_y = (size - new_h) // 2
    
    # Use alpha channel if present
    if resized_img.mode in ('RGBA', 'LA'):
        square_img.paste(resized_img, (offset_x, offset_y), resized_img)
    else:
        square_img.paste(resized_img, (offset_x, offset_y))

    # Convert to RGB (since white background, we can save as RGB/RGBA)
    icon_base = square_img.convert("RGBA")
    
    # Mipmap configurations
    res_dir = r"c:\Users\annam\OneDrive\Desktop\namma ride\frontend\frontend\chennai rapido\android\app\src\main\res"
    mipmaps = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    
    for folder, dim in mipmaps.items():
        folder_path = os.path.join(res_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)
            
        # Resize for this mipmap
        resized_icon = icon_base.resize((dim, dim), Image.Resampling.LANCZOS)
        
        # Save as ic_launcher.png
        resized_icon.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        
        # Save as ic_launcher_round.png
        resized_icon.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        
        # Save as ic_launcher_foreground.png
        resized_icon.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
        
    print("Icons successfully generated and saved to mipmap directories!")

if __name__ == "__main__":
    process_and_generate_icons()
