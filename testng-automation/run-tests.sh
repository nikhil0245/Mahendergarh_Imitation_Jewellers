#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

export JAVA_HOME="$ROOT_DIR/.tools/jdk/temurin-21/Contents/Home"
export PATH="$JAVA_HOME/bin:$ROOT_DIR/.tools/maven/apache-maven-3.9.15/bin:$PATH"

if [ -f "$ROOT_DIR/.tools/hosts" ]; then
  export MAVEN_OPTS="${MAVEN_OPTS:-} -Djdk.net.hosts.file=$ROOT_DIR/.tools/hosts"
fi

cd "$SCRIPT_DIR"
if [ "$#" -eq 0 ]; then
  mvn test
else
  mvn "$@"
fi
