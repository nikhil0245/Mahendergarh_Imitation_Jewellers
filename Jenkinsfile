pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                echo 'Cloning...'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ecommerce-app .'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker stop ecommerce-container || true
                docker rm ecommerce-container || true
                docker run -d -p 3000:3000 --name ecommerce-container ecommerce-app
                '''
            }
        }

    }
}
