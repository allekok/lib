all: css map plan ver js
code/client/script/app-comp.js: code/client/script/app.js
	cd code/client/script && php make.php
	@echo -e "\e[93mJS done.\e[0m"
code/client/style/camel-comp.css: code/client/style/camel.css
	cd code/client/style && php make.php
	@echo -e "\e[93mCSS done.\e[0m"
data/map/map.json: data/map/قفسه‌ها
	cd data/map && php make.php
	@echo -e "\e[93mMap done.\e[0m"
data/plan/plan.json: data/plan/برنامه
	cd data/plan && php make.php
	@echo -e "\e[93mPlan done.\e[0m"
VERSION: data/books/VERSION data/plan/VERSION data/map/VERSION
	rm -f $@
	cat data/books/VERSION >> $@
	@echo >> $@
	cat data/plan/VERSION >> $@
	@echo >> $@
	cat data/map/VERSION >> $@
	@echo -e "\e[93mVersion done.\e[0m"
js: code/client/script/app-comp.js
css: code/client/style/camel-comp.css
map: data/map/map.json
plan: data/plan/plan.json
ver: VERSION
help:
	@echo Options: js, css, map, plan, ver
