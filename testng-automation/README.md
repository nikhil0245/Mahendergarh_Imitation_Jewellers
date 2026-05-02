# TestNG Automation

This folder is for Java TestNG automation tests for the MERN ecommerce project.

## Local Tools

The project has been prepared to use local tools under the repo root:

- JDK: `../.tools/jdk/temurin-21/Contents/Home`
- Maven: `../.tools/maven/apache-maven-3.9.15/bin/mvn`
- ChromeDriver: `../.tools/chromedriver/chromedriver-mac-arm64/chromedriver`

## Run Tests

From the repository root:

```bash
./testng-automation/run-tests.sh
```

Or manually:

```bash
cd testng-automation
JAVA_HOME="../.tools/jdk/temurin-21/Contents/Home" \
MAVEN_OPTS="-Djdk.net.hosts.file=../.tools/hosts" \
../.tools/maven/apache-maven-3.9.15/bin/mvn test
```

## Useful Options

```bash
./testng-automation/run-tests.sh -DbaseUrl=http://localhost:3000
./testng-automation/run-tests.sh -Dheadless=true
```

## Added Test Cases

The current suite is in:

```text
src/test/java/com/mij/tests/ProjectAutomationTest.java
```

It includes these 7 TestNG automation checks:

1. Frontend stack should be configured
2. Backend stack should be configured
3. Backend API route files should exist
4. Docker Compose should define frontend and backend services
5. GitHub Actions workflow should be configured
6. Jenkins pipeline should have Docker stages
7. Frontend routes should be configured

After execution, TestNG generates reports in:

```text
target/surefire-reports/
```

Main report files:

```text
target/surefire-reports/emailable-report.html
target/surefire-reports/index.html
```
