pipeline {
    agent any

    stages {
        stage('Clone Code') {
            steps {
                echo 'Cloning...'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
            }
        }

        stage('Run App') {
            steps {
                dir('backend') {
                    sh 'npm start &'
                }
            }
        }
    }
}
