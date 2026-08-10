from pathlib import Path
import sys

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ICON_SIZES = (20, 29, 40, 48, 58, 60, 72, 76, 80, 87, 96, 120, 144, 152, 167, 180, 192, 512, 1024)
STATIC_TARGETS = (
    ROOT / "static" / "logo.png",
    ROOT / "static" / "logo1.png",
    ROOT / "static" / "app-icon.png",
    ROOT / "unpackage" / "cache" / "wgt" / "__UNI__200F612" / "static" / "logo.png",
    ROOT / "unpackage" / "cache" / "wgt" / "__UNI__200F612" / "static" / "logo1.png",
    ROOT / "unpackage" / "cache" / "wgt" / "__UNI__200F612" / "static" / "app-icon.png",
    ROOT / "unpackage" / "dist" / "build" / "app-plus" / "static" / "logo.png",
    ROOT / "unpackage" / "dist" / "build" / "app-plus" / "static" / "logo1.png",
    ROOT / "unpackage" / "dist" / "build" / "app-plus" / "static" / "app-icon.png",
    ROOT / "unpackage" / "dist" / "build" / "web" / "static" / "logo.png",
    ROOT / "unpackage" / "dist" / "build" / "web" / "static" / "logo1.png",
    ROOT / "unpackage" / "dist" / "build" / "web" / "static" / "app-icon.png",
    ROOT / "unpackage" / "dist" / "dev" / "app-plus" / "static" / "logo.png",
    ROOT / "unpackage" / "dist" / "dev" / "app-plus" / "static" / "logo1.png",
    ROOT / "unpackage" / "dist" / "dev" / "app-plus" / "static" / "app-icon.png",
    ROOT / "unpackage" / "resources" / "__UNI__200F612" / "www" / "static" / "logo.png",
    ROOT / "unpackage" / "resources" / "__UNI__200F612" / "www" / "static" / "logo1.png",
    ROOT / "unpackage" / "resources" / "__UNI__200F612" / "www" / "static" / "app-icon.png",
)
ANDROID_CACHE_SIZES = {
    "icon-android-ldpi.png": 48,
    "icon-android-mdpi.png": 48,
    "icon-android-hdpi.png": 72,
    "icon-android-xhdpi.png": 96,
    "icon-android-xxhdpi.png": 144,
    "icon-android-xxxhdpi.png": 192,
}


def save_png(image, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(str(path), format="PNG", optimize=True)


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python tools/update_brand_assets.py <source-logo.png>")

    source_path = Path(sys.argv[1]).resolve()
    if not source_path.is_file():
        raise FileNotFoundError("Logo source not found: {}".format(source_path))

    with Image.open(str(source_path)) as opened:
        source = opened.convert("RGB")

    if source.size != (1024, 1024):
        raise ValueError("Logo source must be 1024x1024, got {}".format(source.size))

    save_png(source, ROOT / "static" / "brand-logo-source.png")
    for target in STATIC_TARGETS:
        if target.parent.is_dir():
            save_png(source, target)

    icon_dir = ROOT / "unpackage" / "res" / "icons"
    for size in ICON_SIZES:
        icon = source.resize((size, size), Image.Resampling.LANCZOS)
        save_png(icon, icon_dir / "{}x{}.png".format(size, size))

    android_cache = ROOT / "unpackage" / "cache" / "wgt" / "__UNI__200F612" / ".manifest"
    if android_cache.is_dir():
        for name, size in ANDROID_CACHE_SIZES.items():
            icon = source.resize((size, size), Image.Resampling.LANCZOS)
            save_png(icon, android_cache / name)

    print("Updated {} static assets and {} icon sizes.".format(len(STATIC_TARGETS), len(ICON_SIZES)))


if __name__ == "__main__":
    main()
