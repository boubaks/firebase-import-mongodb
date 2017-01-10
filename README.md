# firebase-import-mongodb
You can export specific nodes on mongodb collections

## Installation

    $> npm install -g firebase-import-mongodb

    $> firebase-import-mongodb

## Launch firebase-import-mongodb

	$> firebase-import-mongodb --help
	Usage: node firebase-import-mongodb.js

	  -f, --firUrl=ARG              index where you will import
	  -s, --serviceAccountFile=ARG  path of the firebase auth json file
	  -h, --mongoHost=ARG           mongodb host to connect to
	  -p, --mongoPort=ARG           mongodb port to connect to
	  -d, --mongoDB=ARG             mongodb database to use to
	  -c, --collection=ARG          mongodb collection to insert in
	  -n, --node=ARG                firebase node to export
	  -h, --help                    display this help
	  -v, --version                 show version


## How to use the firebase-import-mongodb
    
    $> firebase-import-mongodb --firUrl https://firebaseUrl.com --serviceAccountFile ~/home/firebaseApp-5dfa11246e.json --node users

We will import all the users on firebase to mongodb
