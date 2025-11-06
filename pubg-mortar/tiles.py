from PIL import Image
import os
import math

def generate_tiles(input_image, output_folder, max_zoom=5, tile_size=256):
    """
    Generate Leaflet-compatible tiles from an image.
    
    Args:
        input_image: Path to the source image
        output_folder: Folder where tiles will be saved
        max_zoom: Maximum zoom level (default 5)
        tile_size: Size of each tile in pixels (default 256)
    """
    # Create output folder
    os.makedirs(output_folder, exist_ok=True)
    
    # Open the image
    print(f"Loading image: {input_image}")
    image = Image.open(input_image)
    width, height = image.size
    print(f"Image size: {width}x{height}")
    
    # Calculate the size needed for tiles (must be power of 2)
    max_dimension = max(width, height)
    tile_dimension = 2 ** max_zoom * tile_size
    
    # Resize image if needed to fit tile grid
    if width != tile_dimension or height != tile_dimension:
        print(f"Resizing image to {tile_dimension}x{tile_dimension}...")
        image = image.resize((tile_dimension, tile_dimension), Image.LANCZOS)
    
    # Generate tiles for each zoom level
    for zoom in range(max_zoom + 1):
        num_tiles = 2 ** zoom
        current_tile_size = tile_dimension // num_tiles
        
        print(f"Generating zoom level {zoom} ({num_tiles}x{num_tiles} tiles)...")
        
        # Create zoom level folder
        zoom_folder = os.path.join(output_folder, str(zoom))
        os.makedirs(zoom_folder, exist_ok=True)
        
        # Generate tiles for this zoom level
        for x in range(num_tiles):
            # Create x folder
            x_folder = os.path.join(zoom_folder, str(x))
            os.makedirs(x_folder, exist_ok=True)
            
            for y in range(num_tiles):
                # Calculate crop box
                left = x * current_tile_size
                top = y * current_tile_size
                right = left + current_tile_size
                bottom = top + current_tile_size
                
                # Crop and resize tile
                tile = image.crop((left, top, right, bottom))
                tile = tile.resize((tile_size, tile_size), Image.LANCZOS)
                
                # Save tile
                tile_path = os.path.join(x_folder, f"{y}.png")
                tile.save(tile_path, optimize=True)
        
        print(f"   Zoom {zoom} complete ({num_tiles * num_tiles} tiles)")
    
    print(f"\nAll done! Tiles saved in: {output_folder}")

# Example usage - uncomment and modify as needed
if __name__ == "__main__":
    # For training map (2x2 km)
    generate_tiles(
        input_image="erangel.png",
        output_folder="erangel-tiles",
        max_zoom=5,
        tile_size=256
    )
    
    # For miramar map (8x8 km) - uncomment if needed
    # generate_tiles(
    #     input_image="miramar.png",
    #     output_folder="miramar-tiles",
    #     max_zoom=5,
    #     tile_size=256
    # )
