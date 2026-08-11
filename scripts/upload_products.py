#!/usr/bin/env python3
"""
Upload new products to S3 and DynamoDB.

Usage:
  python3 scripts/upload_products.py [--env prod|test]

Workflow:
  1. Add product details to catalog.json
  2. Create upload/{slug}/ with images named 1.jpeg, 2.jpeg, etc.
     The first image (1.jpeg) will be the primary thumbnail.
  3. Run this script.
"""

import argparse
import json
import mimetypes
import os
import boto3

BUCKET = 'matkewaali-product-images-{env}'
TABLE = 'matkewaali-products-{env}'
BASE_URL = 'https://matkewaali-product-images-{env}.s3.amazonaws.com'
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'upload')
CATALOG_PATH = os.path.join(os.path.dirname(__file__), '..', 'catalog.json')
REGION = 'us-east-1'

IMAGE_EXTENSIONS = {'.jpeg', '.jpg', '.png', '.webp'}


def get_images_for_slug(slug: str) -> list[str]:
    folder = os.path.join(UPLOAD_DIR, slug)
    if not os.path.isdir(folder):
        return []
    files = sorted(
        f for f in os.listdir(folder)
        if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS
    )
    return [os.path.join(folder, f) for f in files]


def upload_images(s3, slug: str, local_paths: list[str], bucket: str, base_url: str) -> list[str]:
    urls = []
    for local_path in local_paths:
        filename = os.path.basename(local_path)
        s3_key = f'products/{slug}/{filename}'
        content_type = mimetypes.guess_type(local_path)[0] or 'image/jpeg'
        print(f'  Uploading {filename} → s3://{bucket}/{s3_key}')
        s3.upload_file(local_path, bucket, s3_key, ExtraArgs={'ContentType': content_type})
        urls.append(f'{base_url}/products/{slug}/{filename}')
    return urls


def upsert_product(dynamo, table: str, product: dict, image_urls: list[str]):
    item = {
        'slug': product['slug'],
        'name': product['name'],
        'price': int(product['price']),
        'description': product.get('description', ''),
        'height': product.get('height', ''),
        'depth': product.get('depth', ''),
        'width': product.get('width', ''),
        'volume': product.get('volume', ''),
        'quantity': product.get('quantity', 1),
        'weightLbs': product.get('weightLbs', 0),
        'isActive': product.get('isActive', True),
        'soldOut': False,
    }

    if image_urls:
        item['imageUrl'] = image_urls[0]
        item['images'] = image_urls
    elif 'imageUrl' in product:
        item['imageUrl'] = product['imageUrl']

    if 'altText' in product:
        item['altText'] = product['altText']

    dynamo.put_item(TableName=table, Item={k: serialize(v) for k, v in item.items()})
    print(f'  DynamoDB upserted: {product["slug"]}')


def serialize(value):
    if isinstance(value, str):
        return {'S': value}
    if isinstance(value, bool):
        return {'BOOL': value}
    if isinstance(value, (int, float)):
        return {'N': str(value)}
    if isinstance(value, list):
        return {'L': [serialize(v) for v in value]}
    raise ValueError(f'Unsupported type: {type(value)}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--env', default='prod', choices=['prod', 'test'])
    args = parser.parse_args()

    env = args.env
    bucket = BUCKET.format(env=env)
    table = TABLE.format(env=env)
    base_url = BASE_URL.format(env=env)

    with open(CATALOG_PATH) as f:
        catalog = json.load(f)

    s3 = boto3.client('s3', region_name=REGION)
    dynamo = boto3.client('dynamodb', region_name=REGION)

    slugs_with_uploads = set(
        d for d in os.listdir(UPLOAD_DIR)
        if os.path.isdir(os.path.join(UPLOAD_DIR, d))
    ) if os.path.isdir(UPLOAD_DIR) else set()

    processed = 0
    for product in catalog:
        slug = product['slug']
        local_images = get_images_for_slug(slug)

        if not local_images and slug not in slugs_with_uploads:
            continue

        print(f'\n{slug}')

        image_urls = []
        if local_images:
            image_urls = upload_images(s3, slug, local_images, bucket, base_url)

        upsert_product(dynamo, table, product, image_urls)
        processed += 1

    print(f'\nDone. {processed} product(s) processed.')


if __name__ == '__main__':
    main()
