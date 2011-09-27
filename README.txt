A simple appengine app I use to serve static content.
You can use it as a skeleton to serve your files.

Steps to get it up and running:

1/ Modify app/app.yaml with the name of your appengine application
2/ Fill app/files with whatever you want to serve.
3/ (optional) Install scripts/re-minify as a git pre-commit hook.
4/ python2.5 bootstrap -d
5/ bin/buildout
6/ script/re-minify
7/ bin/appcfg update app

