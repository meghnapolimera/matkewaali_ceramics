Toggle the Matkewaali shop open or closed via SSM.

1. Ask the user:
   - Which environment? (test or prod)
   - Enable or disable the shop?

2. Run the appropriate command:

**To close the shop:**
```bash
aws ssm put-parameter --name /matkewaali/shop/{env}/enabled --value false --type String --overwrite --region us-east-1
```

**To reopen the shop:**
```bash
aws ssm put-parameter --name /matkewaali/shop/{env}/enabled --value true --type String --overwrite --region us-east-1
```

3. Confirm success and remind the user the change takes effect within 60 seconds (Lambda cache TTL).
