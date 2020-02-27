all: css js
js:
	@cd client/script && php make.php
	@echo "JS done."
css:
	@cd client/style && php make.php
	@echo "CSS done."
