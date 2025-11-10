pipeline {
    agent {
        kubernetes {
            yamlFile 'kaniko/index.yaml'
        }
    }
    
    environment {
        AWS_REGION       = 'eu-north-1'
        AWS_ACCOUNT_ID   = '428346553093'
        ECR_REPOSITORY   = 'my-app'
        ECR_REGISTRY     = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        EKS_CLUSTER_NAME = 'ITI-GP-Cluster'
        IMAGE_TAG        = "${BUILD_NUMBER}"
        IMAGE_NAME       = "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
        IMAGE_LATEST     = "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
        K8S_NAMESPACE    = 'default'
        APP_NAME         = 'my-app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔍 Checking out code from repository...'
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Build Info') {
            steps {
                echo "📦 Building image: ${IMAGE_NAME}"
                echo "🌿 Git Branch: ${env.GIT_BRANCH ?: 'N/A'}"
                echo "📝 Git Commit: ${env.GIT_COMMIT_SHORT}"
                echo "🏗️ Build Number: ${BUILD_NUMBER}"
            }
        }

        stage('Prepare ECR Auth Config') {
            steps {
                withAWS(region: "${env.AWS_REGION}", credentials: 'AWS') {
                    script {
                        echo "🔐 Generating ECR credentials for Kaniko..."

                        sh """
                        mkdir -p /kaniko/.docker
                        aws ecr get-login-password --region ${AWS_REGION} | \\
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        mkdir -p ~/.docker
                        cat ~/.docker/config.json > /kaniko/.docker/config.json || true
                        """
                    }
                }
            }
        }

        stage('Build & Push with Kaniko') {
            steps {
                container('kaniko') {
                    script {
                        echo "� Building and pushing image with Kaniko..."
                        echo "📋 Using pre-configured Docker auth from previous stage"
                        
                        sh '''
                            echo "Verifying Kaniko auth config..."
                            ls -la /kaniko/.docker/ || echo "No auth config found, will use IAM role"
                            
                            echo "Starting Kaniko build..."
                            /kaniko/executor \\
                              --context ${WORKSPACE}/node_app \\
                              --dockerfile ${WORKSPACE}/node_app/Dockerfile \\
                              --destination ${IMAGE_NAME} \\
                              --destination ${IMAGE_LATEST} \\
                              --use-new-run \\
                              --cache=true \\
                              --single-snapshot \\
                              --verbosity=info
                        '''
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ ====================================='
            echo '✅ Pipeline completed successfully!'
            echo '✅ ====================================='
            echo "📦 Image: ${IMAGE_NAME}"
            echo "☁️ ECR: ${ECR_REGISTRY}/${ECR_REPOSITORY}"
            echo "🚀 Deployed to EKS: ${EKS_CLUSTER_NAME}"
        }
        
        failure {
            echo '❌ ====================================='
            echo '❌ Pipeline failed!'
            echo '❌ ====================================='
        }
        
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
    }
}
