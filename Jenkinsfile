pipeline {
    agent any
    
    environment {
        // AWS Configuration
        AWS_REGION = 'eu-north-1'
        AWS_ACCOUNT_ID = '428346553093'
        ECR_REPOSITORY = 'my-app'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        EKS_CLUSTER_NAME = 'ITI-GP-Cluster'
        
        // Image configuration
        IMAGE_TAG = "${BUILD_NUMBER}"
        IMAGE_NAME = "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
        IMAGE_LATEST = "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
        
        // Kubernetes namespace
        K8S_NAMESPACE = 'default'
        APP_NAME = 'my-app'
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
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo '🐳 Building Docker image...'
                    sh """
                        docker build -t ${IMAGE_NAME} -t ${IMAGE_LATEST} .
                        docker images | grep ${ECR_REPOSITORY}
                    """
                }
            }
        }
        
        stage('Test Image') {
            steps {
                script {
                    echo '🧪 Testing Docker image...'
                    sh """
                        # Run container
                        docker run -d --name test-container-${BUILD_NUMBER} -p 3001:3000 ${IMAGE_NAME}
                        
                        # Wait for container
                        sleep 10
                        
                        # Test health endpoint
                        echo "Testing health endpoint..."
                        curl -f http://localhost:3001/health || exit 1
                        
                        # Test main endpoint
                        echo "Testing main endpoint..."
                        curl -f http://localhost:3001/ || exit 1
                        
                        echo "✅ Tests passed!"
                        
                        # Cleanup
                        docker stop test-container-${BUILD_NUMBER}
                        docker rm test-container-${BUILD_NUMBER}
                    """
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                script {
                    echo '☁️ Pushing to Amazon ECR...'
                    withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                        sh """
                            # Login to ECR
                            aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin ${ECR_REGISTRY}
                            
                            # Push images
                            docker push ${IMAGE_NAME}
                            docker push ${IMAGE_LATEST}
                            
                            echo "✅ Successfully pushed to ECR"
                        """
                    }
                }
            }
        }
        
        stage('Deploy to EKS') {
            steps {
                script {
                    echo '🚀 Deploying to EKS...'
                    withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                        sh """
                            # Update kubeconfig
                            aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}
                            
                            # Create/update deployment
                            kubectl set image deployment/${APP_NAME} ${APP_NAME}=${IMAGE_NAME} -n ${K8S_NAMESPACE} || \
                            kubectl create deployment ${APP_NAME} --image=${IMAGE_NAME} -n ${K8S_NAMESPACE}
                            
                            # Expose service if not exists
                            kubectl expose deployment ${APP_NAME} --port=80 --target-port=3000 --type=ClusterIP -n ${K8S_NAMESPACE} || true
                            
                            # Wait for rollout
                            kubectl rollout status deployment/${APP_NAME} -n ${K8S_NAMESPACE} --timeout=5m
                            
                            # Show deployment info
                            kubectl get deployment ${APP_NAME} -n ${K8S_NAMESPACE}
                            kubectl get pods -n ${K8S_NAMESPACE} -l app=${APP_NAME}
                        """
                    }
                }
            }
        }
        
        stage('Cleanup Local Images') {
            steps {
                script {
                    echo '🧹 Cleaning up local Docker images...'
                    sh """
                        docker rmi ${IMAGE_NAME} || true
                        docker rmi ${IMAGE_LATEST} || true
                    """
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
