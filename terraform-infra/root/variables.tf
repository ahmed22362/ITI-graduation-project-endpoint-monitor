variable "region" {
  description = "AWS region to deploy infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "EKS Cluster name"
  type        = string
}

variable "eks_version" {
  description = "EKS version to use"
  type        = string
  default     = "1.31"
}

# variable "tags" {
#   description = "Common tags for all resources"
#   type        = map(string)
# }
variable "tags" {
  type = map(string)
  default = {
    Environment = "dev"
    Project     = "endpoint-monitor"
  }
}

variable "project_name" {
  description = "Project name used for tagging resources"
  type        = string
  default     = "demo-project"
}

variable "db_name" {
  description = "Database name for RDS"
  type        = string
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
}

variable "db_password" {
  description = "Master password for RDS"
  type        = string
  sensitive   = true
}

variable "secret_name" {
  description = "Name for the AWS Secret Manager secret"
  type        = string
}
