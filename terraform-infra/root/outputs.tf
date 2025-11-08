output "cluster_endpoint" {
  value = module.eks.eks-cluster-endpoint
}

output "cluster_ca" {
  value = module.eks.eks-cluster-CA
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "bastion_public_ip" {
  value = module.jump_server.bastion_public_ip
}

output "rds_secret_arn" {
  value = module.secret_manager.rds_secret_arn
}
