# 🚀 ITI Graduation Project: Endpoint Monitor with Full GitOps Pipeline on AWS


## 📋 Project Overview

A production-ready **Endpoint Monitoring System** deployed using a complete GitOps pipeline on AWS. This project demonstrates modern DevOps practices including Infrastructure as Code (IaC), continuous integration/deployment, container orchestration, and secure secrets management.

The system monitors web endpoints (URLs, APIs) for availability and performance, recording their status with a comprehensive monitoring dashboard.

### 🎯 Key Features

#### Application Features
- ✅ Real-time endpoint health monitoring
- ✅ Performance metrics collection
- ✅ Dark UI dashboard for status visualization
- ✅ Historical data tracking and analysis
- ✅ Redis caching for optimized performance
- ✅ MySQL persistence for monitoring history

#### DevOps & Infrastructure Features
- ✅ Automated AWS infrastructure provisioning with Terraform
- ✅ Kubernetes orchestration on Amazon EKS
- ✅ CI/CD pipeline with Jenkins
- ✅ GitOps deployment with ArgoCD
- ✅ Automated image updates with Argo Image Updater
- ✅ Secure secrets management with External Secrets Operator

---

## 🏗️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   AWS Cloud                                      │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                            VPC (10.0.0.0/16)                             │  │
│  │                                                                          │  │
│  │  ┌────────────────────────────────────────────────────────────────┐    │  │
│  │  │                      EKS Cluster                                │    │  │
│  │  │                                                                 │    │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │    │  │
│  │  │  │   ArgoCD    │  │   Jenkins   │  │External     │          │    │  │
│  │  │  │   (GitOps)  │  │    (CI)     │  │Secrets Op.  │          │    │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘          │    │  │
│  │  │                                                                 │    │  │
│  │  │  ┌───────────────────────────────────────────────────────┐    │    │  │
│  │  │  │              Application Namespace                     │    │    │  │
│  │  │  │                                                        │    │    │  │
│  │  │  │  ┌─────────────────────────────────────────────┐     │    │    │  │
│  │  │  │  │          Endpoint Monitor App                │     │    │    │  │
│  │  │  │  │                                              │     │    │    │  │
│  │  │  │  │  ┌───────────────────────────────────┐     │     │    │    │  │
│  │  │  │  │  │        Web UI Dashboard           │     │     │    │    │  │
│  │  │  │  │  │      (HTML/CSS/JS - Dark Theme)   │     │     │    │    │  │
│  │  │  │  │  └──────────────┬────────────────────┘     │     │    │    │  │
│  │  │  │  │                 │                           │     │    │    │  │
│  │  │  │  │  ┌──────────────▼────────────────────┐     │     │    │    │  │
│  │  │  │  │  │      Node.js Backend              │     │     │    │    │  │
│  │  │  │  │  │    Express API Server             │     │     │    │    │  │
│  │  │  │  │  │    - Health checks                │     │     │    │    │  │
│  │  │  │  │  │    - Metrics collection           │     │     │    │    │  │
│  │  │  │  │  │    - REST APIs                    │     │     │    │    │  │
│  │  │  │  │  └────┬─────────────────┬────────────┘     │     │    │    │  │
│  │  │  │  │       │                 │                   │     │    │    │  │
│  │  │  │  └───────┼─────────────────┼───────────────────┘     │    │    │  │
│  │  │  │          │                 │                          │    │    │  │
│  │  │  └──────────┼─────────────────┼──────────────────────────┘    │    │  │
│  │  │             │                 │                                │    │  │
│  │  └─────────────┼─────────────────┼────────────────────────────────┘    │  │
│  │                │                 │                                      │  │
│  │  ┌─────────────▼──────┐   ┌─────▼──────────┐                         │  │
│  │  │   RDS MySQL        │   │  ElastiCache   │                         │  │
│  │  │   (History DB)      │   │  Redis (Cache) │                         │  │
│  │  └─────────────────────┘   └────────────────┘                         │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐    │
│  │   ECR       │  │ Secrets      │  │  CloudWatch   │  │     Route53    │    │
│  │  (Images)   │  │  Manager     │  │  (Monitoring) │  │     (DNS)      │    │
│  └─────────────┘  └──────────────┘  └───────────────┘  └────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Application** | Node.js + Express | Backend API server for endpoint monitoring |
| **Frontend** | HTML/CSS/JavaScript | Dark theme dashboard for visualization |
| **Database** | AWS RDS (MySQL) | Stores monitoring history and configurations |
| **Cache** | AWS ElastiCache (Redis) | Accelerates API responses |
| **Container Platform** | AWS EKS | Kubernetes orchestration |
| **CI Pipeline** | Jenkins | Build, test, and package automation |
| **CD Pipeline** | ArgoCD | GitOps-based deployment |
| **Infrastructure** | Terraform | IaC for AWS resources |
| **Secrets** | External Secrets Operator | Secure credential management |
| **Registry** | AWS ECR | Container image storage |
| **Monitoring** | CloudWatch + Prometheus | System and application metrics |

---

## 🚦 Setup Instructions

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Terraform >= 1.5.0
- kubectl >= 1.27.0
- Docker installed
- Git
- Node.js >= 16.x (for local development)

### 🔧 Complete Setup Guide

#### Step 1: Clone the Repository

