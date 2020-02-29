# sudo pacman -S lessc
# yay -S yuicompressor

default: release

release: js/logbird.min.js css/logbird.min.css
	sed -E -i 's/^ +\$$inDevMode = true/    \$$inDevMode = false/' index.php

clean:
	rm -f js/logbird.min.js
	rm -f css/logbird.css
	rm -f css/logbird.min.css

devmode: clean
	sed -E -i 's/^ +\$$inDevMode = false/    \$$inDevMode = true/' index.php

.PHONY: default build clean devmode release

js/logbird.min.js: js/logbird.js
	yui-compressor js/logbird.js > js/logbird.min.js

css/logbird.css: less/logbird.less
	lessc less/logbird.less > css/logbird.css

css/logbird.min.css: css/logbird.css
	yui-compressor css/logbird.css > css/logbird.min.css