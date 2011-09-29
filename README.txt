A simple appengine app I use to serve static content.
You can use it as a skeleton to serve your files.

Steps to get it up and running:

1/ python2.5 bootstrap -d
2/ bin/buildout
3/ Modify app/app.yaml with the name of your appengine application
4/ Fill app/files with whatever you want to serve.
5/ bin/verify
6/ bin/minify
7/ bin/appcfg update app

Note that the buildout script doesn't overwrite the app directory nor
the app.yaml if they already exist, so you can for instance clone
another repository under 'app'.

