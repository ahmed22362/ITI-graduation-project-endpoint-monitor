resource "aws_eks_node_group" "eks_nodes" {
  cluster_name    = var.cluster_name
  node_role_arn   = aws_iam_role.eks_nodes.arn
  node_group_name = "${var.cluster_name}-node-group"
  subnet_ids      = aws_subnet.private_subnets[*].id
  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }
  update_config {
    max_unavailable = 1
  }
  instance_types = [var.node_instance_type]
  capacity_type  = "ON_DEMAND"
  disk_size      = 20
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
    aws_eks_cluster.eks_cluster

  ]

  tags = {
    Name = "${var.cluster_name}-node-group"
  }
  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }
}
# Security group rules for Jenkins NodePort access
resource "aws_security_group_rule" "jenkins_web_nodeport" {
  type                     = "ingress"
  from_port                = 30080
  to_port                  = 30080
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.jenkins_alb.id
  security_group_id        = aws_eks_cluster.eks_cluster.vpc_config[0].cluster_security_group_id
  description              = "Allow ALB to access Jenkins Web UI NodePort"
}

resource "aws_security_group_rule" "jenkins_agent_nodeport" {
  type              = "ingress"
  from_port         = 30050
  to_port           = 30050
  protocol          = "tcp"
  cidr_blocks       = [aws_vpc.cluster_vpc.cidr_block]
  security_group_id = aws_eks_cluster.eks_cluster.vpc_config[0].cluster_security_group_id
  description       = "Allow internal NLB to access Jenkins Agent NodePort"
}