# Security Group for Jenkins ALB
resource "aws_security_group" "jenkins_alb" {
  name_prefix = "${var.cluster_name}-jenkins-alb-"
  vpc_id      = aws_vpc.cluster_vpc.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-jenkins-alb-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for Jenkins NodePort (EKS worker nodes)
resource "aws_security_group" "jenkins_nodeport" {
  name_prefix = "${var.cluster_name}-jenkins-nodeport-"
  vpc_id      = aws_vpc.cluster_vpc.id

  ingress {
    description     = "Jenkins Web UI NodePort from ALB"
    from_port       = 30080
    to_port         = 30080
    protocol        = "tcp"
    security_groups = [aws_security_group.jenkins_alb.id]
  }

  ingress {
    description     = "Jenkins Agent NodePort from VPC"
    from_port       = 30050
    to_port         = 30050
    protocol        = "tcp"
    cidr_blocks     = [aws_vpc.cluster_vpc.cidr_block]
  }

  tags = {
    Name = "${var.cluster_name}-jenkins-nodeport-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Application Load Balancer for Jenkins
resource "aws_lb" "jenkins" {
  name               = "${var.cluster_name}-jenkins-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.jenkins_alb.id]
  subnets            = aws_subnet.public_subnets[*].id

  enable_deletion_protection = false

  tags = {
    Name = "${var.cluster_name}-jenkins-alb"
  }
}

# Target Group for Jenkins Web UI (NodePort)
resource "aws_lb_target_group" "jenkins_web" {
  name     = "${var.cluster_name}-jenkins-web"
  port     = 30080
  protocol = "HTTP"
  vpc_id   = aws_vpc.cluster_vpc.id
  target_type = "instance"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200,403"  # Jenkins login page returns 403 for anonymous users
    path                = "/login"
    port                = "30080"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name = "${var.cluster_name}-jenkins-web-tg"
  }
}

# Network Load Balancer for Jenkins Agent (TCP traffic)
resource "aws_lb" "jenkins_agent" {
  name               = "${var.cluster_name}-jenkins-agent-nlb"
  internal           = true  # Internal NLB for agent connections
  load_balancer_type = "network"
  subnets            = aws_subnet.private_subnets[*].id

  enable_deletion_protection = false

  tags = {
    Name = "${var.cluster_name}-jenkins-agent-nlb"
  }
}

# Target Group for Jenkins Agent (NodePort)
resource "aws_lb_target_group" "jenkins_agent" {
  name     = "${var.cluster_name}-jenkins-agent"
  port     = 30050
  protocol = "TCP"
  vpc_id   = aws_vpc.cluster_vpc.id
  target_type = "instance"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    port                = "30050"
    protocol            = "TCP"
    timeout             = 10
    unhealthy_threshold = 3
  }

  tags = {
    Name = "${var.cluster_name}-jenkins-agent-tg"
  }
}

# Listener for Jenkins Web UI (HTTP)
resource "aws_lb_listener" "jenkins_web_http" {
  load_balancer_arn = aws_lb.jenkins.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.jenkins_web.arn
  }
}

# Optional: HTTPS Listener (uncomment and add SSL certificate ARN)
# resource "aws_lb_listener" "jenkins_web_https" {
#   load_balancer_arn = aws_lb.jenkins.arn
#   port              = "443"
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
#   certificate_arn   = "arn:aws:acm:region:account:certificate/certificate-id"
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.jenkins_web.arn
#   }
# }

# Listener for Jenkins Agent (TCP)
resource "aws_lb_listener" "jenkins_agent" {
  load_balancer_arn = aws_lb.jenkins_agent.arn
  port              = "50000"
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.jenkins_agent.arn
  }
}

# Data source to get the Auto Scaling Group created by EKS node group
data "aws_autoscaling_group" "eks_nodes" {
  name = aws_eks_node_group.eks_nodes.resources[0].autoscaling_groups[0].name
  depends_on = [aws_eks_node_group.eks_nodes]
}

# Auto Scaling Group attachment for Jenkins Web UI target group
resource "aws_autoscaling_attachment" "jenkins_web" {
  autoscaling_group_name = data.aws_autoscaling_group.eks_nodes.name
  lb_target_group_arn    = aws_lb_target_group.jenkins_web.arn

  depends_on = [
    aws_eks_node_group.eks_nodes,
    aws_lb_target_group.jenkins_web
  ]
}

# Auto Scaling Group attachment for Jenkins Agent target group
resource "aws_autoscaling_attachment" "jenkins_agent" {
  autoscaling_group_name = data.aws_autoscaling_group.eks_nodes.name
  lb_target_group_arn    = aws_lb_target_group.jenkins_agent.arn

  depends_on = [
    aws_eks_node_group.eks_nodes,
    aws_lb_target_group.jenkins_agent
  ]
}