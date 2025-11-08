output "ebs_csi_policy_attachment_id" {
  value = aws_iam_role_policy_attachment.eks-demo-ng-EBS_CSI-policy.id
}
<<<<<<< HEAD
=======
# output "eks_node_sg_id" {
#   value = aws_security_group.eks_nodes_sg.id
#   description = "Security group ID for the EKS nodes"
# }
>>>>>>> e33acf5 (adding the rds + secrets infra)
