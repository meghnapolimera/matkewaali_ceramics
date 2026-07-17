.PHONY: merge deploy-test deploy-prod setup-account

merge:
	python3 scripts/merge.py

deploy-test: merge
	sam build
	sam deploy --config-env test

deploy-prod: merge
	sam build
	sam deploy --config-env prod

# Run once per AWS account to allow API Gateway to write CloudWatch access logs.
setup-account:
	aws cloudformation deploy \
		--template-file account-setup.yaml \
		--stack-name matkewaali-account-setup \
		--capabilities CAPABILITY_NAMED_IAM
