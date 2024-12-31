import json
import requests
import os
import sys
from pathlib import Path

def download_image(job_id, image_name, output_dir):
    """Download an image from the API and save it to the specified directory."""
    url = f"https://api.cloud.llamaindex.ai/api/v1/parsing/job/{job_id}/result/image/{image_name}"
    
    headers = {
        'Accept': 'image/jpeg',
        'Authorization': 'Bearer llx-RVdoWxB7K9l8IiLeArksD0It5twZiM3TBuhEKOb57OepyOo8',
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        output_path = Path(output_dir) / image_name
        with open(output_path, 'wb') as file:
            file.write(response.content)
        print(f"Successfully downloaded {image_name}")
        return True
    else:
        print(f"Failed to download {image_name}. Status code: {response.status_code}")
        return False

def extract_images_from_json(json_path, output_dir, job_id):
    """Extract and download all full_page_screenshot images from the JSON file."""
    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Read and parse JSON file
    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # Process each page
    for page in data.get('pages', []):
        page_num = page.get('page')
        images = page.get('images', [])
        
        # Find full_page_screenshot images
        for image in images:
            if image.get('type') == 'full_page_screenshot':
                image_name = image.get('name')
                if image_name:
                    print(f"Processing page {page_num}, image: {image_name}")
                    download_image(job_id, image_name, output_dir)

def main():
    if len(sys.argv) != 2:
        print("Usage: python extract_images.py <job_id>")
        sys.exit(1)
    
    # Configuration with absolute paths
    base_dir = Path('d:/Learning Management App/client')
    json_path = base_dir / 'public/Attention is all you need.json'
    output_dir = base_dir / 'public/images'
    job_id = sys.argv[1]
    
    # Extract and download images
    extract_images_from_json(json_path, output_dir, job_id)

if __name__ == "__main__":
    main()
