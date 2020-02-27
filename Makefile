all: js css
client/script/app-comp.js: client/script/app.js
	@cd client/script && php make.php
	@echo "JS done."
client/style/camel-comp.css: client/style/camel.css
	@cd client/style && php make.php
	@echo "CSS done."
js: client/script/app-comp.js
css: client/style/camel-comp.css
help:
	@echo Options: js, css
