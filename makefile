VER = $(shell cat version.txt)
COMMIT = $(shell git log -1 --pretty=format:%H)

SRC_DIR = lib
JSCC_DIR = jscc
BUILD_DIR = build
BIN_DIR = bin
TEMP_DIR = temp
OUT_DIR = .

FERRITE_TYPES = ${SRC_DIR}/ferrite/type_nil.js \
		${SRC_DIR}/ferrite/type_object.js \
		${SRC_DIR}/ferrite/type_boolean.js \
		${SRC_DIR}/ferrite/type_string.js \
		${SRC_DIR}/ferrite/type_list.js \
		${SRC_DIR}/ferrite/type_integer.js \
		${SRC_DIR}/ferrite/type_float.js \
		${SRC_DIR}/ferrite/type_function.js

FERRITE_FILES = ${SRC_DIR}/ferrite/_header.template.js \
		${SRC_DIR}/ferrite/utility.js \
		${FERRITE_TYPES} \
    ${SRC_DIR}/ferrite/node.js \
		${SRC_DIR}/ferrite/environment.js \
		${SRC_DIR}/ferrite/scope.js \
		${SRC_DIR}/ferrite/error.js \
		${SRC_DIR}/ferrite/library.js \
		${TEMP_DIR}/parser.js \
		${SRC_DIR}/ferrite/exports.js

STDLIB_FILES = ${SRC_DIR}/stdlib/_header.template.js \
		${SRC_DIR}/stdlib/stdlib.js

CLI_FILES = ${SRC_DIR}/cli/_header.template.js \
		${SRC_DIR}/cli/cli.js

COMPILER_FILES = ${JSCC_DIR}/jscc.js \
		${JSCC_DIR}/jsccdriver_node.js_

all : ${OUT_DIR} ${OUT_DIR}/ferrite.js ${OUT_DIR}/stdlib.js ${OUT_DIR}/${BIN_DIR}/magnet ${OUT_DIR}/package.json ${OUT_DIR}/CHANGELOG.TXT

${OUT_DIR} :
	@@mkdir -p ${OUT_DIR}

${OUT_DIR}/ferrite.js : ${FERRITE_FILES}
	@@echo "Building interpreter."
	@@cat ${FERRITE_FILES} | \
		sed "s/@VERSION/${VER}/" | \
		sed 's/@COMMIT/'"${COMMIT}"'/' \
		> ${OUT_DIR}/ferrite.js

${OUT_DIR}/stdlib.js : ${STDLIB_FILES}
	@@echo "Building standart library."
	@@cat ${STDLIB_FILES} | \
		sed "s/@VERSION/${VER}/" | \
		sed 's/@COMMIT/'"${COMMIT}"'/' \
		> ${OUT_DIR}/stdlib.js

${OUT_DIR}/${BIN_DIR}/magnet : ${CLI_FILES}
	@@echo "Building command line tool."
	@@mkdir -p ${BIN_DIR}
	@@cat ${CLI_FILES} | \
		sed "s/@VERSION/${VER}/" | \
		sed 's/@COMMIT/'"${COMMIT}"'/' \
		> ${OUT_DIR}/${BIN_DIR}/magnet

${TEMP_DIR}/parser.js : ${SRC_DIR}/grammar.par ${COMPILER_FILES}
	@@echo "Compiling parser from grammar."
	@@mkdir -p ${TEMP_DIR}
	@@node ${JSCC_DIR}/jscc.js -t ${JSCC_DIR}/jsccdriver_node.js_ -o ${TEMP_DIR}/parser.js ${SRC_DIR}/grammar.par

${OUT_DIR}/package.json : version.txt ${BUILD_DIR}/package.template.json
	@@echo "Creating package file."
	@@sed "s/@VERSION/${VER}/" ${BUILD_DIR}/package.template.json > ${OUT_DIR}/package.json

${OUT_DIR}/CHANGELOG.TXT : 
	@@echo "Creating changelog."
	@@git log --no-merges --date=short --format=format:"%ad: %an <%aE>: %s" > ${OUT_DIR}/CHANGELOG.TXT
  
debug : 
	@@echo "Compiling parser from grammar in debug mode."
	@@mkdir -p ${TEMP_DIR}
	@@node ${JSCC_DIR}/jscc.js -v -w -t ${JSCC_DIR}/jsccdriver_node.js_ -o ${TEMP_DIR}/parser.js ${SRC_DIR}/grammar.par

tidy :
	@@echo "Cleaning temp directory."
	@@rm -f ${TEMP_DIR}/parser.js
clean : tidy
	@@echo "Cleaning up previous build."
	@@rm -f ${OUT_DIR}/ferrite.js ${OUT_DIR}/stdlib.js ${OUT_DIR}/${BIN_DIR}/magnet ${OUT_DIR}/package.json ${TEMP_DIR}/parser.js ${OUT_DIR}/CHANGELOG.TXT