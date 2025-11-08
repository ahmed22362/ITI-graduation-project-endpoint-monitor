<<<<<<< HEAD
=======
variable "vpc-id" {
  type = string
}
>>>>>>> e33acf5 (adding the rds + secrets infra)
variable "cluster_name" {
  type = string
  default = "demo-eks-cluster"
  description = "EKS cluster name"
}

variable "tags" {
    type = map(string)
}
variable "private-subnet-1" {
  type = string
}
variable "private-subnet-2" {
  type = string
}
variable "launch-template-name" {
  type = string
}
variable "launch-template-version" {
  type = string
}
variable "launch-template-id" {
  type = string
}