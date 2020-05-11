all: dist/html/index.html


dist/html/index.html: staging/index.html.template staging/js/tus_wrapper.js staging/css/jax-bootstrap.min.css staging/js/jax-bootstrap.min.js
	mkdir -p dist/html
	./gomplate_linux-amd64-slim -f staging/index.html.template -o dist/html/index.html

staging/index.html.template: html/index.html.template
	mkdir -p staging
	cp -f html/index.html.template staging/index.html.template

staging/js/tus_wrapper.js: js/tus_wrapper.js
	mkdir -p staging/js
	browserify js/tus_wrapper.js --s tus_wrapper -o staging/js/tus-wrapper-browserify.js

#staging/css/jax-bootstrap.min.css: jax-bootstrap/css/jax-bootstrap.min.css
#	mkdir -p staging/css
#	cp -f jax-bootstrap/css/jax-bootstrap.min.css staging/css/jax-bootstrap.min.css

#staging/js/jax-bootstrap.min.js: jax-bootstrap/js/jax-bootstrap.min.js
#	mkdir -p staging/js
#	cp -f jax-bootstrap/js/jax-bootstrap.min.js staging/js/jax-bootstrap.min.js

run:
	./tusd &
	mkdir -p logs
	nginx -p $(pwd) -c nginx.conf

clean:
	rm -rf staging
	rm -rf data
	rm -rf dist 
