.PHONY: merge deploy-test deploy-prod

merge:
	python3 scripts/merge.py

deploy-test: merge
	sam build
	sam deploy --config-env test

deploy-prod: merge
	sam build
	sam deploy --config-env prod
