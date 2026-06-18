from PIL import Image

img_path = r"C:\Users\annam\.gemini\antigravity-ide\brain\ade8ab90-8758-45e9-8b28-cd415fd9654a\media__1781602426467.png"
img = Image.open(img_path)
print(f"Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
if 'A' in img.mode or img.info.get('transparency') is not None:
    print("Has transparency channel.")
else:
    print("No transparency channel.")
