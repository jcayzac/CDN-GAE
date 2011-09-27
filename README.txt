A simple appengine app I use to serve static content.
You can use it as a skeleton to serve your files.

Steps to get it up and running:

1/ Modify app/app.yaml with the name of your appengine application
2/ Fill app/files with whatever you want to serve.
3/ python2.5 bootstrap -d
4/ bin/buildout
5/ bin/minify
6/ bin/appcfg update app