```bash
git clone https://github.com/ahmed22362/ITI-graduation-project-endpoint-monitor
cd ITI-graduation-project-endpoint-monitor
```

#### Step 2: Infrastructure Provisioning with Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init -backend-config=environments/dev/backend.tfvars

# Review the plan
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply infrastructure
terraform apply -var-file=environments/dev/terraform.tfvars -auto-approve

# Save the EKS cluster details
aws eks update-kubeconfig --region us-east-1 --name endpoint-monitor-cluster
```

This creates:
- VPC with public/private subnets across 3 AZs
- EKS cluster with managed node groups
- RDS MySQL instance
- ElastiCache Redis cluster
- ECR repository
- IAM roles and policies
- Security groups and NACLs

#### Step 3: Install Kubernetes Components

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets \
  external-secrets/external-secrets \
  -n external-secrets-system \
  --create-namespace

# Install metrics server (for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### Step 4: Configure Jenkins

```bash
# Deploy Jenkins to EKS
kubectl apply -f kubernetes/jenkins/

# Get Jenkins admin password
kubectl exec -n jenkins jenkins-0 -- cat /var/jenkins_home/secrets/initialAdminPassword

# Access Jenkins UI (port-forward or through LoadBalancer)
kubectl port-forward -n jenkins svc/jenkins 8080:8080
```

#### Step 5: Setup Application Secrets

```bash
# Create secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name endpoint-monitor/mysql \
  --secret-string '{"username":"admin","password":"SecurePass123!","host":"mysql.rds.amazonaws.com"}'

aws secretsmanager create-secret \
  --name endpoint-monitor/redis \
  --secret-string '{"password":"RedisPass123!","host":"redis.cache.amazonaws.com"}'

# Apply External Secret configuration
kubectl apply -f kubernetes/external-secrets/
```

#### Step 6: Deploy the Application

```bash
# Using kubectl directly
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/deployments/
kubectl apply -f kubernetes/services/

# OR using ArgoCD (recommended)
kubectl apply -f kubernetes/argocd-apps/endpoint-monitor-app.yaml
```

#### Step 7: Configure DNS and Access

```bash
# Get the LoadBalancer URL
kubectl get svc endpoint-monitor-ui -n production

# Update Route53 or your DNS provider with the LoadBalancer endpoint
# Access the application at: https://monitor.yourdomain.com
```

### 🐳 Local Development Setup

For development and testing locally:

```bash
# Start MySQL and Redis with Docker Compose
docker-compose up -d

# Install Node.js dependencies
cd node-app
npm install

# Set environment variables
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=password
export REDIS_HOST=localhost
export REDIS_PORT=6379

# Run the application
npm start

# Access at http://localhost:3000
```

---

## 📈 CI/CD Flow Explanation

### Complete GitOps Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CI/CD Pipeline Flow                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Developer → GitHub → Jenkins → ECR → ArgoCD → EKS Cluster
    │         │         │        │       │         │
    │         │         │        │       │         └─► Application Running
    │         │         │        │       │
    │         │         │        │       └─► Argo Image Updater
    │         │         │        │           (Auto-sync new images)
    │         │         │        │
    │         │         │        └─► Docker Registry (ECR)
    │         │         │            Push tagged images
    │         │         │
    │         │         └─► Build Pipeline
    │         │             1. Checkout code
    │         │             2. Run tests
    │         │             3. Build Docker image
    │         │             4. Security scanning
    │         │             5. Push to ECR
    │         │             6. Update manifests
    │         │
    │         └─► Webhook triggers Jenkins
    │
    └─► Git push/merge to main branch
```


## Project Structure 

```
endpoint-monitor-gitops/
│
├── README.md   •  LICENSE   •  .gitignore   •  docker-compose.yml
│
├── node-app/
│     → package.json   •   server.js   •   Dockerfile
│     → src/ (controllers • models • routes • services)
│     → public/ (index.html • css/ • js/)
│
├── terraform/
│     → main.tf • variables.tf • outputs.tf
│     → modules/ (vpc • eks • rds • redis)
│     → environments/ (dev • staging • production)
│
├── kubernetes/
│     → base/ (namespace.yaml • deployment.yaml • service.yaml • configmap.yaml)
│     → overlays/ (dev • staging • production)
│     → argocd-apps/ (endpoint-monitor.yaml)
│
├── jenkins/
│     → Jenkinsfile
│     → scripts/ (build.sh • test.sh • deploy.sh)
│
├── scripts/
│     → setup-cluster.sh • install-tools.sh • cleanup.sh
│
└── docs/
      → ARCHITECTURE.md • SECURITY.md • MONITORING.md • TROUBLESHOOTING.md
```


## Solved Issues (Compacted)

### **1. ArgoCD Image Updater Not Detecting New Images**
**Cause:** Incorrect update strategy and mismatched tag regex pattern.  
**Solution:** Fixed update strategy and corrected regex to match actual tag format.

### **2. GitHub Authentication Failed (Wrong Secret Format)**
**Cause:** GitHub token stored as a key/value JSON object instead of plain text.  
**Solution:** Recreated secret as raw text and updated CI workflow.

### **3. ArgoCD Could Not Authenticate to ECR**
**Cause:** Missing IAM permissions for private ECR access.  
**Solution:** Added IRSA + ECR access policy for ArgoCD.

---



