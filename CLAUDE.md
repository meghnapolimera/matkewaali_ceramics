# Matkewaali — Developer Guide

## Monorepo Structure

```
matkewaali/
├── frontend/    # React 18 + TypeScript shop (Vite)
├── backend/           # Lambda function (TypeScript, single handler with internal router)
└── infrastructure/
    └── backend/       # AWS SAM templates — all cloud resources
```

## Environments

Two environments: `test` and `prod`. Deploy from `infrastructure/backend/`:

```bash
make deploy-test   # deploys to matkewaali-backend-test stack
make deploy-prod   # deploys to matkewaali-backend-prod stack (requires confirm)
```

## Manual Prerequisites (NOT managed by CloudFormation)

These must be set up once before deploying. CloudFormation only grants Lambda permission to read them — it does not create them.

### Square Access Token (SSM SecureString)

```bash
# Test (sandbox)
aws ssm put-parameter \
  --name /matkewaali/square/test/access-token \
  --value "<sandbox-access-token>" \
  --type SecureString --region us-east-1

# Prod (fill in real value from Square dashboard)
aws ssm put-parameter \
  --name /matkewaali/square/prod/access-token \
  --value "<prod-access-token>" \
  --type SecureString --region us-east-1
```

To update an existing parameter, add `--overwrite`.

Square Application IDs and Location IDs (not secret) are in:
- `infrastructure/backend/parameters/test.json`
- `infrastructure/backend/parameters/prod.json`
- `infrastructure/backend/samconfig.toml` (parameter_overrides)

### SES Email Identity

The sender `meghnapolimera@matkewaali.com` must be verified in SES before confirmation emails work:
1. Go to AWS SES console → Verified Identities → Create Identity
2. Click the confirmation link sent to that address
3. For sending to non-verified recipients (all customers), request SES production access via AWS support

### Cognito Identity Pool ID

The Identity Pool ID is a CloudFormation output. After deploying, add it to `frontend/.env.local`:
```
VITE_IDENTITY_POOL_ID=us-east-1:<id-from-deploy-output>
```

## Frontend Environment Files

`frontend/.env.local` (not committed — for local dev against test stack):
```
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/api
VITE_IDENTITY_POOL_ID=us-east-1:<identity-pool-id>
VITE_AWS_REGION=us-east-1
VITE_SQUARE_APP_ID=sandbox-sq0idb-1krYjx4chbWW5D4lLu2lRA
VITE_SQUARE_LOCATION_ID=L5AFZQCQS12DH
```

`frontend/.env.production` (committed — used for prod builds):
```
VITE_API_URL=https://<prod-api-id>.execute-api.us-east-1.amazonaws.com/api
VITE_IDENTITY_POOL_ID=us-east-1:<prod-identity-pool-id>
VITE_AWS_REGION=us-east-1
VITE_SQUARE_APP_ID=<prod-square-app-id>
VITE_SQUARE_LOCATION_ID=<prod-square-location-id>
```

## Key Architecture Decisions

### Auth
All API routes use AWS IAM auth via Cognito unauthenticated identity pool. The frontend signs requests with SigV4 using `aws4fetch`. **`InvokeRole: NONE` is required** in `api.yaml`'s Auth block — without it, API Gateway tries to use the Cognito role to invoke Lambda and returns 500.

### Lock Flow
1. `POST /locks` — atomically decrements product `quantity` and creates a lock record (15-min TTL). Also stores `name` and `price` on the lock for order creation.
2. `DELETE /locks/{lockId}` — atomically deletes lock AND restores `quantity` (user cancelled).
3. `POST /orders` — on successful payment, deletes lock records WITHOUT restoring `quantity` (items are sold).
4. DynamoDB Streams on locks table: TTL-triggered deletes fire the stream handler which restores `quantity`. The stream filter (`userIdentity.principalId = dynamodb.amazonaws.com`) ensures only TTL deletes trigger this — order-triggered deletes do not.

### Tax
Fixed 10.25% WA rate applied server-side in `create-order.ts` when `shippingAddress.state === 'WA'`. No tax for other states. Calculated server-side — never trust client-submitted totals.

### Square Integration
- Frontend: Square Web Payments SDK loaded from CDN (`https://web.squarecdn.com/v1/square.js` in `index.html`). Card tokenization happens in Square's iframe — raw card data never touches our code.
- Backend: `backend/src/clients/square.ts` reads the access token from SSM at cold start (cached in module scope). Uses the `square` npm SDK.

### DynamoDB Tables
- `matkewaali-products-{env}` — PK: `slug`. Quantity is the source of truth for availability.
- `matkewaali-locks-{env}` — PK: `lockId`. TTL on `expiresAt`. Streams enabled (OLD_IMAGE).
- `matkewaali-orders-{env}` — PK: `orderId`. Permanent order records with customer info and item snapshot.

### One-time Account Setup
`make setup-account` deploys `account-setup.yaml` — sets the CloudWatch logs role for API Gateway. This must be run once per AWS account (not per environment).
