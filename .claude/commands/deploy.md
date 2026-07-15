Deploy the Matkewaali frontend and/or backend to an environment.

1. Ask the user:
   - Which environment? (test or prod)
   - What to deploy? (frontend, backend, or both)

2. Run the appropriate steps:

**Backend** (from `infrastructure/backend/`):
```bash
make deploy-test   # or deploy-prod
```
Note: prod requires interactive confirmation — tell the user to run it themselves if deploying backend to prod.

After backend deploy, fetch the stack outputs and update the frontend env file if needed:
```bash
aws cloudformation describe-stacks --stack-name matkewaali-backend-{env} --region us-east-1 --query "Stacks[0].Outputs"
```

**Frontend** (from `frontend/`):
```bash
npm run build
aws s3 sync dist s3://matkewaali.com --delete --region us-east-1 --quiet
aws cloudfront create-invalidation --distribution-id E3B2GEKX7V621I --paths "/*"
```

3. Confirm success and let the user know the site will be live within a minute or two (CloudFront propagation).
