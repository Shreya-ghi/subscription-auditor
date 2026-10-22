pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                bat '"D:\\projects\\subscription-auditor\\.venv\\Scripts\\python.exe" -m pytest backend\\tests -v'
            }
        }

        stage('Frontend Lint') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run lint'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    bat 'npm run test:run'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'All CI stages passed!'
        }
        failure {
            echo 'CI pipeline failed. Check the stage logs.'
        }
    }
}
