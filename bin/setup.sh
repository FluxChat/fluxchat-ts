#!/usr/bin/env bash

SCRIPT_BASEDIR=$(dirname "$0")

which npm &> /dev/null || { echo 'ERROR: npm not found in PATH'; exit 1; }
which openssl &> /dev/null || { echo 'ERROR: openssl not found in PATH'; exit 1; }
which envsubst &> /dev/null || { echo 'ERROR: envsubst not found in PATH'; exit 1; }

export FLUXCHAT_CONFIG=${FLUXCHAT_CONFIG:-var/config1.json}
export FLUXCHAT_ADDRESS=${FLUXCHAT_ADDRESS:-0.0.0.0}
export FLUXCHAT_PORT=${FLUXCHAT_PORT:-25001}
export FLUXCHAT_CONTACT=${FLUXCHAT_CONTACT:-public} # public, private or ip:port
export FLUXCHAT_DATA_DIR=${FLUXCHAT_DATA_DIR:-var/data1}
export FLUXCHAT_LOG_FILE=${FLUXCHAT_LOG_FILE:-fluxchat.log}
export FLUXCHAT_KEY_PASSWORD=${FLUXCHAT_KEY_PASSWORD:-password}

cd "${SCRIPT_BASEDIR}/.."
pwd

echo "-> FLUXCHAT_CONFIG: ${FLUXCHAT_CONFIG}"
echo "-> FLUXCHAT_ADDRESS: ${FLUXCHAT_ADDRESS}"
echo "-> FLUXCHAT_PORT: ${FLUXCHAT_PORT}"
echo "-> FLUXCHAT_CONTACT: ${FLUXCHAT_CONTACT}"
echo "-> FLUXCHAT_DATA_DIR: ${FLUXCHAT_DATA_DIR}"
echo "-> FLUXCHAT_LOG_FILE: ${FLUXCHAT_LOG_FILE}"

mkdir -p ${FLUXCHAT_DATA_DIR} tmp
chmod go-rwx ${FLUXCHAT_DATA_DIR}

echo '-> installing dependencies'
npm ci

if [[ ! -d build ]]; then
	echo '-> building'
	npm run build
fi

rsa_priv_key_file=${FLUXCHAT_DATA_DIR}/private_key.pem
rsa_pub_key_file=${FLUXCHAT_DATA_DIR}/public_key.pem
rsa_crt_key_file=${FLUXCHAT_DATA_DIR}/certificate.pem
if ! test -f ${rsa_priv_key_file} ; then
	echo '-> generating rsa key'
	touch ${rsa_priv_key_file}
	chmod u=rw,go-rwx ${rsa_priv_key_file}
	openssl genrsa -out ${rsa_priv_key_file} -aes256 -passout env:FLUXCHAT_KEY_PASSWORD 4096

	echo '-> generating rsa public key'
	openssl rsa -in ${rsa_priv_key_file} -outform PEM -pubout -out ${rsa_pub_key_file} -passin env:FLUXCHAT_KEY_PASSWORD

	echo '-> generating rsa certificate'
	openssl req -new -x509 -sha256 -key ${rsa_priv_key_file} -out ${rsa_crt_key_file} -days 3650 -subj '/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname' -passin env:FLUXCHAT_KEY_PASSWORD
fi

if ! test -f ${FLUXCHAT_CONFIG}; then
	echo '-> generating id'
	export FLUXCHAT_ID=$(echo TODO)

	echo '-> generating config'
	touch ${FLUXCHAT_CONFIG}
	chmod go-rwx ${FLUXCHAT_CONFIG}
	envsubst < ./config-example.json > ${FLUXCHAT_CONFIG}
fi
if ! test -f ${FLUXCHAT_DATA_DIR}/bootstrap.json; then
	echo '-> generating bootstrap'
	echo '[]' > ${FLUXCHAT_DATA_DIR}/bootstrap.json
fi
