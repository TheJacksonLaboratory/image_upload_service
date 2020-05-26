all: dist/html/index.html


dist/html/index.html: staging/index.html.template staging/js/tus_wrapper.js
	mkdir -p dist/html
	./gomplate_linux-amd64-slim -f staging/index.html.template -o dist/html/index.html

staging/index.html.template: html/index.html.template
	mkdir -p staging
	cp -f html/index.html.template staging/index.html.template

staging/js/tus_wrapper.js: js/tus_wrapper.js
	mkdir -p staging/js
	npx browserify js/tus_wrapper.js --s tus_wrapper -o staging/js/tus-wrapper-browserify.js

run:
	./tusd -upload-dir /mnt/data &
	mkdir -p logs
	nginx -p . -c nginx.conf -t
	nginx -p . -c nginx.conf

stop:
	killall tusd
	killall nginx

clean:
	rm -rf staging
	rm -rf data
	rm -rf dist 
