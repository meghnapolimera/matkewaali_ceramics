.PHONY: merge deploy-test deploy-prod setup-account

merge:
	python3 scripts/merge.py

deploy-test: merge
	sam build
	sam deploy --config-env test
	aws s3 cp ../../frontend/src/assets/matkewaali_ceramics_white_logo.png s3://matkewaali-assets-test/matkewaali_ceramics_white_logo.png --content-type image/png
	aws s3 cp ../../frontend/src/assets/matkewaali_ceramics_black_logo.png s3://matkewaali-assets-test/matkewaali_ceramics_black_logo.png --content-type image/png

deploy-prod: merge
	sam build
	sam deploy --config-env prod
	aws s3 cp ../../frontend/src/assets/matkewaali_ceramics_white_logo.png s3://matkewaali-assets-prod/matkewaali_ceramics_white_logo.png --content-type image/png
	aws s3 cp ../../frontend/src/assets/matkewaali_ceramics_black_logo.png s3://matkewaali-assets-prod/matkewaali_ceramics_black_logo.png --content-type image/png

# Run once per AWS account to allow API Gateway to write CloudWatch access logs.
setup-account:
	aws cloudformation deploy \
		--template-file account-setup.yaml \
		--stack-name matkewaali-account-setup \
		--capabilities CAPABILITY_NAMED_IAM
