set -e

mkdir --parents ./downloads

if [ ! -d ./downloads/nifi-1.27.0 ]
then
    if [ ! -f ./downloads/nifi.zip ]
    then
        curl https://dlcdn.apache.org/nifi/1.27.0/nifi-1.27.0-bin.zip -o ./downloads/nifi.zip
    else
        echo "Found ./downloads/nifi.zip"
    fi
    unzip ./downloads/nifi.zip -d ./downloads/
fi

DIST_PATH="./public/"
NARS_PATH="${DIST_PATH}nars"

mkdir --parents $NARS_PATH

cp ./downloads/nifi-1.27.0/lib/*.nar $NARS_PATH

ls $NARS_PATH -1 > ${DIST_PATH}nars.txt
