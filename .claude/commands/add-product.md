Add a new product to the Matkewaali shop in DynamoDB and upload its image to S3.

1. Ask the user for:
   - Environment: test or prod
   - Product details:
     - Name (e.g. "Pour-Over")
     - Slug (URL-friendly, e.g. "pour-over") — suggest one based on the name
     - Price (number, in dollars)
     - Description
     - Height (e.g. "5.5 in") — optional
     - Width (e.g. "4 in") — optional
     - Volume (e.g. "17 oz") — optional, for vessels
     - Quantity (number of units available, usually 1)
     - Image file path (local path to the product image)

2. Upload the image to S3:
```bash
aws s3 cp {image_path} s3://matkewaali-product-images-{env}/{today}/{slug}.jpeg --content-type image/jpeg
```
Where `{today}` is today's date in YYYY-MM-DD format.

The imageUrl will be: `https://matkewaali-product-images-{env}.s3.amazonaws.com/{today}/{slug}.jpeg`

3. Write the product to DynamoDB:
```bash
aws dynamodb put-item \
  --table-name matkewaali-products-{env} \
  --region us-east-1 \
  --item '{
    "slug": {"S": "{slug}"},
    "name": {"S": "{name}"},
    "price": {"N": "{price}"},
    "description": {"S": "{description}"},
    "height": {"S": "{height}"},
    "width": {"S": "{width}"},
    "volume": {"S": "{volume}"},
    "quantity": {"N": "{quantity}"},
    "isActive": {"BOOL": true}
  }'
```
Omit height, width, volume if not provided.

4. Confirm the product is live and share the product URL:
   - Test: check against test API
   - Prod: https://matkewaali.com/products/{slug}
