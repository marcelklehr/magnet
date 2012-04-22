VER = $(shell cat version.txt)
DATE = $(shell git log -1 --pretty=format:%ad)
CHLOG = $(git log --no-merges --date=short --format=format:"%ad: %an <%aE>: %s")

SRC_DIR = lib
BUILD_DIR = build
TEMP_DIR = temp

FERRITE_FILES = ${SRC_DIR}/ferrite/_header.template.js \
		${SRC_DIR}/ferrite/environment.js \
    ${SRC_DIR}/ferrite/typeFactory.js \
		${SRC_DIR}/ferrite/primalTypes.js \
		${SRC_DIR}/ferrite/node.js \
		${SRC_DIR}/ferrite/scope.js \
		${SRC_DIR}/ferrite/trace.js \
		${SRC_DIR}/ferrite/library.js \
		${TEMP_DIR}/parser.js \
		${SRC_DIR}/ferrite/exports.js

STDLIB_FILES = ${SRC_DIR}/stdlib/_header.template.js \
		${SRC_DIR}/stdlib/stdlib.js

CLI_FILES = ${SRC_DIR}/cli/_header.template.js \
		${SRC_DIR}/cli/cli.js

COMPILER_FILES = ${BUILD_DIR}/jscc.js \
		${BUILD_DIR}/jsccdriver_node.js_

all : changelog ferrite.js stdlib.js cli.js package.json

ferrite.js : ${FERRITE_FILES}
	@@echo "Building interpreter."
	@@cat ${FERRITE_FILES} | \
		sed "s/@VERSION/${VER}/" | \
		sed 's/@DATE/'"${DATE}"'/' \
		> ferrite.js

stdlib.js : ${STDLIB_FILES}
	@@echo "Building standart library."
	@@cat ${STDLIB_FILES} | \
		sed "s/@VERSION/${VER}/" | \
		sed 's/@DATE/'"${DATE}"'/' \
		> stdlib.js

cli.js : ${CLI_FILES}
	@@echo "Building command line tool."
	@@cat ${CLI_FILES} | \
		sed "s/@VERSION/${VER}/" | \
		sed 's/@DATE/'"${DATE}"'/' \
		> cli.js

${TEMP_DIR}/parser.js : ${SRC_DIR}/grammar.par ${COMPILER_FILES}
	@@echo "Compiling parser from grammar."
	@@mkdir -p ${TEMP_DIR}
	@@node ${BUILD_DIR}/jscc.js -t ${BUILD_DIR}/jsccdriver_node.js_ -o ${TEMP_DIR}/parser.js ${SRC_DIR}/grammar.par

package.json : version.txt ${BUILD_DIR}/package.template.json
	@@echo "Creating package file."
	@@sed "s/@VERSION/${VER}/" ${BUILD_DIR}/package.template.json > package.json

changelog : 
  #echo ${CHLOG} > CHANGELOG.TXT

tidy :
	@@echo "Cleaning temp directory."
	@@rm -f ${TEMP_DIR}/parser.js
clean : tidy
	@@echo "Cleaning up previous build."
	@@rm -f ferrite.js stdlib.js cli.js package.json ${TEMP_DIR}/parser.js CHANGELOG.TXT