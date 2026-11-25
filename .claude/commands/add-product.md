Add a new product to the Matkewaali shop. Always deploy to both test and prod unless the user says otherwise.

## 1. Gather product details

Ask for anything not already provided:

- **Name** (e.g. "Water Carafe Small")
- **Slug** — URL-friendly, suggest from name (e.g. `water_carafe_small`)
- **Price** in dollars
- **Description** — 1–2 sentences, plain text
- **Weight** in grams — required for shipping calculation (convert to lbs: grams / 453.592, round to 2 decimal places)
- **Height** — optional, e.g. "5 inches"
- **Width** — optional, e.g. "2.5 inches"
- **Volume** — optional, for vessels, e.g. "250 ml"
- **Quantity** — number of units available, usually 1
- **Image files** — local paths to product images (convention: `upload/{slug}/1.jpeg`, `upload/{slug}/2.png`, etc.)
- **Alt text** — short image description for accessibility/SEO, e.g. "Handmade stoneware water carafe with bandhani inspired diamond pattern"

## 2. Upload images to S3

Upload to both test and prod buckets. Name the files `{slug}.ext` for the first image, `{slug}-2.ext`, `{slug}-3.ext`, etc. for additional images. Preserve the original file extension and set the correct content-type (`image/jpeg` or `image/png`).

```bash
# First image
aws s3 cp {image_path_1} s3://matkewaali-product-images-{env}/YYYY-MM-DD/{slug}.{ext} --content-type image/{ext} --region us-east-1
# Second image (if present)
aws s3 cp {image_path_2} s3://matkewaali-product-images-{env}/YYYY-MM-DD/{slug}-2.{ext} --content-type image/{ext} --region us-east-1
```

Use today's date for the S3 prefix. Image URLs will be:
`https://matkewaali-product-images-{env}.s3.amazonaws.com/YYYY-MM-DD/{slug}.{ext}`

## 3. Write the product to DynamoDB

Write to both `matkewaali-products-test` and `matkewaali-products-prod`.

- `imageUrl` — URL of the first (primary) image
- `images` — DynamoDB List of all image URLs (even if only one). Used by the frontend gallery.
- `weightLbs` — always include; used server-side to calculate shipping cost
- Omit `height`, `width`, `volume` if not provided

```bash
aws dynamodb put-item \
  --table-name matkewaali-products-{env} \
  --region us-east-1 \
  --item '{
    "slug":        {"S": "{slug}"},
    "name":        {"S": "{name}"},
    "price":       {"N": "{price}"},
    "description": {"S": "{description}"},
    "altText":     {"S": "{altText}"},
    "height":      {"S": "{height}"},
    "width":       {"S": "{width}"},
    "volume":      {"S": "{volume}"},
    "weightLbs":   {"N": "{weightLbs}"},
    "quantity":    {"N": "{quantity}"},
    "imageUrl":    {"S": "{primaryImageUrl}"},
    "images":      {"L": [{"S": "{url1}"}, {"S": "{url2}"}]},
    "isActive":    {"BOOL": true}
  }'
```

## 4. Update frontend/public/llms.txt

Add an entry under the appropriate section in `frontend/public/llms.txt`. Match the style of existing entries:

```
- [Name](https://matkewaali.com/products/{slug}) — ${price} — {one-line description}
```

## 5. Update frontend/public/sitemap.xml

Add a `<url>` entry alongside the other product URLs:

```xml
<url>
  <loc>https://matkewaali.com/products/{slug}</loc>
  <priority>0.8</priority>
</url>
```

## 6. Confirm the product is live

Verify the DynamoDB item was written correctly:

```bash
aws dynamodb get-item --table-name matkewaali-products-prod \
  --key '{"slug": {"S": "{slug}"}}' --region us-east-1
```

Then share the live URL: `https://matkewaali.com/products/{slug}`
