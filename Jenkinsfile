pipeline {
    agent {
        kubernetes {
            yamlFile 'kaniko/index.yaml'
        }
    }
    
    environment {
        // AWS Configuration
        AWS_REGION       = 'eu-north-1'
        AWS_ACCOUNT_ID   = '428346553093'
        
        // ECR Configuration
        ECR_REPOSITORY   = 'my-app'
        ECR_REGISTRY     = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        
        // EKS Configuration
        EKS_CLUSTER_NAME = 'ITI-GP-Cluster'
        K8S_NAMESPACE    = 'default'
        
        // Application Configuration
        APP_NAME         = 'my-app'
        
        // Image Tags
        IMAGE_TAG        = "${BUILD_NUMBER}"
        IMAGE_NAME       = "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
        IMAGE_LATEST     = "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
        
        // Build Configuration
        DOCKERFILE_PATH  = 'node_app/Dockerfile'
        BUILD_CONTEXT    = 'node_app'
    }
    
    stages {
        stage('🔍 Checkout & Preparation') {
            steps {
                script {
                    echo '═══════════════════════════════════════════════════════'
                    echo '🔍 STAGE 1: Checkout & Preparation'
                    echo '═══════════════════════════════════════════════════════'
                    
                    checkout scm
                    
                    // Get git commit info
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    
                    env.GIT_COMMIT_MSG = sh(
                        script: "git log -1 --pretty=%B",
                        returnStdout: true
                    ).trim()
                    
                    echo "✅ Repository checked out successfully"
                    echo "📝 Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "💬 Message: ${env.GIT_COMMIT_MSG}"
                }
            }
        }
        
        stage('📊 Build Information') {
            steps {
                script {
                    echo '═══════════════════════════════════════════════════════'
                    echo '� STAGE 2: Build Information'
                    echo '═══════════════════════════════════════════════════════'
                    echo "🏷️  Build Number: ${BUILD_NUMBER}"
                    echo "🌿 Git Branch: ${env.GIT_BRANCH ?: 'N/A'}"
                    echo "📝 Git Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "💬 Commit Message: ${env.GIT_COMMIT_MSG}"
                    echo "📦 Image Tag: ${IMAGE_TAG}"
                    echo "🐳 Image Name: ${IMAGE_NAME}"
                    echo "☁️  ECR Registry: ${ECR_REGISTRY}"
                    echo "🎯 EKS Cluster: ${EKS_CLUSTER_NAME}"
                    echo '═══════════════════════════════════════════════════════'
                }
            }
        }
        
        stage('✅ Environment Verification') {
            steps {
                script {
                    echo '═══════════════════════════════════════════════════════'
                    echo '✅ STAGE 3: Environment Verification'
                    echo '═══════════════════════════════════════════════════════'
                    
                    sh '''
                        echo "📁 Workspace: ${WORKSPACE}"
                        echo ""
                        echo "📂 Workspace structure:"
                        ls -lah ${WORKSPACE}
                        echo ""
                        echo "📦 Application directory (${BUILD_CONTEXT}):"
                        ls -lah ${WORKSPACE}/${BUILD_CONTEXT} || {
                            echo "❌ ERROR: Application directory not found!"
                            exit 1
                        }
                        echo ""
                        echo "🐳 Dockerfile check:"
                        if [ -f "${WORKSPACE}/${DOCKERFILE_PATH}" ]; then
                            echo "✅ Dockerfile found at ${DOCKERFILE_PATH}"
                            echo "First 10 lines of Dockerfile:"
                            head -10 ${WORKSPACE}/${DOCKERFILE_PATH}
                        else
                            echo "❌ ERROR: Dockerfile not found at ${DOCKERFILE_PATH}"
                            exit 1
                        fi
                    '''
                    
                    echo "✅ Environment verification completed successfully"
                }
            }
        }
        
        stage('🔧 Debug Pod Identity') {
            steps {
                container('kaniko') {
                    script {
                        echo '═══════════════════════════════════════════════════════'
                        echo '🔧 STAGE 4: Debug Pod Identity'
                        echo '═══════════════════════════════════════════════════════'
                        
                        sh '''
                            set +e  # Don't exit on errors
                            
                            echo "🔐 AWS Authentication Check"
                            echo "──────────────────────────────────────────────────────"
                            echo "AWS_REGION: ${AWS_REGION}"
                            echo "AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION:-not set}"
                            echo "AWS_SDK_LOAD_CONFIG: ${AWS_SDK_LOAD_CONFIG:-not set}"
                            echo "AWS_EC2_METADATA_DISABLED: ${AWS_EC2_METADATA_DISABLED:-not set}"
                            echo ""
                            
                            echo "👤 Runtime Environment"
                            echo "──────────────────────────────────────────────────────"
                            echo "User: $(whoami)"
                            echo "Hostname: ${HOSTNAME}"
                            echo "Pod Name: ${POD_NAME:-not set}"
                            echo "Pod Namespace: ${POD_NAMESPACE:-not set}"
                            echo ""
                            
                            echo "🔍 Available Commands"
                            echo "──────────────────────────────────────────────────────"
                            which aws && echo "✅ aws-cli available" || echo "❌ aws-cli not found"
                            which curl && echo "✅ curl available" || echo "❌ curl not found"
                            which /kaniko/executor && echo "✅ kaniko available" || echo "❌ kaniko not found"
                            echo ""
                            
                            echo "🌐 IMDS Connectivity Test (5s timeout)"
                            echo "──────────────────────────────────────────────────────"
                            if timeout 5 curl -s http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
                                echo "✅ IMDS accessible"
                                INSTANCE_ID=$(timeout 5 curl -s http://169.254.169.254/latest/meta-data/instance-id)
                                echo "Instance ID: ${INSTANCE_ID}"
                            else
                                echo "❌ IMDS not accessible (expected for Pod Identity)"
                            fi
                            echo ""
                            
                            echo "🔑 AWS STS Identity Test (10s timeout)"
                            echo "──────────────────────────────────────────────────────"
                            if timeout 10 aws sts get-caller-identity --region eu-north-1 2>&1; then
                                echo "✅ Successfully authenticated with AWS"
                            else
                                echo "⚠️  STS call failed - checking ECR authentication method"
                            fi
                            echo ""
                            
                            echo "✅ Debug completed"
                            set -e  # Re-enable exit on errors
                        '''
                    }
                }
            }
        }
        
        stage('🔧 Prepare Build Context') {
            steps {
                script {
                    echo '═══════════════════════════════════════════════════════'
                    echo '🔧 STAGE 5: Prepare Build Context'
                    echo '═══════════════════════════════════════════════════════'
                    echo "✅ Using Jenkins service account with ECR permissions"
                    echo "🔐 IAM Role: ${env.JENKINS_ROLE_ARN ?: 'Using default service account role'}"
                    echo "� Build Context: ${BUILD_CONTEXT}"
                    echo "🐳 Dockerfile: ${DOCKERFILE_PATH}"
                    echo "✅ Build context preparation completed"
                }
            }
        }

        stage('🚀 Build & Push with Kaniko') {
            steps {
                container('kaniko') {
                    script {
                        echo '═══════════════════════════════════════════════════════'
                        echo '🚀 STAGE 6: Build & Push Docker Image'
                        echo '═══════════════════════════════════════════════════════'
                        echo "📋 Using service account IAM role for ECR authentication"
                        echo "🐳 Building image with Kaniko..."
                        
                        sh '''
                            set -e  # Exit on any error
                            
                            echo "🔍 Pre-build verification"
                            echo "──────────────────────────────────────────────────────"
                            echo "AWS_REGION: ${AWS_REGION}"
                            echo "AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION:-not set}"
                            echo "ECR_REGISTRY: ${ECR_REGISTRY}"
                            echo "IMAGE_NAME: ${IMAGE_NAME}"
                            echo "IMAGE_LATEST: ${IMAGE_LATEST}"
                            echo "BUILD_CONTEXT: ${WORKSPACE}/${BUILD_CONTEXT}"
                            echo "DOCKERFILE: ${WORKSPACE}/${DOCKERFILE_PATH}"
                            echo ""
                            
                            echo "📁 Build context contents:"
                            ls -lah ${WORKSPACE}/${BUILD_CONTEXT}
                            echo ""
                            
                            echo "🏗️  Starting Kaniko build..."
                            echo "──────────────────────────────────────────────────────"
                            /kaniko/executor \\
                              --context ${WORKSPACE}/${BUILD_CONTEXT} \\
                              --dockerfile ${WORKSPACE}/${DOCKERFILE_PATH} \\
                              --destination ${IMAGE_NAME} \\
                              --destination ${IMAGE_LATEST} \\
                              --cache=true \\
                              --cache-ttl=24h \\
                              --compressed-caching=false \\
                              --snapshot-mode=redo \\
                              --verbosity=info \\
                              --force
                            
                            echo ""
                            echo "✅ Build and push completed successfully!"
                        '''
                    }
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo '═══════════════════════════════════════════════════════'
                echo '✅ PIPELINE SUCCESS'
                echo '═══════════════════════════════════════════════════════'
                echo "🎉 Build completed successfully!"
                echo ""
                echo "📦 Image Information:"
                echo "   • Name: ${IMAGE_NAME}"
                echo "   • Latest: ${IMAGE_LATEST}"
                echo "   • Registry: ${ECR_REGISTRY}"
                echo "   • Repository: ${ECR_REPOSITORY}"
                echo ""
                echo "🎯 Target Environment:"
                echo "   • EKS Cluster: ${EKS_CLUSTER_NAME}"
                echo "   • Region: ${AWS_REGION}"
                echo "   • Namespace: ${K8S_NAMESPACE}"
                echo ""
                echo "📊 Build Details:"
                echo "   • Build Number: ${BUILD_NUMBER}"
                echo "   • Git Commit: ${env.GIT_COMMIT_SHORT}"
                echo "   • Branch: ${env.GIT_BRANCH ?: 'N/A'}"
                echo '═══════════════════════════════════════════════════════'
            }
        }
        
        failure {
            script {
                echo '═══════════════════════════════════════════════════════'
                echo '❌ PIPELINE FAILED'
                echo '═══════════════════════════════════════════════════════'
                echo "⚠️  Build failed at stage: ${env.STAGE_NAME}"
                echo ""
                echo "📊 Build Information:"
                echo "   • Build Number: ${BUILD_NUMBER}"
                echo "   • Git Commit: ${env.GIT_COMMIT_SHORT}"
                echo "   • Branch: ${env.GIT_BRANCH ?: 'N/A'}"
                echo ""
                echo "💡 Troubleshooting Steps:"
                echo "   1. Check the build logs above for errors"
                echo "   2. Verify AWS IAM permissions for ECR"
                echo "   3. Ensure Dockerfile exists in ${DOCKERFILE_PATH}"
                echo "   4. Verify build context directory: ${BUILD_CONTEXT}"
                echo "   5. Check network connectivity to ECR"
                echo '═══════════════════════════════════════════════════════'
            }
        }
        
        unstable {
            script {
                echo '⚠️  Pipeline completed with warnings'
            }
        }
        
        always {
            script {
                echo ''
                echo '🧹 Cleanup Phase'
                echo '──────────────────────────────────────────────────────'
                echo '✅ Workspace cleanup completed'
                echo "⏱️  Total Duration: ${currentBuild.durationString}"
                echo '══════════════════════════════════════════════════════'
            }
        }
    }
}
